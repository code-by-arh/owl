# -*- coding: utf-8 -*-
{
    'name': "OWL Google Maps View Icon",

    'summary': """
        Adds Google Maps view to display partner locations on a map""",

    'description': """
        This module adds a Map view type to Odoo 18 that displays partner locations
        on Google Maps based on their latitude and longitude coordinates.
        Features include marker clustering, country-based choropleth visualization,
        and interactive info windows.
    """,

    'author': "My Company",
    'website': "https://www.yourcompany.com",

    'category': 'Extra Tools',
    'version': '18.0.1.0.0',

    # any module necessary for this one to work correctly
    'depends': ['base', 'base_geolocalize', 'contacts','purchase','account','sale_management'],
    
    # Optional dependencies - map view will be added if these modules are installed
    'auto_install': False,
    
    'post_init_hook': 'post_init_hook',

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/res_partner_views.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        # 'demo/demo.xml',
    ],
    'assets': {
        'web.assets_backend':[
            'owl_gmap/static/src/scss/map_view.scss',
            'owl_gmap/static/src/scss/map_location_widget.scss',
            'owl_gmap/static/src/js/components/maps/maps_basic.js',
            'owl_gmap/static/src/js/components/maps/maps_basic.xml',
            'owl_gmap/static/src/js/map_view.js',
            'owl_gmap/static/src/js/fields/map_location_widget.js',
            'owl_gmap/static/src/js/fields/map_location_widget.xml',
        ]
    }
}
