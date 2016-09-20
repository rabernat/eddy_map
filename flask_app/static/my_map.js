// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– tile ––––– //
var tileLayerA = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.oceans-white",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
});
var tileLayerB = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.blue-marble-topo-bathy-jul-bw",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
});
var tileLayerC = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    id: "mapbox.satellite",
    accessToken: "pk.eyJ1IjoicmFiZXJuYXQiLCJhIjoiY2luajV5eW51MHhneXVhbTNhdWEzbmRkaSJ9.EzUhO4SMompzRVWAYZcoFw"
});


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– map ––––– //
var myMap = L.map("mapid", {
    center: [0, 180],
    zoom: 1,
    layers: tileLayerA,
    minZoom: 1,
    maxZoom: 12,
    maxBounds: [[-90, -180], [90, 540]],
    fullscreenControl: true
});
var baseMaps = {
    "Map A": tileLayerA,
    "Map B": tileLayerB,
    "Map C": tileLayerC
};
L.control.layers(baseMaps).addTo(myMap);


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– style ––––– //
var myStyle = {
    "color": "#999999",
    "opacity": 1,
    "weight": 2
};
var myGeoJsonMarkerOptions = {
    fill: true,
    fillOpacity: 0.5,
    radius: 4,
    stroke: false
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
            var myFillColor = "#988fff";
            break;
        case "end_center":
            var myClickable = false;
            var myFillColor = "#ff9900";
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
        var id = props.eddy_id;

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– date ––––– //
        var dayS = props.start_date.substring(5, 7);
        var monthS = props.start_date.substring(8, 11);
        var yearS = props.start_date.substring(12, 16);
        var dateS = monthS + " " + dayS + ", " + yearS;
        var dayE = props.end_date.substring(5, 7);
        var monthE = props.end_date.substring(8, 11);
        var yearE = props.end_date.substring(12, 16);
        var dateE = monthE + " " + dayE + ", " + yearE;

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– duration ––––– //
        var dur = Math.round(props.duration/7);

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– latitude ––––– //
        if (e.latlng.lat > 0) {
            var lat = e.latlng.lat.toFixed(2) + " N";
        } else if (e.latlng.lat < 0) {
            var lat = (- e.latlng.lat).toFixed(2) + " S";
        } else {
            var lat = e.latlng.lat.toFixed(2);
        }

        // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– longitude ––––– //
        if (e.latlng.lng < 180) {
            var lon = e.latlng.lng.toFixed(2) + " E";
        } else if (e.latlng.lng > 180) {
            var lon = (360 - e.latlng.lng).toFixed(2) + " W";
        } else {
            var lon = e.latlng.lng.toFixed(2);
        }

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– area ––––– //
        var area = (props.mean_area/Math.pow(10, 9)).toFixed(2);

        // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– print ––––– //
        this._div.innerHTML = "<b>Eddy ID</b>" + "<br>" + id + "<br>"
                            + "<b>Start Date</b>" + "<br>" + dateS + "<br>"
                            + "<b>End Date</b>" + "<br>" + dateE + "<br>"
                            + "<b>Duration</b>" + "<br>" + dur + " weeks" + "<br>"
                            + "<b>Latitude</b>" + "<br>" + lat + "<br>"
                            + "<b>Longitude</b>" + "<br>" + lon + "<br>"
                            + "<b>Mean Area</b>" + "<br>" + area + " km" + "<sup>2</sup>";
        };
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
var rcsJsonUrl = undefined;
var rcsGeoJsonLayer = new L.GeoJSON.AJAX(rcsJsonUrl, {
    style: myStyle,
    pointToLayer: rcsPointToLayer,
    onEachFeature: myOnEachFeature
});
rcsGeoJsonLayer.addTo(myMap);

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– ssh –––– //
var sshJsonUrl = undefined;
var sshGeoJsonLayer = new L.GeoJSON.AJAX(sshJsonUrl, {
    style: myStyle,
    pointToLayer: sshPointToLayer,
    onEachFeature: myOnEachFeature
});
sshGeoJsonLayer.addTo(myMap);


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– jquery ––––– //
$(document).ready(function() {

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– url ––––– //
    var sliderUrl = undefined;
    var rcsSliderUrl = undefined;
    var sshSliderUrl = undefined;

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– variable ––––– //
    var datMin = "0001-01-01";
    var datMax = "9999-12-31";
    var durMin = 0;
    var durMax = Math.pow(10, 10);
    var latMin = -90;
    var latMax = 90;
    var lonMin = 0;
    var lonMax = 360;

    // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– checkbox ––––– //
    // rcs
    $("input[name='rcs']").on("switchChange.bootstrapSwitch", function(event, state) {
        if (state === true) {
            rcsEddy = "/rcs_eddy";
            rcsJsonUrl = "/rcs_eddies";
        } else {
            rcsEddy = "/rcs_eddy_remove";
            rcsJsonUrl = "/rcs_eddy_remove";
            document.getElementById("rcs-alert").innerHTML = "Success! Showing all 0 result(s).";
        }
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(rcsEddyLayer);
        rcsGeoJsonLayer.refresh(rcsJsonUrl);
        $.getJSON(rcsJsonUrl, function(jsonUrl) {
            rcsAlert = jsonUrl.properties.alert;
            document.getElementById("rcs-alert").innerHTML = rcsAlert;
        });
    });
    // ssh
    $("input[name='ssh']").on("switchChange.bootstrapSwitch", function(event, state) {
        if (state === true) {
            sshEddy = "/ssh_eddy";
            sshJsonUrl = "/ssh_eddies";
        } else {
            sshEddy = "/ssh_eddy_remove";
            sshJsonUrl = "/ssh_eddies_remove";
            document.getElementById("ssh-alert").innerHTML = "Success! Showing all 0 result(s).";
        }
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(sshEddyLayer);
        sshGeoJsonLayer.refresh(sshJsonUrl);
        $.getJSON(sshJsonUrl, function(jsonUrl) {
            sshAlert = jsonUrl.properties.alert;
            document.getElementById("ssh-alert").innerHTML = sshAlert;
        });
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
        var datMinFix = datMinSlider;
        datMinFix.setDate(datMinSlider.getDate()-1);
        var yearMin = datMinFix.getFullYear().toString();
        var monthMin = format(datMinFix.getMonth()+1);
        var dayMin = format(datMinFix.getDate());
        datMin = yearMin + "-" + monthMin + "-" + dayMin;
        // max
        var datMaxSlider = data.values.max;
        var datMaxFix = datMaxSlider;
        datMaxFix.setDate(datMaxSlider.getDate()+1);
        var yearMax = datMaxFix.getFullYear().toString();
        var monthMax = format(datMaxFix.getMonth()+1)
        var dayMax = format(datMaxFix.getDate());
        datMax = yearMax + "-" + monthMax + "-" + dayMax;
        // refresh
        info.update = function() {
            this._div.innerHTML = "<b>Eddy Info</b>" + "<br>" + "Click an eddy.";
        };
        info.update();
        myMap.removeLayer(rcsEddyLayer);
        myMap.removeLayer(sshEddyLayer);
        sliderUrl = "?dat_min=" + datMin + "&dat_max=" + datMax + "&dur_min=" + durMin + "&dur_max=" + durMax
                  + "&lat_min=" + latMin + "&lat_max=" + latMax + "&lon_min=" + lonMin + "&lon_max=" + lonMax;
        rcsSliderUrl = rcsJsonUrl + sliderUrl;
        sshSliderUrl = sshJsonUrl + sliderUrl;
        rcsGeoJsonLayer.refresh(rcsSliderUrl);
        sshGeoJsonLayer.refresh(sshSliderUrl);
        $.getJSON(rcsSliderUrl, function(jsonUrl) {
            rcsAlert = jsonUrl.properties.alert;
            document.getElementById("rcs-alert").innerHTML = rcsAlert;
        });
        $.getJSON(sshSliderUrl, function(jsonUrl) {
            sshAlert = jsonUrl.properties.alert;
            document.getElementById("ssh-alert").innerHTML = sshAlert;
        });
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
        sliderUrl = "?dat_min=" + datMin + "&dat_max=" + datMax + "&dur_min=" + durMin + "&dur_max=" + durMax
                  + "&lat_min=" + latMin + "&lat_max=" + latMax + "&lon_min=" + lonMin + "&lon_max=" + lonMax;
        rcsSliderUrl = rcsJsonUrl + sliderUrl;
        sshSliderUrl = sshJsonUrl + sliderUrl;
        rcsGeoJsonLayer.refresh(rcsSliderUrl);
        sshGeoJsonLayer.refresh(sshSliderUrl);
        $.getJSON(rcsSliderUrl, function(jsonUrl) {
            rcsAlert = jsonUrl.properties.alert;
            document.getElementById("rcs-alert").innerHTML = rcsAlert;
        });
        $.getJSON(sshSliderUrl, function(jsonUrl) {
            sshAlert = jsonUrl.properties.alert;
            document.getElementById("ssh-alert").innerHTML = sshAlert;
        });
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
        sliderUrl = "?dat_min=" + datMin + "&dat_max=" + datMax + "&dur_min=" + durMin + "&dur_max=" + durMax
                  + "&lat_min=" + latMin + "&lat_max=" + latMax + "&lon_min=" + lonMin + "&lon_max=" + lonMax;
        rcsSliderUrl = rcsJsonUrl + sliderUrl;
        sshSliderUrl = sshJsonUrl + sliderUrl;
        rcsGeoJsonLayer.refresh(rcsSliderUrl);
        sshGeoJsonLayer.refresh(sshSliderUrl);
        $.getJSON(rcsSliderUrl, function(jsonUrl) {
            rcsAlert = jsonUrl.properties.alert;
            document.getElementById("rcs-alert").innerHTML = rcsAlert;
        });
        $.getJSON(sshSliderUrl, function(jsonUrl) {
            sshAlert = jsonUrl.properties.alert;
            document.getElementById("ssh-alert").innerHTML = sshAlert;
        });
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
        sliderUrl = "?dat_min=" + datMin + "&dat_max=" + datMax + "&dur_min=" + durMin + "&dur_max=" + durMax
                  + "&lat_min=" + latMin + "&lat_max=" + latMax + "&lon_min=" + lonMin + "&lon_max=" + lonMax;
        rcsSliderUrl = rcsJsonUrl + sliderUrl;
        sshSliderUrl = sshJsonUrl + sliderUrl;
        rcsGeoJsonLayer.refresh(rcsSliderUrl);
        sshGeoJsonLayer.refresh(sshSliderUrl);
        $.getJSON(rcsSliderUrl, function(jsonUrl) {
            rcsAlert = jsonUrl.properties.alert;
            document.getElementById("rcs-alert").innerHTML = rcsAlert;
        });
        $.getJSON(sshSliderUrl, function(jsonUrl) {
            sshAlert = jsonUrl.properties.alert;
            document.getElementById("ssh-alert").innerHTML = sshAlert;
        });
    });
});