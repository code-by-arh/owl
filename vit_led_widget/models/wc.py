from odoo import fields, models, api


class Workcenter(models.Model):
    _inherit = 'mrp.workcenter'

    is_production = fields.Boolean('In Production')

    def update_status(self):
        self.is_production = not self.is_production
