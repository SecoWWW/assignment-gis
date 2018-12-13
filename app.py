#!/usr/bin/env python
from flask import Flask, send_file, jsonify, request
import psycopg2
import json
import os
app = Flask(__name__, static_url_path='')

conn = psycopg2.connect(host="localhost",database="illinois_gis", user="postgres", password="admin")

@app.route('/')
def root():
    return send_file('html/index.html')

@app.route('/js/bundle.js')
def js():
    return send_file('js/bundle.js')

@app.route('/js/mapbox.js')
def mapbox():
    return send_file('js/mapbox.js')


@app.route('/css/custom.css')
def customstyle():
    return send_file('css/custom.css')


@app.route('/css/bulma.css')
def bulma():
    return send_file('node_modules/bulma/css/bulma.css')


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
    return jsonify(rows)

@app.route('/beats')
def beats():
    curr = conn.cursor()
    query = "   SELECT b.beat_num, SUM(cd.crimes_count), ST_AsGeoJSON(ST_SetSRID(b.geom, 4326)::geography) FROM chicago_beats b\
                INNER JOIN crime_data AS cd ON cd.beat = TRIM (LEADING '0' FROM b.beat_num)\
                GROUP BY b.beat_num, b.geom"
    curr.execute(query)
    rows = curr.fetchall()    
    return jsonify(rows)

@app.route('/water')
def water():
    latitude1 = request.args.get("latitude1")    
    longitude1 = request.args.get("longitude1") 

    latitude2 = request.args.get("latitude2")    
    longitude2 = request.args.get("longitude2") 

    curr = conn.cursor()
    query = "   SELECT d.name, d.waterway, d.natural, ST_AsGeoJSON(ST_Transform(d.way, 4326)::geography) FROM planet_osm_polygon d\
                WHERE (d.waterway IN ('river', 'stream', 'canal', 'ditch') OR d.natural IN ('water', 'wetland', 'bay'))\
                AND ST_Intersects(ST_Transform(ST_MakeLine( ST_SetSRID(ST_MakePoint(%(longitude1)f, %(latitude1)f), 4326), \
                                                            ST_SetSRID(ST_MakePoint(%(longitude2)f, %(latitude2)f), 4326)), 3857), d.way)	\
                UNION ALL (SELECT b.name, b.waterway, b.natural, ST_AsGeoJSON(ST_Transform(b.way, 4326)::geography) FROM planet_osm_line b\
                WHERE (b.waterway IN ('river', 'stream', 'canal', 'ditch') OR b.natural IN ('water', 'wetland', 'bay'))\
                AND ST_Intersects(ST_Transform(ST_MakeLine( ST_SetSRID(ST_MakePoint(%(longitude1)f, %(latitude1)f), 4326), \
                                                            ST_SetSRID(ST_MakePoint(%(longitude2)f, %(latitude2)f), 4326)), 3857), b.way \
                                                            ))" % {'latitude1': float(latitude1), 'longitude1': float(longitude1), 'latitude2': float(latitude2), 'longitude2': float(longitude2)}
    curr.execute(query)
    rows = curr.fetchall()    
    return jsonify(rows)

if __name__ == "__main__":
    app.run()
    