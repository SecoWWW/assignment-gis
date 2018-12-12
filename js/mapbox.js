import mapboxgl from 'mapbox-gl';
import { inherits } from 'util';

var debug = null;
var marker = null;


document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vjb3d3dyIsImEiOiJjanAzejdxanIwbGRmM3BwaGUwNmM2dHJtIn0.wN3XZTKDpYQiWCz46HLgdw';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v10',
            center: [-87.6298, 41.8781], // starting position [lng, lat]
            zoom: 10 // starting zoom
        });        
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
	    xhr.open('GET','/data');
	    xhr.responseType = 'json';
        xhr.setRequestHeader('Content-type', 'application/json');

        xhr.addEventListener('load', function() {            
            console.log(xhr.response)
        });

        xhr.send();

    }
    
    marker.on('dragend', onDragEnd);

    var debug = document.getElementById("debug");
    
}

function init() {
    console.log(debug);
}


  


