from odoo import models, fields, api, _

import logging
_logger = logging.getLogger(__name__)


class Project(models.Model):
    _name = "project.project"
    _inherit = "project.project"  


    def view_gantt(self):
        action = self.env["ir.actions.act_window"]._for_xml_id(
            "project.open_view_project_all_group_stage"
        )
        res = {
            'type': 'ir.actions.client',
            'name':'Gantt Chart',
            'tag':'owl_gantt',
            'project_id': self.id,
            'project_name': self.name,
            'project_description': self.label_tasks ,
            'project_action_id': action.get('id')
        }

        return res
