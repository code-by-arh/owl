from odoo import http
import json
import logging
_logger = logging.getLogger(__name__)


class TreeGrid(http.Controller):

	@http.route('/tree_grid/load/<int:report_id>', methods=["GET"], type='http', auth='user')
	def treegrid_load(self, report_id=1, **kw):
		items = []
		report = http.request.env['vit.report'].browse(int(report_id))
		items.append({
			"id": f"p{report_id}",
			"text": report.code,
			"description":report.name,
			"level":1,
		})
		for acg in report.account_group_ids:
			amount= self.get_amount(acg)
			items.append({
				"id": acg.id,
				"text": f"{acg.code_prefix_start}-{acg.code_prefix_end}",
				"description":acg.name,
				"level":2,
				"debit":amount['debit'],
				"credit":amount['credit'],
				"balance":amount['balance'],
				"parent":f"p{report_id}"
			})
		
		### -- final JSON data
		return json.dumps(items, default=str)



	def get_amount(self, acg):
		sql = """SELECT 
				coalesce(SUM(debit),0) as debit,
				coalesce(SUM(credit),0) as credit, 
				coalesce(SUM(debit),0) - coalesce(SUM(credit),0) AS balance
			FROM account_move_line aml
				JOIN account_account aa ON aml.account_id = aa.id
			WHERE aa.code_store->>'1' >= %s
			AND aa.code_store->>'1' <= %s
		"""
		cr = http.request.env.cr
		cr.execute(sql, (acg.code_prefix_start, acg.code_prefix_end))
		res = cr.dictfetchone()
		print(res)
		return res if res else {'debit':0, 'credit':0, 'balance':0}