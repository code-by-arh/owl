# models/task_dependency.py
from odoo import models, fields, api, _
import logging
_logger = logging.getLogger(__name__)


class TaskDependency(models.Model):
	_name = 'task.dependency'
	_description = 'Task Dependency'

	task_id = fields.Many2one('project.task', required=True, ondelete='cascade', index=True)
	depends_on_id = fields.Many2one('project.task', required=True, ondelete='cascade', index=True)
	
	type = fields.Selection([
		('0', 'Finish to Start (FS)'),
		('1', 'Start to Start (SS)'),
		('2', 'Finish to Finish (FF)'),
		('3', 'Start to Finish (SF)'),
	], string="Dependency Type", default='0')
