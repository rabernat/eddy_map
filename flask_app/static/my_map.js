// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– tile ––––– //
var tileLayer_01 = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.oceans-white",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
})
var tileLayer_02 = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.blue-marble-topo-bathy-jul-bw",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
})
var tileLayer_03 = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.satellite",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
})


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– map ––––– //
var myMap = L.map("mapid", {
    center: [0, 180],
    zoom: 1,
    layers: tileLayer_01,
    minZoom: 1,
    maxZoom: 10,
    maxBounds: [[-90, -180], [90, 540]]
});
var baseMaps = {
    "Map 01": tileLayer_01,
    "Map 02": tileLayer_02,
    "Map 03": tileLayer_03,
}
L.control.layers(baseMaps).addTo(myMap);


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– style ––––– //
var myStyle = {
    //"stroke": true,
    "color": "#999999",
    "weight": 2,
    "opacity": 1,
    //"fill": depends,
    //"fillColor": "#03f",
    //"fillOpacity": 0.2,
    //"clickable": true
};
var myGeojsonMarkerOptions = {
    radius: 4,
    stroke: false,
    //color: "#03f",
    //weight: 5,
    //opacity: 0.5,
    fill: true,
    //fillColor: "03f",
    fillOpacity: 0.5,
    //clickable: true
};


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– point ––––– //
function myPointToLayer(feature, latlng) {
    switch (feature.properties.name) {
        case "start_center":
            var myClickable = true;
            var myFillColor = "#00ddcc";
            break;
        case "end_center":
            var myClickable = false;
            var myFillColor = "#dd0080";
            break;
        default:
            var myClickable = false;
            var myFillColor = "#999999";
    }
    var myCircleMarker = L.circleMarker(latlng, $.extend({}, myGeojsonMarkerOptions, {
        fillColor: myFillColor,
        clickable: myClickable
    }));
    if (feature.properties.eddy_id) {
        myCircleMarker = myCircleMarker.on("click", eddyClicked(feature.properties.eddy_id));
    }
    return myCircleMarker;
}


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– polygon ––––– //
function myPolygonToLayer(feature, latlng) {
    switch (feature.properties.name) {
        case "start_polygon":
            var myClickable = false;
            var myFillColor = "#00ddcc";
            break;
        case "end_polygon":
            var myClickable = false;
            var myFillColor = "#dd0080";
            break;
        default:
            var myClickable = false;
            var myFillColor = "#999999";
    }
    var myPolygon = L.polygon(latlng, $.extend({}, {myGeojsonMarkerOptions}, {
        fillColor: myFillColor,
        clickable: myClickable
    }));
    if (feature.properties.eddy_id) {
        myPolygon = myPolygon.on("click", eddyClicked(feature.properties.eddy_id));
    }
    return myPolygon;
}


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– eddy ––––– //
var eddyLayer = L.geoJson.ajax();
eddyLayer.addTo(myMap);
var eddy = "/rcs_eddy";
var eddyClicked = function(eddy_id) {
    return function() {
        myMap.removeLayer(eddyLayer);
        eddyUrl = eddy + "/" + eddy_id;
        eddyLayer = L.geoJson.ajax(eddyUrl, {
            style: myStyle,
            pointToLayer: myPointToLayer,
        });
        eddyLayer.setZIndex(99999);
        eddyLayer.addTo(myMap);
    };
};


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– info ––––– //
var info = L.control();
info.onAdd = function(myMap) {
    this._div = L.DomUtil.create("div", "info");
    this.update();
    return this._div;
};
info.update = function() {
    this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
};
info.addTo(myMap);


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– click ––––– //
function eddyInfo(e) {
    info.update = function() {

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– id ––––– //
        var id_print = "215814";

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– date ––––– //
        var date_print = "2012-03-14";

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– latitude ––––– //
        if (e.latlng.lat > 0) {
            var lat_print = e.latlng.lat.toFixed(2) + " N";
        } else if (e.latlng.lat < 0) {
            var lat_print = (- e.latlng.lat).toFixed(2) + " S";
        } else {
            var lat_print = e.latlng.lat.toFixed(2);
        }

        // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– longitude ––––– //
        if (e.latlng.lng < 180) {
            var lon_print = e.latlng.lng.toFixed(2) + " E";
        } else if (e.latlng.lng > 180) {
            var lon_print = (360 - e.latlng.lng).toFixed(2) + " W";
        } else {
            var lon_print = e.latlng.lng.toFixed(2);
        }

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– duration ––––– //
        var dur_print = 167;

        this._div.innerHTML = "<b>Eddy ID</b>" + "<br>" + id_print + "<br>"
                            + "<b>Date</b>" + "<br>" + date_print + "<br>"
                            + "<b>Latitude</b>" + "<br>" + lat_print + "<br>"
                            + "<b>Longitude</b>" + "<br>" + lon_print + "<br>"
                            + "<b>Duration</b>" + "<br>" + dur_print + " Weeks"
        }
    info.update();
}


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– interaction ––––– //
function myOnEachFeature(feature, layer) {
    layer.on({
        click: eddyInfo
    });
}


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– geojson ––––– //
var eddies = "/rcs_eddies";
var jsonUrl = eddies;
var geojsonLayer = new L.GeoJSON.AJAX(jsonUrl, {
    style: myStyle,
    pointToLayer: myPointToLayer,
    onEachFeature: myOnEachFeature
});
geojsonLayer.addTo(myMap);


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– jquery ––––– //
$(document).ready(function() {

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– variable ––––– //
    var date_min = "1992-10-13";
    var date_max = "2012-03-15";
    var lat_min = -91;
    var lat_max = 91;
    var lon_min = -1;
    var lon_max = 361;
    var dur_min = 2;
    var dur_max = 138;

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– switch ––––– //
    $("input[name='collection']").on("switchChange.bootstrapSwitch", function(event, state) {
        if (state === true) {
            eddy = "/rcs_eddy";
            eddies = "/rcs_eddies";
        } else if (state === false) {
            eddy = "/ssh_eddy";
            eddies = "/ssh_eddies";
        }
        myMap.removeLayer(eddyLayer);
        geojsonLayer.refresh(eddies + "?date_min=" + date_min + "&date_max=" + date_max
                                    + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                    + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                    + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– date ––––– //
    $("#dateSlider").on("valuesChanged", function(e, data) {
        var format = function(number) {
            if (number < 10) {
                return "0" + String(number);
            } else {
                return String(number);
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
        myMap.removeLayer(eddyLayer);
        geojsonLayer.refresh(eddies + "?date_min=" + date_min + "&date_max=" + date_max
                                    + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                    + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                    + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– latitude ––––– //
    $("#slider_lat").on("valuesChanged", function(e, data) {
        lat_min = (data.values.min-1).toString();
        lat_max = (data.values.max+1).toString();
        myMap.removeLayer(eddyLayer);
        geojsonLayer.refresh(eddies + "?date_min=" + date_min + "&date_max=" + date_max
                                    + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                    + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                    + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– longitude ––––– //
    $("#slider_lon").on("valuesChanged", function(e, data) {
        lon_min = (data.values.min-1).toString();
        lon_max = (data.values.max+1).toString();
        myMap.removeLayer(eddyLayer);
        geojsonLayer.refresh(eddies + "?date_min=" + date_min + "&date_max=" + date_max
                                    + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                    + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                    + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– duration ––––– //
    $("#slider_dur").on("valuesChanged", function(e, data) {
        dur_min = (data.values.min-1).toString();
        dur_max = (data.values.max+1).toString();
        myMap.removeLayer(eddyLayer);
        geojsonLayer.refresh(eddies + "?date_min=" + date_min + "&date_max=" + date_max
                                    + "&lat_min=" + lat_min + "&lat_max=" + lat_max
                                    + "&lon_min=" + lon_min + "&lon_max=" + lon_max
                                    + "&duration_min=" + dur_min + "&duration_max=" + dur_max);
    });
});
