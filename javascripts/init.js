require.config({

    baseUrl: "/javascripts",

    deps: ['backbone', 'main'],

    shim: {
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },

        'underscore': {
            exports: '_'
        }
    },

    paths: {
        jquery: 'libraries/jquery/jquery',
        underscore: 'libraries/underscore/underscore',
        backbone: 'libraries/backbone/backbone'
    }

});
