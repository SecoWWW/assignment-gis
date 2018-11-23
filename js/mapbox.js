import mapboxgl from 'mapbox-gl';

document.onreadystatechange = () => {
    if (document.readyState == 'complete') {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic2Vjb3d3dyIsImEiOiJjam90eDZiNGwxMmRpM29zMG0ycHNjdGJqIn0.emCFsI3QTgQBgQeZncQKXw';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v10'
        });
    
        fetch('/data').then((data) => {
            
        });
    }

}

