from odoo import http
import logging
_logger = logging.getLogger(__name__)
from base64 import b64encode
import json

class FileUpload(http.Controller):
    @http.route('/filepond/process', type='http', auth='user', methods=['POST'], csrf=False)
    def process(self, ):
        _logger.info("requests %",http.request.params )

        filepond = http.request.params.get('filepond')
        _logger.info('filepond %s', filepond)

        file = b64encode(filepond.read())
        ir_attachment = http.request.env['ir.attachment']
        attch = ir_attachment.create({
            'name': filepond.filename,
            'datas': file,
        })
        _logger.info('attach %s', attch)
        if not attch:
            return False
        else:
            return str(attch.id)
    
    
    @http.route('/filepond/revert', type='http', auth='user', methods=['DELETE'], csrf=False)
    def revert(self, ):
        _logger.info("requests %",http.request.httprequest )
        id = json.loads(http.request.httprequest.data)

        ir_attachment = http.request.env['ir.attachment']
        attch = ir_attachment.search([('id','=',id)])
        if attch:
            attch.unlink()

        return ""