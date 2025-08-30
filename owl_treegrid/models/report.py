#!/usr/bin/python
#-*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError

class report(models.Model):

    _name = "vit.report"
    _description = "vit.report"


    name = fields.Char( required=True, copy=False, string=_("Name"))
    code = fields.Char( string=_("Code"))
    account_group_ids = fields.Many2many(comodel_name="account.group",  string=_("Account Group"))
