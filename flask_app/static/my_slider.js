// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– panel ––––– //
$("#panelSlider").slideReveal({
    trigger: $("#button"),
    width: 1200,
    push: false,
    overlay: true,
    overlayColor: "rgba(0,0,0,0.8)",
    //zIndex: 2000,
    position: "right",
    speed: 1000,
    autoEscape: true,
    top: 180
});


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– date ––––– //
$("#dateSlider").dateRangeSlider(
    {arrows: false},
    {bounds: {min: new Date(1993, 0, 1), max: new Date(2015, 11, 31)}},
    {defaultValues: {min: new Date(1993, 0, 1), max: new Date(2015, 11, 31)}},
    {valueLabels: "change", delayOut: 4000, durationIn: 1000, durationOut: 1000},
    {step: {days: 1}},
    {wheelMode: "scroll"/*, wheelSpeed: 1*/}
);


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– latitude ––––– //
$("#slider_lat").rangeSlider(
    {arrows: false},
    {bounds: {min: -90, max: 90}},
    {defaultValues: {min: -90, max: 90}},
    {valueLabels: "change", delayOut: 4000, durationIn: 1000, durationOut: 1000},
    {step: 1},
    {wheelMode: "scroll"/*, wheelSpeed: 1*/}
);


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– longitude ––––– //
$("#slider_lon").rangeSlider(
    {arrows: false},
    {bounds: {min: 0, max: 360}},
    {defaultValues: {min: 0, max: 360}},
    {valueLabels: "change", delayOut: 4000, durationIn: 1000, durationOut: 1000},
    {step: 1},
    {wheelMode: "scroll"/*, wheelSpeed: 1*/}
);


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– duration ––––– //
$("#slider_dur").rangeSlider(
    {arrows: false},
    {bounds: {min: 1, max: 200}},
    {defaultValues: {min: 1, max: 200}},
    {valueLabels: "change", delayOut: 4000, durationIn: 1000, durationOut: 1000},
    {step: 1},
    {wheelMode: "scroll"/*, wheelSpeed: 1*/});
