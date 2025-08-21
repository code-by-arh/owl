# -*- coding: utf-8 -*-

from odoo import models, fields, api


class project_task(models.Model):
    _name = 'project.task'
    _inherit = 'project.task'

    level = fields.Integer('Level')
    has_children = fields.Integer("Has Children", compute="_get_children", store=True)
    start_date = fields.Date("Start Date")
    finish_date = fields.Date("Finish Date")

    @api.depends("child_ids")
    def _get_children(self):
        for rec in self:
            rec.has_children = len(rec.child_ids)
