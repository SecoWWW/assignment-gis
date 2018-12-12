import mapboxgl from 'mapbox-gl';
import { inherits } from 'util';

var debug = null;
var marker = null;
var map = null;
var layers = [];


document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vjb3d3dyIsImEiOiJjanAzejdxanIwbGRmM3BwaGUwNmM2dHJtIn0.wN3XZTKDpYQiWCz46HLgdw';
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v10',
            center: [-87.6298, 41.8781], // starting position [lng, lat]
            zoom: 10 // starting zoom
        });      
        
        // fetch('/data').then((data) => {
            
        // });
    }

    var marker = new mapboxgl.Marker({
        draggable: true
    })
        .setLngLat([-87.6298, 41.8781])
        .addTo(map);
    
    function onDragEnd() {
        var lngLat = marker.getLngLat();        
        debug.style.display = 'block';
        debug.innerHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;                
        

        var xhr = new XMLHttpRequest();
	    xhr.open('GET','/points?longitude=' + lngLat.lng.toString() + '&latitude=' + lngLat.lat.toString());
	    xhr.responseType = 'json';
        xhr.setRequestHeader('Content-type', 'application/json');

        xhr.addEventListener('load', function() {            
            // console.log(xhr.response)
            var array = xhr.response  
            // console.log(array)  
            
            for (var i = 0; i < layers.length; i++){
                map.removeLayer(layers[i])
                map.removeSource(layers[i])
            }
            layers = []
            
            for (var i = 0; i < array.length; i++){
                console.log("Another")
                console.log(array[i][0])
                console.log(JSON.parse(array[i][0].geometry))
                var localJSON = JSON.parse(array[i][0].geometry)
                layers.push("point" + i.toString())
                addPoint(localJSON.coordinates[0], localJSON.coordinates[1], array[i][0].name, "point" + i.toString())
            }
        });

        xhr.send();

    }
    
    marker.on('dragend', onDragEnd);

    var debug = document.getElementById("debug");
    
}

function init() {
    console.log(debug);
}

function addPoint(lati, long, name, id) {
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
                        "icon": "circle"
                    }
                }]
            }
        },
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });
}


  


