/** @odoo-module **/

import { WoColumnProgress } from "./wo_column_progress.js.bakk";
import { KanbanRenderer } from "@web/views/kanban/kanban_renderer";
import { KanbanHeader } from "@web/views/kanban/kanban_header";

class WoKanbanHeader extends KanbanHeader {
    static template = "owl_kanban_realtime.WoKanbanHeader";
    static components = {
        ...KanbanHeader.components,
        ColumnProgress: WoColumnProgress,
    };
}

export class WoKanbanRenderer extends KanbanRenderer {}
WoKanbanRenderer.components = {
    ...KanbanRenderer.components,
    KanbanHeader: WoKanbanHeader,
};
