/** @odoo-module **/

import { registry } from "@web/core/registry";
import { kanbanView } from "@web/views/kanban/kanban_view";
import { WoKanbanModel } from "./wo_kanban_model";
import { WoKanbanArchParser } from "./wo_kanban_arch_parser.js.bak";
import { WoKanbanRenderer } from "./wo_kanban_renderer";
import { WoKanbanController } from "./wo_kanban_controller";

export const woKanbanView = {
    ...kanbanView,
    ArchParser: WoKanbanArchParser,
    Controller: WoKanbanController,
    Model: WoKanbanModel,
    Renderer: WoKanbanRenderer,
};

registry.category("views").add("wo_kanban", woKanbanView);
