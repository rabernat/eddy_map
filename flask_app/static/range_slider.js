// jQRangeSlider

// Date
$("#dateSlider").dateRangeSlider({arrows:false},
                                 {bounds:{min: new Date(1992, 9, 14), max: new Date(2012, 3, 4)}},
                                 {defaultValues:{min: new Date(1992, 9, 14), max: new Date(2012, 3, 4)}},
                                 {valueLabels:"change", delayOut: 2000});

// Latitude
$("#slider_lat").rangeSlider({arrows:false},
                             {bounds:{min: -90, max: 90}},
                             {defaultValues:{min: -90, max: 90}},
                             {valueLabels:"change", delayOut: 2000});
// Longitude
$("#slider_lon").rangeSlider({arrows:false},
                             {bounds:{min: 0, max: 360}},
                             {defaultValues:{min: 0, max: 360}},
                             {valueLabels:"change", delayOut: 2000});
// Duration
$("#slider_dur").rangeSlider({arrows:false},
                             {bounds:{min: 3, max: 167}},
                             {defaultValues:{min: 3, max: 167}},
                             {valueLabels:"change", delayOut: 2000});