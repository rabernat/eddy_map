// ------------------------------------------------------------------------------------------ map ----- //
var myMap = L.map("mapid", {
    center: [0, 180],
    zoom: 1,
    minZoom: 1,
    maxZoom: 10,
    maxBounds: [[-90, 0], [90, 360]]
});


// ----------------------------------------------------------------------------------------- tile ----- //
var white = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.oceans-white",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
})
var black = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.blue-marble-topo-bathy-jul-bw",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
})
var baseMaps = {
    "white": white,
    "black": black
};
L.control.layers(baseMaps).addTo(myMap);

// ----------------------------------------------------------------------------------------- eddy ----- //
var eddyLayer = L.geoJson.ajax();
eddyLayer.addTo(myMap);


// ---------------------------------------------------------------------------------------- style ----- //
var myStyle = {
    "color": "#000000",
    "weight": 2,
    "opacity": 1,
    zIndex: 10000
};


// --------------------------------------------------------------------------------------- marker ----- //
var geojsonMarkerOptions = {
    stroke: false,
    color: "#000000",
    weight: 1,
    radius: 4,
    opacity: 1,
    fill: true,
    //fillColor: "#00ddcc",
    fillOpacity: 0.5,
    zIndex: -10000
};


// ------------------------------------------------------------------------------- point-to-layer ----- //
function eddyEndpointToLayer(feature, latlng) {
    var clickable = false;
    switch (feature.properties.name) {
        case "start_center":
            clickable = true;
            var color = "#00ddcc";
            break;
        case "start_points":
            var color = "#11ffed";
            break;
        case "end_center":
            var color = "#dd0080";
            break;
        case "end_points":
            var color = "#ff2ba6";
            break;
        default:
            var color = "#999999";
    }
    var cm = L.circleMarker(latlng,
        $.extend({}, geojsonMarkerOptions, {
            fillColor: color,
            clickable: clickable
        }));
    if (feature.properties.eddy_id) {
        cm = cm.on("click", eddyClicked(feature.properties.eddy_id));
    }
    return cm;
}


// ---------------------------------------------------------------------------------------- click ----- //
// use a closure to pass extra arguments
var eddyClicked = function(eddy_id) {
    return function() {
        console.log("Show eddy details " + eddy_id);
        eddyUrl = "/eddy/" + eddy_id;
        myMap.removeLayer(eddyLayer);
        eddyLayer = L.geoJson.ajax(eddyUrl, {
            style: myStyle,
            pointToLayer: eddyEndpointToLayer
        });
        eddyLayer.setZIndex(99999);
        eddyLayer.addTo(myMap);
        /*
        eddyLayer.refresh(eddyUrl, {
            style: myStyle,
            pointToLayer: eddyEndpointToLayer
        });
        */
    };
};


// ---------------------------------------------------------------------------------------- popup ----- //
function onEachFeature(feature, layer) {
    if (feature.properties.name == 'start_center') {
        var out = [];
        for (key in feature.properties) {
            out.push(key + ": " + feature.properties[key]);
        }
        layer.bindPopup(out.join("<br />"));
    }
}


// ------------------------------------------------------------------------------------------ url ----- //
var jsonUrl = "/eddies";


// -------------------------------------------------------------------------------------- geojson ----- //
var geojsonLayer = new L.GeoJSON.AJAX(jsonUrl, {
    style: myStyle,
    pointToLayer: eddyEndpointToLayer,
    onEachFeature: onEachFeature
});
geojsonLayer.addTo(myMap);


// --------------------------------------------------------------------------------------- jquery ----- //
$(document).ready(function() {

    // ----------------------------------------------------------------- variable ----- //
    var date_min = "1992-10-13";
    var date_max = "2012-03-15";
    var lat_min = -91;
    var lat_max = 91;
    var lon_min = -1;
    var lon_max = 361;
    var dur_min = 2;
    var dur_max = 138;

    // --------------------------------------------------------------------- date ----- //
    $("#dateSlider").on("valuesChanged", function(e, data) {
        var format = function(number) {
            if (number < 10) {
                return "0" + String(number)
            } else {
                return String(number)
            }
        };
        var date_min_slider = data.values.min;
        var date_min_fix = date_min_slider;
        date_min_fix.setDate(date_min_slider.getDate()-1);
        var year_min = date_min_fix.getFullYear().toString();
        var month_min = format(date_min_fix.getMonth()+1)
        var day_min = format(date_min_fix.getDate())
        date_min = year_min + "-" + month_min + "-" + day_min;
        var date_max_slider = data.values.max;
        var date_max_fix = date_max_slider;
        date_max_fix.setDate(date_max_slider.getDate()+1);
        var year_max = date_max_fix.getFullYear().toString();
        var month_max = format(date_max_fix.getMonth()+1)
        var day_max = format(date_max_fix.getDate())
        date_max = year_max + "-" + month_max + "-" + day_max;
        geojsonLayer.refresh("/eddies" + "?date_min=" + date_min + "&date_max=" + date_max
                                       + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                       + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                       + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });

    // ----------------------------------------------------------------- latitude ----- //
    $("#slider_lat").on("valuesChanged", function(e, data) {
        lat_min = (data.values.min-1).toString();
        lat_max = (data.values.max+1).toString();
        geojsonLayer.refresh("/eddies" + "?date_min=" + date_min + "&date_max=" + date_max
                                       + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                       + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                       + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });

    // ---------------------------------------------------------------- longitude ----- //
    $("#slider_lon").on("valuesChanged", function(e, data) {
        lon_min = (data.values.min-1).toString();
        lon_max = (data.values.max+1).toString();
        geojsonLayer.refresh("/eddies" + "?date_min=" + date_min + "&date_max=" + date_max
                                       + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                       + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                       + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });

    // ----------------------------------------------------------------- duration ----- //
    $("#slider_dur").on("valuesChanged", function(e, data) {
        dur_min = (data.values.min-1).toString();
        dur_max = (data.values.max+1).toString();
        geojsonLayer.refresh("/eddies" + "?date_min=" + date_min + "&date_max=" + date_max
                                       + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                       + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                       + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });

    // -------------------------------------------------------------------- radio ----- //
    $("input:radio[name=duration]").change(function() {
        geojsonLayer.refresh("/eddies" + "?date_min=" + date_min + "&date_max=" + date_max
                                       + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                       + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                       + "&duration_min=" + (this.value-1) + "&duration_max=" + dur_max);
    });
});
