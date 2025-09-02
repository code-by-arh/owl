# -*- coding: utf-8 -*-

from odoo import models, fields, api


class wo(models.Model):
    _name = 'mrp.workorder'
    _inherit = 'mrp.workorder'

    def printModal(self):
        pass
