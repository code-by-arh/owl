# -*- coding: utf-8 -*-

from odoo import models, fields, api


class owl_phone_validation(models.Model):
    _name = 'vit.owl_phone_validation'
    _description = 'vit.owl_phone_validation'

    name = fields.Char("Name")
    color = fields.Char("Color")
    completed = fields.Boolean("Is Completed")

