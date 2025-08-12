# -*- coding: utf-8 -*-

from odoo import models, fields, api


class vit_owl_todo(models.Model):
    _name = 'vit.vit_owl_todo'
    _description = 'vit.vit_owl_todo'

    name = fields.Char("Name")
    color = fields.Char("Color")
    completed = fields.Boolean("Is Completed")

