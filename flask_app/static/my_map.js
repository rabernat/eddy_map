// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– tile ––––– //
var tileLayer01 = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.oceans-white",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
})
var tileLayer02 = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.blue-marble-topo-bathy-jul-bw",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
})
var tileLayer03 = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.satellite",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
})


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– map ––––– //
var myMap = L.map("mapid", {
    center: [0, 180],
    zoom: 1,
    layers: tileLayer01,
    minZoom: 1,
    maxZoom: 10,
    maxBounds: [[-90, -180], [90, 540]]
});
var baseMaps = {
    "Map 01": tileLayer01,
    "Map 02": tileLayer02,
    "Map 03": tileLayer03,
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
var myGeoJsonMarkerOptions = {
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

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– rcs –––– //
function rcsPointToLayer(feature, latlng) {
    switch (feature.properties.name) {
        case "start_center":
            var myClickable = true;
            var myFillColor = "#00ddcc";
            break;
        case "start_points":
            var myClickable = false;
    		var myFillColor = "#11ffed";
    		break;
        case "end_center":
            var myClickable = false;
            var myFillColor = "#dd0080";
            break;
        case "end_points":
            var myClickable = false;
    		var myFillColor = "#ff2ba6";
    		break;
        default:
            var myClickable = false;
            var myFillColor = "#999999";
    }
    var rcsCircleMarker = L.circleMarker(latlng, $.extend({}, myGeoJsonMarkerOptions, {
        fillColor: myFillColor,
        clickable: myClickable
    }));
    if (feature.properties.eddy_id) {
        rcsCircleMarker = rcsCircleMarker.on("click", rcsEddyClicked(feature.properties.eddy_id));
    }
    return rcsCircleMarker;
}

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– ssh –––– //
function sshPointToLayer(feature, latlng) {
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
    var sshCircleMarker = L.circleMarker(latlng, $.extend({}, myGeoJsonMarkerOptions, {
        fillColor: myFillColor,
        clickable: myClickable
    }));
    if (feature.properties.eddy_id) {
        sshCircleMarker = sshCircleMarker.on("click", sshEddyClicked(feature.properties.eddy_id));
    }
    return sshCircleMarker;
}


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– eddy ––––– //

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– rcs –––– //
var rcsEddyLayer = L.geoJson.ajax();
rcsEddyLayer.addTo(myMap);
var rcsEddy = undefined;
var rcsEddyClicked = function(eddyId) {
    return function() {
        myMap.removeLayer(rcsEddyLayer);
        myMap.removeLayer(sshEddyLayer);
        rcsEddyUrl = rcsEddy + "/" + eddyId;
        rcsEddyLayer = L.geoJson.ajax(rcsEddyUrl, {
            style: myStyle,
            pointToLayer: rcsPointToLayer
        });
        rcsEddyLayer.addTo(myMap);
    };
};

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– ssh –––– //
var sshEddyLayer = L.geoJson.ajax();
sshEddyLayer.addTo(myMap);
var sshEddy = undefined;
var sshEddyClicked = function(eddyId) {
    return function() {
        myMap.removeLayer(rcsEddyLayer);
        myMap.removeLayer(sshEddyLayer);
        sshEddyUrl = sshEddy + "/" + eddyId;
        sshEddyLayer = L.geoJson.ajax(sshEddyUrl, {
            style: myStyle,
            pointToLayer: sshPointToLayer
        });
        sshEddyLayer.addTo(myMap);
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
    info.update = function(props) {

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– id ––––– //
        var idPrint = props.eddy_id;

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– date ––––– //
        var startDay = props.eddy_start_date.substring(5, 7);
        var startMonth = props.eddy_start_date.substring(8, 11);
        var startYear = props.eddy_start_date.substring(12, 16);
        var startDatePrint = startMonth + " " + startDay + ", " + startYear;
        var endDay = props.eddy_end_date.substring(5, 7);
        var endMonth = props.eddy_end_date.substring(8, 11);
        var endYear = props.eddy_end_date.substring(12, 16);
        var endDatePrint = endMonth + " " + endDay + ", " + endYear;

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– duration ––––– //
        var durationPrint = Math.round(props.eddy_duration/7);

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– latitude ––––– //
        if (e.latlng.lat > 0) {
            var latitudePrint = e.latlng.lat.toFixed(2) + " N";
        } else if (e.latlng.lat < 0) {
            var latitudePrint = (- e.latlng.lat).toFixed(2) + " S";
        } else {
            var latitudePrint = e.latlng.lat.toFixed(2);
        }

        // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– longitude ––––– //
        if (e.latlng.lng < 180) {
            var longitudePrint = e.latlng.lng.toFixed(2) + " E";
        } else if (e.latlng.lng > 180) {
            var longitudePrint = (360 - e.latlng.lng).toFixed(2) + " W";
        } else {
            var longitudePrint = e.latlng.lng.toFixed(2);
        }

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– area ––––– //
        var meanAreaPrint = (props.eddy_mean_area/10**9).toFixed(2);

        // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– print ––––– //
        this._div.innerHTML = "<b>Eddy ID</b>" + "<br>" + idPrint + "<br>"
                            + "<b>Start Date</b>" + "<br>" + startDatePrint + "<br>"
                            + "<b>End Date</b>" + "<br>" + endDatePrint + "<br>"
                            + "<b>Duration</b>" + "<br>" + durationPrint + " weeks" + "<br>"
                            + "<b>Latitude</b>" + "<br>" + latitudePrint + "<br>"
                            + "<b>Longitude</b>" + "<br>" + longitudePrint + "<br>"
                            + "<b>Mean Area</b>" + "<br>" + meanAreaPrint + " km" + "<sup>2</sup>";
        }
    info.update(e.target.feature.properties);
}


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– interaction ––––– //
function myOnEachFeature(feature, layer) {
    layer.on({
        click: eddyInfo
    });
}


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– eddies ––––– //

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– rcs –––– //
var rcsEddies = undefined;
var rcsJsonUrl = rcsEddies;
var rcsGeoJsonLayer = new L.GeoJSON.AJAX(rcsJsonUrl, {
    style: myStyle,
    pointToLayer: rcsPointToLayer,
    onEachFeature: myOnEachFeature
});
rcsGeoJsonLayer.addTo(myMap);

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– ssh –––– //
var sshEddies = undefined;
var sshJsonUrl = sshEddies;
var sshGeoJsonLayer = new L.GeoJSON.AJAX(sshJsonUrl, {
    style: myStyle,
    pointToLayer: sshPointToLayer,
    onEachFeature: myOnEachFeature
});
sshGeoJsonLayer.addTo(myMap);


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– jquery ––––– //
$(document).ready(function() {

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– variable ––––– //
    var datMin = "1992-10-13";
    var datMax = "2012-03-15";
    var latMin = -91;
    var latMax = 91;
    var lonMin = -1;
    var lonMax = 361;
    var durMin = 2;
    var durMax = 138;

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– checkbox ––––– //
    $("input[name='rcs']").on("switchChange.bootstrapSwitch", function(event, state) {
        if (state === true) {
            rcsEddy = "/rcs_eddy";
            rcsEddies = "/rcs_eddies";
        } else {
            rcsEddy = "/rcs_eddy_remove";
            rcsEddies = "/rcs_eddy_remove";
        }
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(rcsEddyLayer);
        rcsGeoJsonLayer.refresh(rcsEddies);
    });
    $("input[name='ssh']").on("switchChange.bootstrapSwitch", function(event, state) {
        if (state === true) {
            sshEddy = "/ssh_eddy";
            sshEddies = "/ssh_eddies";
        } else {
            sshEddy = "/ssh_eddy_remove";
            sshEddies = "/ssh_eddies_remove";
        }
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(sshEddyLayer);
        sshGeoJsonLayer.refresh(sshEddies);
    });

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– date ––––– //
    $("#dateSlider").on("valuesChanged", function(e, data) {
        // format
        var format = function(number) {
            if (number < 10) {
                return "0" + String(number);
            } else {
                return String(number);
            }
        };
        // min
        var datMinSlider = data.values.min;
        var datMinFix = dateMinSlider;
        datMinFix.setDate(datMinSlider.getDate()-1);
        var yearMin = datMinFix.getFullYear().toString();
        var monthMin = format(datMinFix.getMonth()+1);
        var dayMin = format(datMinFix.getDate());
        datMin = yearMin + "-" + monthMin + "-" + dayMin;
        // max
        var dateMaxSlider = data.values.max;
        var dateMaxFix = dateMaxSlider;
        dateMaxFix.setDate(dateMaxSlider.getDate()+1);
        var yearMax = date_max_fix.getFullYear().toString();
        var monthMax = format(date_max_fix.getMonth()+1)
        var dayMax = format(date_max_fix.getDate());
        datMax = yearMax + "-" + monthMax + "-" + dayMax;
        // refresh
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(rcsEddyLayer);
        myMap.removeLayer(sshEddyLayer);
        rcsGeoJsonLayer.refresh(rcsEddies + "?dat_min=" + datMin + "&dat_max=" + datMax
                                          + "&lat_min=" + latMin + "&lat_max=" + latMax
                                          + "&lon_min=" + lonMin + "&lon_max=" + lonMax
                                          + "&dur_min=" + durMin + "&dur_max=" + durMax);
        sshGeoJsonLayer.refresh(sshEddies + "?dat_min=" + datMin + "&dat_max=" + datMax
                                          + "&lat_min=" + latMin + "&lat_max=" + latMax
                                          + "&lon_min=" + lonMin + "&lon_max=" + lonMax
                                          + "&dur_min=" + durMin + "&dur_max=" + durMax);
    });

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– latitude ––––– //
    $("#slider_lat").on("valuesChanged", function(e, data) {
        latMin = (data.values.min-1).toString();
        latMax = (data.values.max+1).toString();
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(rcsEddyLayer);
        myMap.removeLayer(sshEddyLayer);
        rcsGeoJsonLayer.refresh(rcsEddies + "?dat_min=" + datMin + "&dat_max=" + datMax
                                          + "&lat_min=" + latMin + "&lat_max=" + latMax
                                          + "&lon_min=" + lonMin + "&lon_max=" + lonMax
                                          + "&dur_min=" + durMin + "&dur_max=" + durMax);
        sshGeoJsonLayer.refresh(sshEddies + "?dat_min=" + datMin + "&dat_max=" + datMax
                                          + "&lat_min=" + latMin + "&lat_max=" + latMax
                                          + "&lon_min=" + lonMin + "&lon_max=" + lonMax
                                          + "&dur_min=" + durMin + "&dur_max=" + durMax);
    });

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– longitude ––––– //
    $("#slider_lon").on("valuesChanged", function(e, data) {
        lonMin = (data.values.min-1).toString();
        lonMax = (data.values.max+1).toString();
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(rcsEddyLayer);
        myMap.removeLayer(sshEddyLayer);
        rcsGeoJsonLayer.refresh(rcsEddies + "?dat_min=" + datMin + "&dat_max=" + datMax
                                          + "&lat_min=" + latMin + "&lat_max=" + latMax
                                          + "&lon_min=" + lonMin + "&lon_max=" + lonMax
                                          + "&dur_min=" + durMin + "&dur_max=" + durMax);
        sshGeoJsonLayer.refresh(sshEddies + "?dat_min=" + datMin + "&dat_max=" + datMax
                                          + "&lat_min=" + latMin + "&lat_max=" + latMax
                                          + "&lon_min=" + lonMin + "&lon_max=" + lonMax
                                          + "&dur_min=" + durMin + "&dur_max=" + durMax);
    });

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– duration ––––– //
    $("#slider_dur").on("valuesChanged", function(e, data) {
        durMin = (data.values.min-1).toString();
        durMax = (data.values.max+1).toString();
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(rcsEddyLayer);
        myMap.removeLayer(sshEddyLayer);
        rcsGeoJsonLayer.refresh(rcsEddies + "?dat_min=" + datMin + "&dat_max=" + datMax
                                          + "&lat_min=" + latMin + "&lat_max=" + latMax
                                          + "&lon_min=" + lonMin + "&lon_max=" + lonMax
                                          + "&dur_min=" + durMin + "&dur_max=" + durMax);
        sshGeoJsonLayer.refresh(sshEddies + "?dat_min=" + datMin + "&dat_max=" + datMax
                                          + "&lat_min=" + latMin + "&lat_max=" + latMax
                                          + "&lon_min=" + lonMin + "&lon_max=" + lonMax
                                          + "&dur_min=" + durMin + "&dur_max=" + durMax);
    });
});
