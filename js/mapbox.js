import mapboxgl from 'mapbox-gl';
import { inherits } from 'util';
import * as func from './functions';

var debug = null;
var marker = null;
var map = null;
var layers = [];
var marker_begin = null;
var marker_end = null;
var color1 = {
    r: 173,
    g: 255,
    b: 47
};
var color2 = {
    r: 178,
    g: 34,
    b: 34
}

var firstFunctionality = null;
var secondFunctionality = null;
var thirdFunctionality = null;
var searchWaterWays = null;

// ***** binding of buttons

firstFunctionality = function firstFunctionality() {    
    removeLayers();
    removeLayerById('balistic');

    marker = new mapboxgl.Marker({
        draggable: true
    }).setLngLat([-87.6298, 41.8781]).addTo(map);    

    marker.on('dragend', getPointsInRange);

    if (marker_begin != null){
        marker_begin.remove();
        marker_end.remove();
    } 

    makeActive("first-functionality", "second-functionality", "third-functionality");
}


secondFunctionality = function secondFunctionality() {    
    marker.remove();    
    removeLayers();
    removeLayerById('balistic');

    if (marker_begin != null){
        marker_begin.remove();
        marker_end.remove();
    } 

    makeActive("second-functionality", "first-functionality", "third-functionality");

    showBeats();
}

thirdFunctionality = function thirdFunctionality() {
    marker.remove();
    removeLayers();

    layers.push("balistic");

    marker_begin = new mapboxgl.Marker({
        draggable: true
    }).setLngLat([-87.6298, 41.8781]).addTo(map);

    marker_end = new mapboxgl.Marker({
        draggable: true
    }).setLngLat([-87.6300, 41.8800]).addTo(map);

    marker_begin.on('dragend', drawLine);
    marker_end.on('dragend', drawLine);

    makeActive("third-functionality", "second-functionality", "first-functionality");    
}



// **** Functions which add geometry to the map

function addPoint(lati, long, name, icon, id) {        
        map.addLayer({
            "id": id,
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lati, long]
                        },
                        "properties": {
                            "title": name,
                            "icon": icon                            
                        }
                    }]
                }
            },
            "layout": {
                "icon-image": "{icon}-15",
                "icon-allow-overlap": true,
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });            
}

function addPolygon(coordinatesList, color, title, opacity, id) {
    map.addLayer({
        'id': id,
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': coordinatesList
                },
                "properties": {
                    "title": title                                           
                }
            }
        },
        'layout': {},
        'paint': {
            'fill-color': color,
            'fill-opacity': opacity
        }
    });
    createToolTip(id);
}

function addMultipolygon(coordinatesList, color, title, id){
    map.addLayer({
        'id': id,
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'MultiPolygon',
                    'coordinates': coordinatesList
                },
                "properties": {
                    "title": title                                           
                }
            }
        },
        'layout': {},
        'paint': {
            'fill-color': color,
            'fill-opacity': 0.8
        }
    });
    createToolTip(id);
}

function addLine(coordinates, title, color, id) {
    console.log("addingLine")
    map.addLayer({
        "id": id,
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",                
                "geometry": {
                    "type": "LineString",
                    "coordinates": coordinates 
                },
                "properties": {
                    "title": title                                           
                }
            }
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": color,
            "line-width": 8
        }
    });
}

// *** Functions which get data from the server

function getPointsInRange() {
    var lngLat = marker.getLngLat();                  
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET','/points?longitude=' + lngLat.lng.toString() + '&latitude=' + lngLat.lat.toString());
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.addEventListener('load', function() {                
        var array = xhr.response;                  
        removeLayers();
        
        for (var i = 0; i < array.length; i++){            
            var localJSON = JSON.parse(array[i][3]);
            layers.push("point" + i.toString());
            if (localJSON.type == "Point"){                
                addPoint(localJSON.coordinates[0], localJSON.coordinates[1], array[i][0], getIcon(array[i][1]),"point" + i.toString());
            }
            if (localJSON.type == "Polygon"){
                if (array[i][1] == 'parking'){
                    addPolygon(localJSON.coordinates, '#1E90FF', (array[i][0] == null?"":array[i][0]) + ' /parking', 0.4, 'point' + i.toString());
                }
                else {
                    addPolygon(localJSON.coordinates, '#B22222', array[i][0], 0.4, 'point' + i.toString());
                }
            }
        }
    });
    xhr.send();
}

