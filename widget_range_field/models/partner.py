# -*- coding: utf-8 -*-

from odoo import models, fields, api


class partner(models.Model):
    _name = 'res.partner'
    _inherit = 'res.partner'


    salary = fields.Integer("Salary")
    min_value = fields.Integer("Minimum", default=100)
    max_value = fields.Integer("Maximum", default=10000)
    step_value = fields.Integer("Step", default=100)


