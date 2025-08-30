# -*- coding: utf-8 -*-
{
    'name': "OWL treegrid",

    'summary': """
        Short (1 phrase/line) summary of the module's purpose, used as
        subtitle on modules listing or apps.openerp.com""",

    'description': """
        Long description of module's purpose
    """,

    'author': "My Company",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','om_account_accountant'],

    # always loaded
    'data': [
        'views/report.xml',
        'views/account_report.xml',
        'security/ir.model.access.csv',
    ],
    # only loaded in demonstration mode
    'demo': [
        # 'demo/demo.xml',
    ],
    'assets': {
        'web.assets_backend':[
            'owl_treegrid/static/src/js/components/treegrid/*.js',
            'owl_treegrid/static/src/js/components/treegrid/*.xml',
            'owl_treegrid/static/src/js/components/treegrid/*.scss',
        ]
    }
}
