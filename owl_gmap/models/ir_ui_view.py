from odoo import fields, models, api

class IrUiView(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(
        selection_add=[('map', 'Map')],
        ondelete={'map': 'cascade'}
    )
    
    @api.model
    def _get_view_info(self):
        """ Get view types metadata including the new map view. """
        view_info = super()._get_view_info()
        view_info['map'] = {
            'display_name': 'Map',
            'icon': 'fa fa-globe',  # Use Font Awesome globe icon
            'multi_record': True,
        }
        return view_info
