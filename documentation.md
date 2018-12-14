# Overview

This application helps policemen do their jobs more effectively, and show the policemen some statistics about their beats. The functionalities implemented in this application are:
- search bars, fast-foods, restaurants, nightlubs, parking lots and hospitals by proximity of your location
- Show chloroperth map, which shows arrests made by beat
- find all the water objects between two markers, which is created if the policemen are looking for a suspect
- This application works only in state of Illinois, and city of Chicago

This is it in action:

![Screenshot](screenshot.png)

The application has 2 separate parts, the client which is a [frontend web application](#frontend) using mapbox API and mapbox.js and the [backend application](#backend) written in [Python](https://www.python.org/), backed by PostGIS. The frontend application communicates with backend using a [REST API](#api).

# Frontend

The frontend application is a static HTML page (`index.html`), which shows a mapbox.js widget. It is diplaying bars, restaurants, nightlubs, fast-foods, parking lots and hotels. This information is for policemen, to find place to eat, where to park and in case of emergency where the hospital is in vicinity. Next use case shows the arrests by beats. This shows policemen how prepared they should be when patrolling the area. And last show every water object between two points. This helps policemen check every water body the suspect could have passed, to lose trail from the search dogs.

All relevant frontend code is in `mapbox.js`, with some additional functionality in `funcions.js`, which is referenced from `index.html`. The frontend code is very simple, its only responsibilities are:
- detecting user's location, user determines his location by dragging the marker
- displaying the sidebar with the ability to switch functionalities
- displaying geo features by overlaying the map with a geojson layer, the geojson is provided directly by backend APIs

# Backend

The backend application is written in Python, which is running on flask server, and is responsible for querying geo data.

## Data

Map data is coming from Open Street Maps. The downloaded part is only state of Illinois and imported using `osm2pgsql` tool into standard OSM schema. The query is made to the database and is then converted to json using `jsonify` library in python. The data which is retrieved by user is:
- Name - name of the object
- Amenity - this is used mostly in bar, fast-food, nightclubs, and parking
- Building - which identifies hospital
- Geojson - Which contains whole geometry of the object which is supposed to be vizualized

## Api

**First functionality**

`GET /points?latitude=25346&longitude=46346123`

**Second functionality**

`GET /beats`

**Thrid functionality**

`GET /water?latitude1=25346&longitude1=46346123&latitude2=45884&longitude2=55889`

### Response

API calls return json responses with witch contains list of objects. 
