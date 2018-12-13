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

firstFunctionality = function firstFunctionality() {
    console.log("Setting up first functionality")
    removeLayers();

    marker = new mapboxgl.Marker({
        draggable: true
    }).setLngLat([-87.6298, 41.8781]).addTo(map);
    marker.on('dragend', getPointsInRange);

    makeActive("first-functionality", "second-functionality", "third-functionality");
}


secondFunctionality = function secondFunctionality() {
    console.log("Setting up second functionality")
    marker.remove();    
    removeLayers();

    makeActive("second-functionality", "first-functionality", "third-functionality");

    showBeats();
}

thirdFunctionality = function thirdFunctionality() {
    console.log("Setting up third functionality")
    marker.remove();
    removeLayers();

    makeActive("third-functionality", "second-functionality", "first-functionality");
}

function removeLayers() {
    for (var i = 0; i < layers.length; i++){
        map.removeLayer(layers[i]);
        map.removeSource(layers[i]);
    }
    layers = []
}

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
    console.log(array)
}



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

function addPolygon(coordinatesList, color, id) {
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
                    "title": 'parking'                                           
                }
            }
        },
        'layout': {},
        'paint': {
            'fill-color': color,
            'fill-opacity': 0.4
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

function addLine() {
    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [-122.48369693756104, 37.83381888486939],
                        [-122.48348236083984, 37.83317489144141],
                        [-122.48339653015138, 37.83270036637107],
                        [-122.48356819152832, 37.832056363179625],
                        [-122.48404026031496, 37.83114119107971],
                        [-122.48404026031496, 37.83049717427869],
                        [-122.48348236083984, 37.829920943955045],
                        [-122.48356819152832, 37.82954808664175],
                        [-122.48507022857666, 37.82944639795659],
                        [-122.48610019683838, 37.82880236636284],
                        [-122.48695850372314, 37.82931081282506],
                        [-122.48700141906738, 37.83080223556934],
                        [-122.48751640319824, 37.83168351665737],
                        [-122.48803138732912, 37.832158048267786],
                        [-122.48888969421387, 37.83297152392784],
                        [-122.48987674713133, 37.83263257682617],
                        [-122.49043464660643, 37.832937629287755],
                        [-122.49125003814696, 37.832429207817725],
                        [-122.49163627624512, 37.832564787218985],
                        [-122.49223709106445, 37.83337825839438],
                        [-122.49378204345702, 37.83368330777276]
                    ]
                }
            }
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#888",
            "line-width": 8
        }
    });
}


function getPointsInRange() {
    var lngLat = marker.getLngLat(); 
    console.log(lngLat)                 
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET','/points?longitude=' + lngLat.lng.toString() + '&latitude=' + lngLat.lat.toString());
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.addEventListener('load', function() {                
        var array = xhr.response;     
        console.log(array)           
        removeLayers();
        
        for (var i = 0; i < array.length; i++){            
            var localJSON = JSON.parse(array[i][3]);
            layers.push("point" + i.toString());
            if (localJSON.type == "Point"){                
                addPoint(localJSON.coordinates[0], localJSON.coordinates[1], array[i][0], getIcon(array[i][1]),"point" + i.toString());
            }
            if (localJSON.type == "Polygon"){
                if (array[i][1] == 'parking'){
                    addPolygon(localJSON.coordinates, '#1E90FF', 'point' + i.toString());
                }
                else {
                    addPolygon(localJSON.coordinates, '#B22222', 'point' + i.toString());
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
        console.log(array)

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

  

function init() {
    var first = document.getElementById("first-functionality");
    first.addEventListener("click", firstFunctionality);
    
    var second = document.getElementById("second-functionality");
    second.addEventListener("click", secondFunctionality);
    
    var third = document.getElementById("third-functionality");
    third.addEventListener("click", thirdFunctionality);

    first.click();
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