define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone){

    'use strict';

    return new Backbone.Router.extend({

        routes: {
            '': 'index'
        },

        index: function(){
            //var projectListView = new ProjectListView();
            //projectListView.render();
        }

    });

});