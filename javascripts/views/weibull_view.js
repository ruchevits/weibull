define([
    'backbone',
    'jquery',
    'underscore'
],

function(Backbone, $, _){

    'use strict';

    return Backbone.View.extend({

        el: $('#weibull-container'),

        ui: {
            graph:      $('#weibull-graph'),
            params:     $('#weibull-params'),
            range:      $('#weibull-range')
        },

        events: {
            "change #lambda": "update_lambda",
            "change #k": "update_k"
        },

        update_lambda: function() {
            this.trigger("update_model", {param: "lambda"});
        },

        update_k: function() {
            this.trigger("update_model", {param: "k"});
        },

        // Initialize view
        initialize: function() {

            this.ui.canvas =    this.ui.graph.find('canvas').get(0);
            this.ui.context =   this.ui.canvas.getContext("2d");
            this.ui.lambda =    this.ui.params.find('#lambda');
            this.ui.k =         this.ui.params.find('#k');
            this.ui.cpd =       this.ui.params.find('#cpd');
            this.ui.start =     this.ui.range.find('.start');
            this.ui.between =   this.ui.range.find('.between');
            this.ui.end =       this.ui.range.find('.end');

            // Update model event
            this.bind("update_model", this.update_model, this);

            // Update view event
            this.model.on('change', this.update_view, this);

            // Render the initial view
            this.render();

        },

        // Executed once on page load
        render: function() {

            // Display current model attributes
            this.ui.lambda.val(this.model.get('lambda'));
            this.ui.k.val(this.model.get('k'));
            this.ui.cpd.val(this.model.cpd());
            this.ui.start.html(this.model.get('start'));
            this.ui.end.html(this.model.get('end'));

            // Create slider
            this.knobs = this.slider(this.ui.range);

            // Prepare canvas
            this.prepare_canvas();

            // Plot the initial graph
            this.plot_weibull();

        },

        // Update model attributes
        update_model: function(event) {

            if (event.param == "k") {

                // Update k attribute
                this.model.set('k', parseInt(this.ui.k.val()));

            }

            if (event.param == "lambda") {

                // Update lambda attribute
                this.model.set('lambda', parseInt(this.ui.lambda.val()));

            }

            if (event.param == "start") {

                // Update start attribute
                this.model.set('start', parseInt(this.ui.start.html()));

            }

            if (event.param == "end") {

                // Update end attribute
                this.model.set('end', parseInt(this.ui.end.html()));

            }

            this.ui.cpd.val(this.model.cpd());

        },

        // Executed each time when model changes
        update_view: function() {
            this.prepare_canvas();
            this.plot_weibull();
        },

        // Generic formulae of the Weibull distribution
        weibull: function(x, lambda, k) {

            return (k / lambda) * Math.pow( (x / lambda), (k - 1) ) * Math.exp( - Math.pow( (x / lambda), k ) );

        },

        // Generic function for getting all plot points
        get_points: function(start, end, step, func) {

            var x_points = _.range(start, end, step);

            var y_points = [];

            for ( var i = 0; i < x_points.length; i++ ) {

                y_points.push(func(x_points[i]));

            }

            return {x: x_points, y: y_points};

        },

        prepare_canvas: function() {

            // Set canvas size
            this.ui.canvas.width = this.ui.graph.width();
            this.ui.canvas.height = this.ui.graph.height();

            // Scale factor
            this.factor = (this.ui.canvas.width - 35) / ( this.model.get('end') - this.model.get('start') );
            this.axis_factor = (this.ui.canvas.width - 35) / 100;

            // Set canvas origin to the lower-left corner
            this.ui.context.translate(0, this.ui.canvas.height);
            this.ui.context.scale(1,1);

            // Clear context drawing area
            this.ui.context.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);

            // Draw axis lines
            this.create_axis_lines();

            // Draw axis labels
            this.create_axis_labels();

            // Reverse coordinate system
            this.ui.context.scale(1,-1);

            // Set plot color
            this.ui.context.strokeStyle = "#ff0000";

        },

        create_axis_lines: function() {

            // Axis line color
            this.ui.context.strokeStyle = "#333333";

            // Horizontal axis line
            this.ui.context.beginPath();
            this.ui.context.moveTo(25, -25);
            this.ui.context.lineTo(this.ui.canvas.width, -25);
            this.ui.context.stroke();

            // Vertical axis line
            this.ui.context.beginPath();
            this.ui.context.moveTo(25, -25);
            this.ui.context.lineTo(25, -this.ui.canvas.height);
            this.ui.context.stroke();

        },

        create_axis_labels: function() {

            // Axis label color
            this.ui.context.strokeStyle = "#333333";

            // Zero label
            this.ui.context.beginPath();
            this.ui.context.moveTo(0, -25);
            this.ui.context.lineTo(25, -25);
            this.ui.context.stroke();
            this.ui.context.beginPath();
            this.ui.context.moveTo(25, -0);
            this.ui.context.lineTo(25, -25);
            this.ui.context.stroke();
            this.ui.context.fillText((this.model.get('start')).toString(), 0, 0)

            // Horizontal axis labels
            for ( var i = 1; i <= 10; i++ ) {
                var x_pos = i * 10 * this.axis_factor + 25;
                this.ui.context.beginPath();
                this.ui.context.moveTo(x_pos, -22);
                this.ui.context.lineTo(x_pos, -28);
                this.ui.context.stroke();
                this.ui.context.fillText((this.model.get('start') + i * ( this.model.get('end') - this.model.get('start') ) / 10).toString(), x_pos - 3, 0)
            }

            // Vertical axis labels
            for ( var j = 1; j <= 10; j++ ) {
                var y_pos = - j * 10 * this.axis_factor - 25;
                this.ui.context.beginPath();
                this.ui.context.moveTo(22, y_pos);
                this.ui.context.lineTo(28, y_pos);
                this.ui.context.stroke();
                this.ui.context.fillText((this.model.get('start') + j * ( this.model.get('end') - this.model.get('start') ) / 10).toString(), 0, y_pos + 3)
            }

        },

        plot_weibull: function() {

            // Get plot points for the Weibull distribution
            var points = this.get_points(this.model.get('start'), this.model.get('end'), this.model.get('step'), function(x) {
                return this.weibull(x, this.model.get('lambda'), this.model.get('k'));
            }.bind(this));

            // Begin path
            this.ui.context.beginPath();

            // Draw the line
            for ( var i = 0; i < points.x.length; i++ ) {

                //var coords = this.cartesian_to_screen(points.x[i], points.y[i], this.ui.canvas[0].height);
                this.ui.context.lineTo(points.x[i]*this.factor + 25, points.y[i]*this.factor + 25);

            }

            // Display the line
            this.ui.context.stroke();

        },

        // TODO: Refactor me some lazy rainy day
        slider: function(elem) {

            var knobs = {
                start: {
                    elem: this.ui.start,
                    moving: false,
                    value: this.model.get('start')
                },
                end: {
                    elem: this.ui.end,
                    moving: false,
                    value: this.model.get('end')
                },
                between: {
                    elem: this.ui.between,
                    range: this.model.get('end') - this.model.get('start')
                }
            };

            knobs.start.elem.html(knobs.start.value);
            knobs.end.elem.html(knobs.end.value);

            knobs.start.elem.mousedown(function(){
                knobs.start.moving = true;
            });

            knobs.end.elem.mousedown(function(){
                knobs.end.moving = true;
            });

            var self = this;

            $(document).mouseup(function(){
                knobs.start.moving = false;
                knobs.end.moving = false;
                self.trigger("update_model", {param: "start"});
                self.trigger("update_model", {param: "end"});
            });

            var initial_range_factor = 370 / ( this.model.get('end') - this.model.get('start') );

            $(document).mousemove(function(event){

                if (!knobs.start.moving && !knobs.end.moving) return;

                var x = event.pageX - elem[0].offsetLeft;

                var start_knob_limit = parseInt(knobs.end.elem.css('left')) - parseInt(knobs.end.elem.css('width'));
                var end_knob_limit = parseInt(knobs.start.elem.css('left')) + parseInt(knobs.start.elem.css('width'));

                var new_x;

                if (knobs.start.moving) {

                    if (x >= 0 && x <= start_knob_limit) {
                        new_x = x;
                    } else if (x < 0) {
                        new_x = 0
                    } else {
                        new_x = parseInt(knobs.end.elem.css('left')) - parseInt(knobs.end.elem.css('width'));
                    }

                    knobs.start.elem.css({'left': new_x});
                    knobs.between.elem.css({'left': new_x + parseInt(knobs.start.elem.css('width'))});
                    knobs.start.value = Math.round(new_x / initial_range_factor);
                    knobs.start.elem.html(knobs.start.value);

                }

                if (knobs.end.moving) {

                    if (x >= end_knob_limit && x <= elem.width() - knobs.end.elem.width()) {
                        new_x = x;
                    } else if (x < end_knob_limit) {
                        new_x = parseInt(knobs.start.elem.css('left')) + parseInt(knobs.start.elem.css('width'));
                    } else {
                        new_x = elem.width() - knobs.end.elem.width();
                    }

                    knobs.end.elem.css({'left': new_x});
                    knobs.between.elem.css({'right':  elem.width() - new_x});
                    knobs.end.value = Math.round(new_x / initial_range_factor);
                    knobs.end.elem.html(knobs.end.value);

                }

                knobs.between.range = knobs.end.value - knobs.start.value;

            });

            elem.append(knobs.start.elem, knobs.end.elem, knobs.between.elem);

            return knobs;

        }

    });

});
