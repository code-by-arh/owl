from odoo import http
from odoo.http import request

class GMap(http.Controller):

    @http.route('/gmaps/get_api_key', type='json', auth='user')
    def get_api_key(self):
        api_key = request.env['ir.config_parameter'].sudo().get_param('google_maps.api_key')
        if api_key:
            return api_key
        else:
            return False