define([
    'jquery',
    'underscore',
    'backbone'
],

function($, _, Backbone){

    'use strict';

    return Backbone.Model.extend({

        initialize: function() {

        },

        defaults: {
            lambda: null,
            k: null,
            start: null,
            end: null,
            step: null
        },

        // TODO: Implement robust validation
        validate: function(attrs) {

            var errors = {};

            // lambda should be strictly positive
            if (attrs.lambda <= 0) {
                errors.lambda = "Lambda should be an integer greater than zero";
            }

            // k should be strictly positive
            if (attrs.k <= 0) {
                errors.k = "K should be an integer greater than zero";
            }

            if (!_.isEmpty(errors)) {
                return errors;
            } else {
                return true;
            }

        },

        cpd: function() {

            var func = function(x) {

                return (this.attributes.k / this.attributes.lambda) * Math.pow( (x / this.attributes.lambda), (this.attributes.k - 1) ) * Math.exp( - Math.pow( (x / this.attributes.lambda), this.attributes.k ) );

            }.bind(this);

            return parseFloat(this.approximate_integral(func, this.attributes.start, this.attributes.end, 1000).toFixed(15));

        },

        approximate_integral: function(func, start, end, steps) {

            var i;
            var diff;
            var x_values = [steps + 2];
            var y_values = [steps + 2];

            x_values[0] = start;
            x_values[steps + 1] = end;

            diff = (end - start) / (steps + 1);

            for (i = 1; i <= steps; ++i) {
                x_values[i] = x_values[i - 1] + diff;
            }

            for (i = 0; i < steps + 2; ++i) {
                y_values[i] = func(x_values[i]);
            }

            var final_area = 0.0;

            for (i = 0; i < steps + 1; ++i) {
                final_area += this.calculate_trapezoid_area(y_values[i], y_values[i+1], diff);
            }

            return final_area;

        },

        calculate_trapezoid_area: function(a, b, h) {

            return ( ( ( a + b ) * h  ) / 2.0 );

        }

    });

});
