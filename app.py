#!/usr/bin/env python
from flask import Flask, send_file, jsonify, request
import psycopg2
import json
import os
app = Flask(__name__, static_url_path='')

conn = psycopg2.connect(host="localhost",database="illinois_gis", user="postgres", password="admin")

# def db_connect():

@app.route('/')
def root():
    return send_file('html/index.html')

@app.route('/js/bundle.js')
def js():
    return send_file('js/bundle.js')

@app.route('/js/mapbox.js')
def mapbox():
    return send_file('js/mapbox.js')

@app.route('/js/ajaxcalls.js')
def ajax():
    return send_file('js/ajaxcalls.js')

@app.route('/css/custom.css')
def customstyle():
    return send_file('css/custom.css')

@app.route('/js/scripts.js')
def scripts():
    return send_file('js/scripts.js')

@app.route('/css/bulma.css')
def bulma():
    return send_file('node_modules/bulma/css/bulma.css')


# @app.route('/js/mapbox-gl.js')
# def mapboxgl():
#     return send_file('node_modules/mapbox-gl/dist/mapbox-gl.js')
# "SELECT ST_AsGeoJSON(ST_Transform(way, 4326)::geography) FROM planet_osm_line LIMIT 1"
@app.route('/points')
def points():
    latitude = request.args.get("latitude")    
    longitude = request.args.get("longitude")    
    curr = conn.cursor()

    query = "   SELECT name, amenity, building, ST_AsGeoJSON(ST_Transform(way, 4326)::geography) FROM planet_osm_point \
                WHERE ST_DWITHIN(ST_SetSRID(ST_MakePoint(%(longitude)f, %(latitude)f), 4326)::geography,ST_Transform(way, 4326)::geography,200) \
                AND name IS NOT NULL AND amenity IN ('fast_food', 'bar', 'restaurant', 'nightclub') \
                UNION ALL ( SELECT b.name, b.amenity, b.building, ST_AsGeoJSON(ST_Transform(b.way, 4326)::geography) FROM planet_osm_polygon b \
		                    WHERE ST_DWITHIN(ST_SetSRID(ST_MakePoint(%(longitude)f, %(latitude)f), 4326)::geography,ST_Transform(b.way, 4326)::geography,200) \
		                    AND (b.building = 'hospital' OR b.amenity = 'parking'))" % {'latitude': float(latitude), 'longitude': float(longitude)}

    curr.execute(query)
    
    rows = curr.fetchall()
    print(rows)
    return jsonify(rows)

@app.route('/beats')
def beats():
    pass

if __name__ == "__main__":
    app.run()
    # db_connect()



# json_build_object(\
# 		'type', 'Feature',\
# 		'geometry', ST_AsGeoJSON(ST_Transform(way, 4326)::geography),\
# 		'name', name,\
# 		'amenity', amenity\
# 		)\