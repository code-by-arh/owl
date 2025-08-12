# -*- coding: utf-8 -*-

from odoo import models, fields, api


class partner(models.Model):
    _name = 'res.partner'
    _inherit = 'res.partner'


    username = fields.Char("user Name")
    salary = fields.Integer("Salary")