function showBeats() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET','/beats');
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.addEventListener('load', function() {
        var array = xhr.response;        

        normalizeValues(array);
        for (var i = 0; i < array.length; i++){
            var color = func.interpolateColor(color1, color2, array[i][array[i].length-1])            
            layers.push("point" + i.toString());            
            var localJSON = JSON.parse(array[i][2]);
            addMultipolygon(localJSON.coordinates, "#" + func.fullColorHex(color), "BeatID: " + array[i][0] + " -> " + array[i][1].toString(), "point" + i.toString());
        }        
    });

    xhr.send();    
}

function drawLine() {    
    removeLayerById("balistic")
    var coordinates = [[marker_begin.getLngLat().lng, marker_begin.getLngLat().lat], [marker_end.getLngLat().lng, marker_end.getLngLat().lat]]
    addLine(coordinates, "balistic", "#e600e6", "balistic")
    
}

searchWaterWays = function searchWaterWays() {

    var latitude1 = marker_begin.getLngLat().lat;
    var latitude2 = marker_end.getLngLat().lat;
    var longitude1 = marker_begin.getLngLat().lng;
    var longitude2 = marker_end.getLngLat().lng;    

    var xhr = new XMLHttpRequest();
    xhr.open('GET','/water?longitude1=' + longitude1.toString() + '&latitude1=' + latitude1.toString() + '&longitude2=' + longitude2.toString() + '&latitude2=' + latitude2.toString());
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.addEventListener('load', function() {
        var array = xhr.response;            
        removeLayers();
        console.log(array)
        
        for (var i = 0; i < array.length; i++){            
            var localJSON = JSON.parse(array[i][3]);            
            layers.push("point" + i.toString());            
            if (localJSON.type == "LineString"){                                            
                addLine(localJSON.coordinates, array[i][0], '#b82e8a', "point" + i.toString())
            }
            if (localJSON.type == "Polygon"){                
                addPolygon(localJSON.coordinates, '#b82e8a', (array[i][0] == null?"":array[i][0]) + ' /lake?', 1.0, 'point' + i.toString());                
            }
        }
        
    });

    xhr.send(); 
}

// **** miscellaneous fucntions which make life easier

function getIcon(amenity) {
    switch(amenity) {
        case 'fast_food':
            return 'fast-food';
        case 'bar':
            return 'bar';
        case 'restaurant':
            return 'restaurant';
        case 'nightclub':
            return 'music';
    }
}


function normalizeValues(array){
    // var min = 500000;
    // var max = 0;
    // for (var i = 0; i < array.length; i++){
    //     if (array[i][1] < min) {
    //         min = array[i][1]
    //     }
    //     if (array[i][1] > max) {
    //         max = array[i][1]
    //     }
    // }
    // var difference = max - min;
    // for (var i = 0; i < array.length; i++){
    //     var normalizedValue = (array[i][1] - min)/(difference)
    //     array[i].push(normalizedValue)
    // }
    
    //quantile interpolation
    array.sort((a,b) => a[1] - b[1]).forEach((e, i, a) => { e.push(i/(a.length - 1)); })    
}

function makeActive(active, remove, remove2){
    var element = document.getElementById(active);
    element.classList.add('is-active');

    var element = document.getElementById(remove);
    element.classList.remove('is-active');

    var element = document.getElementById(remove2);
    element.classList.remove('is-active');
}


function createToolTip(layer) {
    map.on('click', layer, function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.title)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', layer, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', layer, function () {
        map.getCanvas().style.cursor = '';
    });
}

function removeLayerById(id) {
    var ducttape = map.getLayer(id);        
    if (typeof ducttape !== 'undefined'){
        map.removeLayer(id);
        map.removeSource(id);
    }
    
}

function removeLayers() {
    for (var i = 0; i < layers.length; i++){
        map.removeLayer(layers[i]);
        map.removeSource(layers[i]);
    }
    layers = []
}

function init() {
    var first = document.getElementById("first-functionality");
    first.addEventListener("click", firstFunctionality);
    
    var second = document.getElementById("second-functionality");
    second.addEventListener("click", secondFunctionality);
    
    var third = document.getElementById("third-functionality");
    third.addEventListener("click", thirdFunctionality);

    var searchWater = document.getElementById("search-water-btn");
    searchWater.addEventListener("click", searchWaterWays);

    first.click();
}

document.onreadystatechange = () => {    
    if (document.readyState == 'complete') {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vjb3d3dyIsImEiOiJjanAzejdxanIwbGRmM3BwaGUwNmM2dHJtIn0.wN3XZTKDpYQiWCz46HLgdw';
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/secowww/cjpmtv6sj1ofd2sm5xj84niu3',
            center: [-87.6298, 41.8781], // starting position [lng, lat]
            zoom: 10 // starting zoom
        });      
        init();                
    }
}