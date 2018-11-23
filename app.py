#!/usr/bin/env python
from flask import Flask, send_file
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

@app.route('/data')
def connection():
    curr = conn.cursor()
    curr.execute("SELECT ST_AsGeoJSON(ST_Transform(way, 4326)::geography) FROM planet_osm_line LIMIT 1")
    rows = curr.fetchone()[0]
    return rows
    # for row in rows:
    #     fuck += row
    # cur.close()
    # return fuck
    




if __name__ == "__main__":
    app.run()
    # db_connect()
