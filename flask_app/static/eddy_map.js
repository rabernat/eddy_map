var mymap = L.map('mapid').setView([0, 180], 1);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw', {
    maxZoom: 18,
    id: 'mapbox.oceans-white' // White Ocean
    //id: 'mapbox.blue-marble-topo-bathy-jul-bw' // Black Ocean
}).addTo(mymap);


var eddyLayer = L.geoJson.ajax()
eddyLayer.addTo(mymap);


var myStyle = {
    "color": "#000",
    "weight": 2,
    "opacity": 1,
    zIndex: 10000,
};


var geojsonMarkerOptions = {
    radius: 4,
    //fillColor: "#00ddcc",
    color: "#000",
    weight: 1,
    opacity: 1,
    stroke: false,
    fillOpacity: 0.5,
    zIndex: -10000
};


function eddyEndpointToLayer(feature, latlng) {
    var clickable = false
    switch (feature.properties.name) {
        case 'start_center':
            var color = "#00ddcc";
            clickable = true
            break;
        case 'start_points':
            var color = "#11ffed";
            break;
        case 'end_center':  
            var color = "#dd0080";
            break;
        case 'end_points':
            var color = "#ff2ba6";
            break;
        default:
            var color = "#999";
    }
    var cm = L.circleMarker(latlng,
        $.extend({}, geojsonMarkerOptions, {fillColor: color, clickable: clickable}))
    if (feature.properties.eddy_id) {
        cm = cm.on("click", eddyClicked(feature.properties.eddy_id))
    }
    return cm
}


// use a closure to pass extra arguments
var eddyClicked = function(eddy_id) {
    return function() {
        console.log('Show eddy details ' + eddy_id)
        eddyUrl = "/eddy/" + eddy_id
        mymap.removeLayer(eddyLayer)
        eddyLayer = L.geoJson.ajax(eddyUrl,
                {style: myStyle, pointToLayer: eddyEndpointToLayer});
        eddyLayer.setZIndex(99999);
        eddyLayer.addTo(mymap)
        //eddyLayer.refresh(eddyUrl,
        //  {style: myStyle, pointToLayer: eddyEndpointToLayer});
    }
}


function onEachFeature(feature, layer) {
    if (feature.properties.name == 'start_center') {
        var out = [];
        for(key in feature.properties){
        out.push(key+": "+feature.properties[key]);
        }
        layer.bindPopup(out.join("<br />"));
    }
}

// --------------------------------------------------------------------------------------- format ----- //
function format(n) {
    return (n < 10) ? ("0" + n) : n;
}


// ----------------------------------------------------------------------------------------- date ----- //
var date_min_slider = $("#dateSlider").dateRangeSlider("values").min;
var year_min = date_min_slider.getFullYear().toString();
var month_min = format(date_min_slider.getMonth()).toString();
var day_min = format(date_min_slider.getDate()).toString();
var date_min = year_min + "-" + month_min + "-" + day_min;
var date_max_slider = $("#dateSlider").dateRangeSlider("values").max;
var year_max = date_max_slider.getFullYear().toString();
var month_max = format(date_max_slider.getMonth()).toString();
var day_max = format(date_max_slider.getDate()).toString();
var date_max = year_max + "-" + month_max + "-" + day_max;

// ------------------------------------------------------------------------------------- latitude ----- //
var lat_min = $("#slider_lat").rangeSlider("values").min.toString();
var lat_max = $("#slider_lat").rangeSlider("values").max.toString();


// ------------------------------------------------------------------------------------ longitude ----- //
var lon_min = $("#slider_lon").rangeSlider("values").min.toString();
var lon_max = $("#slider_lon").rangeSlider("values").max.toString();


// ------------------------------------------------------------------------------------- duration ----- //
var dur_min = $("#slider_dur").rangeSlider("values").min.toString();
var dur_max = $("#slider_dur").rangeSlider("values").max.toString();


// ------------------------------------------------------------------------------------------ url ----- //
var jsonUrl = "/eddies" + "?date_min=" + "1992-10-13" + "&date_max=" + "2012-04-05"
                        + "&lat_min=" + "-90" + "&lat_max=" + "90" 
                        + "&lon_min=" + "0" + "&lon_max=" + "360"
                        + "&duration_min=" + "2" + "&duration_max=" + "168";

// ------------------------------------------------------------------------------------------ url ----- //
//var jsonUrl = "/eddies" + "?date_min=" + date_min + "&date_max=" + date_max
//                        + "&lat_min=" + lat_min + "&lat_max=" + lat_max
//                        + "&lon_min=" + lon_min + "&lon_max=" + lon_max
//                        + "&duration_min=" + dur_min + "&duration_max=" + dur_max;


var geojsonLayer = new L.GeoJSON.AJAX(jsonUrl,
            {style: myStyle, pointToLayer: eddyEndpointToLayer,
             onEachFeature: onEachFeature});
geojsonLayer.addTo(mymap);


// jQuery for chaging radio button
$(document).ready(function() {
    $('input:radio[name=duration]').change(function() {
        geojsonLayer.refresh("/eddies?duration=" + this.value)
    });
});

