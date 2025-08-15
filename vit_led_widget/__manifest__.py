# -*- coding: utf-8 -*-
{
    'name': "LED color on-off widget",

    'summary': """
        Short (1 phrase/line) summary of the module's purpose, used as
        subtitle on modules listing or apps.openerp.com""",

    'description': """
        Long description of module's purpose
    """,

    'author': "My Company",
    'website': "https://www.vitraining.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','mrp'],

    # always loaded
    'data': [
        'views/wc.xml',
    ],
    # only loaded in demonstration mode

    'assets': {
        'web.assets_backend':[
            'vit_led_widget/static/src/js/components/*/*.js',
            'vit_led_widget/static/src/js/components/*/*.xml',
            'vit_led_widget/static/src/js/components/*/*.scss',
        ]
    }
}
