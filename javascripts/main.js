define([
    'backbone',
    'models/weibull_model',
    'views/weibull_view'
],

function ( Backbone, WeibullModel, WeibullView ) {

    'use strict';

    // Create new Weibull Distribution view
    var weibull_view = new WeibullView({
        model: new WeibullModel({
            lambda: 2,
            k: 1,
            start: 0,
            end: 10,
            step: 0.01
        })
    });

    // Render Weibull Distribution graph
    weibull_view.render();

});
