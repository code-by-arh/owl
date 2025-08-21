from odoo import http
import json
from odoo.http import request
import logging
_logger = logging.getLogger(__name__)


class Gantt(http.Controller):

	@http.route('/gantt/load/<int:project_id>', methods=["GET"], type='http', auth='user')
	def gantt_load(self, project_id=1, **kw):
		tasks = []
		project = http.request.env['project.project'].browse(project_id)
		tasks.append({
			"id"            : f"p{project.id}",
			"text"          : project.name,
			"description"   : project.label_tasks,
			"parent"        : "",
			"start_date"    : "",
			"end_date"      : "",
			"duration"      : "0",
			"has_children"  : 1,
			"progress"      : "0",
			"open"          : "True",
			"level"         : 1,
			# "color"         : "#28a746",
		})

		### --- tasks and childs

		sql = f"""
			SELECT
				pt.id::text AS id,
				pt.name AS text,
				regexp_replace(pt.description, E'<[^>]+>', '', 'gi') AS description,
				pt.level AS level,
				CASE
					WHEN pt.parent_id IS NULL THEN 'p' || pt.project_id::text
					ELSE pt.parent_id::text
				END AS parent,
				pt.has_children,
				CASE 
					WHEN pt.has_children > 0 THEN ''
					ELSE COALESCE(to_char(pt.start_date::DATE, 'yyyy-mm-dd'), to_char(NOW()::DATE, 'yyyy-mm-dd')) 
				END AS start_date,
				CASE 
					WHEN pt.has_children > 0 THEN ''
					ELSE COALESCE(to_char(pt.finish_date::DATE, 'yyyy-mm-dd'), to_char(NOW()::DATE, 'yyyy-mm-dd'))
				END AS end_date,
				'0' AS duration,
				'0' AS progress,
				'True' AS open,

				COALESCE(
				 	string_agg(
				 		dpt.name ||
				 		CASE tdr.type
				 			WHEN '0' THEN 'FS'
				 			WHEN '1' THEN 'SS'
				 			WHEN '2' THEN 'FF'
                 			WHEN '3' THEN 'SF'
				 			ELSE 'FS'
				 		END,
				 	', '
				 	),
				 	''
				 ) AS predecessors
				-- '#28a746' AS color

			FROM
				project_task pt

			-- JOIN ke tabel dependency
			 LEFT JOIN
				task_dependency tdr ON pt.id = tdr.task_id

			-- JOIN ke task predecessor (untuk ambil namanya)
			LEFT JOIN
				project_task dpt ON dpt.id = tdr.depends_on_id

			WHERE
				pt.project_id = {project_id}
				AND pt.active = TRUE

			GROUP BY
				pt.id, pt.name, pt.description, pt.level, pt.parent_id, pt.project_id,
				pt.has_children, pt.start_date, pt.finish_date

			ORDER BY
				pt.name;
		"""

		cr = http.request.env.cr
		cr.execute(sql)
		tasks = tasks + cr.dictfetchall()

		sql = "select * from task_dependency"
		cr.execute(sql)
		res = cr.dictfetchall()
		links = []
		for link in res:
			links.append({
				"id"        : f"{link['task_id']}.{link['depends_on_id']}",
				"source"    : str(link["depends_on_id"]),
				"target"    : str(link["task_id"]),
				"type"      : str(link["type"]),
			})
		"""
		links=[
			{"id":"1", "source":"21", "target":"22", "type":"1"},
			{"id":"2", "source":"22", "target":"23", "type":"0"},
			{"id":"3", "source":"32", "target":"42", "type":"0"},
			{"id":"4", "source":"21", "target":"25", "type":"2"}
		]
		Type Link:
		0 = Finish to Start (FS) (default dan paling umum)
		1 = Start to Start (SS)
		2 = Finish to Finish (FF)
		3 = Start to Finish (SF) (jarang digunakan)
		"""

		### -- final JSON data
		data = {
			"tasks" : tasks,
			"links" : links
		}
		return json.dumps(data, sort_keys=True, default=str)


	@http.route('/gantt/data/task/<int:id>', methods=["PUT"], type='http', auth='user', csrf=False)
	def gantt_data_task_update(self, id, **kw):
		text = kw.get('text')
		description = kw.get('description')
		start_date = kw.get('start_date')
		finish_date = kw.get('end_date')
		predecessors = kw.get('predecessors')

		sql = """update project_task set 
			name=%s,
			description=%s,
			start_date=%s,
			finish_date=%s
			where id=%s
		"""
		cr = http.request.env.cr
		cr.execute(sql, (text, description, start_date, finish_date, id) )

		# Update predecessors
		self._sync_task_dependencies_sql(task_id=id, predecessors_str=predecessors)

		return json.dumps({
			"action":"updated",
		})


	@http.route('/gantt/data/task/<int:id>', methods=["DELETE"], type='http', auth='user', csrf=False)
	def gantt_data_task_delete(self, id, **kw):
		sql = "delete from project_task where id=%s"
		cr = http.request.env.cr
		cr.execute(sql, (id,))
		return json.dumps({"action":"deleted"})


	@http.route('/gantt/data/task', methods=["POST"], type='http', auth='user', csrf=False)
	def gantt_data_task_create(self, **kw):
		if http.request.session.get('id') == kw.get('id'):
			return json.dumps({"action":"exist"})
		else:
			http.request.session['id'] = kw.get('id')

		start_date = kw.get("start_date")
		finish_date = kw.get("end_date")
		description = kw.get("description")
		parent = kw.get("parent")
		stage_id = http.request.env['project.task']._get_first_stage()

		cr = http.request.env.cr

		_logger.info("description=%s parent=%s", description, parent)
		sql = "select id from project_task where description=%s and (parent_id=%s or project_id=%s)"
		cr.execute(sql, (description, parent_id, project_id))
		res = cr.fetchone()
		if res and res[0] != None:
			return json.dumps({"action":"exist"})

		if isinstance(parent, str) and parent.startswith('p'):
			parent_task = http.request.env['project.project'].browse(int(parent.replace('p','')))
			children = len(parent_task.task_ids) + 1
			parent_id = parent_task.id
			project_id = parent_task.id
			level = 2
			children = 0
		else:
			parent_task = http.request.env['project.task'].browse(int(parent))
			project_id = parent_task.project_id.id
			sql = "select max(name) as name from project_task where parent_id=%s"
			cr.execute(sql, (int(parent),))
			res = cr.fetchone()
			if res and res[0] != None:
				names = res[0].split("-")
				seq = int(names[-1]) + 1
			else:
				seq = 1

			parent_id = parent_task.id
			level = parent_task.level + 1
			children = 0
			parent_task.has_children += 1

		name = f"{parent_task.name}-{(seq):02d}"
		sql = """insert into project_task (name, description, parent_id, start_date, finish_date, company_id, project_id, kanban_state, active, has_children, level, finish_progress, stage_id)
		values (%s, %s, %s, %s, %s, %s, %s, 'normal', 'True', %s, %s, '0', %s) returning id
		"""
		company_id = http.request.env.user.company_id.id
		cr.execute(sql, (name, description, parent_id, start_date, finish_date, company_id, project_id, children, level, stage_id.id))
		id = cr.fetchone()

		task = http.request.env['project.task'].search_read([('id','=',id[0])], fields=["id","name","description","level"])[0]
		return json.dumps({
			"action": "inserted",
			"tid"   : id[0],
			"data"  : task
		})


	@http.route('/gantt/data/link', methods=["POST"], type='http', auth='user', csrf=False)
	def gantt_data_link_create(self, **kw):
		source = kw.get('source')
		target = kw.get('target')
		type = kw.get('type')
		id = kw.get('id')

		sql = """insert into task_dependency (depends_on_id, task_id, type)
		values (%s, %s, %s)"""

		cr = http.request.env.cr
		cr.execute(sql, (source, target, type) )
		return json.dumps({"action":"inserted", "link_id": f"{source}.{target}", "tid": f"{source}.{target}" })


	@http.route('/gantt/data/link/<string:id>', methods=["DELETE"], type='http', auth='user', csrf=False)
	def gantt_data_link_delete(self, **kw):
		task_id, depends_on_id = id.split(".")

		sql = "delete from task_dependency where task_id=%s and depends_on_id=%s"
		cr = http.request.env.cr
		cr.execute(sql, (task_id, depends_on_id) )
		return json.dumps({"action":"deleted"})

	@http.route('/gantt/view/<int:project_id>', methods=["GET"], type='http', auth='user')
	def gantt_view(self, **kw):
		values = {}
		return request.render("vit_project_gantt.project_view", values)


	def _sync_task_dependencies_sql(self, task_id, predecessors_str):
		type_map = {"FS": "0", "SS": "1", "FF": "2", "SF": "3"}
		cr = http.request.env.cr

		# Step 1: Clear dulu dependencies lama untuk task ini
		cr.execute("""
			DELETE FROM task_dependency
			WHERE task_id = %s
		""", (task_id,))

		# Step 2: Parse predecessors string dan insert ulang
		raw_items = [s.strip() for s in predecessors_str.split(',') if s.strip()]
		for item in raw_items:
			# Pisahkan nama task dan type
			task_name = item[:-2].strip()
			link_type = item[-2:].upper()

			if link_type not in type_map:
				continue  # skip jika type tidak valid

			type_val = type_map[link_type]

			# Step 3: Cari depends_on_id berdasarkan nama
			cr.execute("""
				SELECT id FROM project_task WHERE name = %s LIMIT 1
			""", (task_name,))
			result = cr.fetchone()
			if not result:
				continue  # task dengan nama tersebut tidak ditemukan

			depends_on_id = result[0]

			if depends_on_id == task_id:
				continue  # jangan biarkan task bergantung pada dirinya sendiri

			# Step 4: Insert (tidak perlu upsert karena sebelumnya sudah dihapus)
			cr.execute("""
				INSERT INTO task_dependency (task_id, depends_on_id, type)
				VALUES (%s, %s, %s)
			""", (task_id, depends_on_id, type_val))


	def find_object_by_id(self, tasks, target_id):
		for node in tasks:
			if node['id'] == target_id:
				return node
			if 'children' in node:
				result = self.find_object_by_id(node['children'], target_id)
				if result:
					return result
		return None
