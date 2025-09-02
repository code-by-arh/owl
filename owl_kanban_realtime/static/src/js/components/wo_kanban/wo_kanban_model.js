/** @odoo-module **/

import { RelationalModel } from "@web/model/relational_model/relational_model";

export class WoKanbanModel extends RelationalModel {
    setup(params, { effect }) {
        super.setup(...arguments);
        this.effect = effect;
    }
}

export class WoKanbanDynamicGroupList extends RelationalModel.DynamicGroupList {
    /**
     * @override
     *
     * If the kanban view is grouped by stage_id check if the lead is won and display
     * a rainbowman message if that's the case.
     */
    async moveRecord(dataRecordId, dataGroupId, refId, targetGroupId) {
        await super.moveRecord(...arguments);
        const sourceGroup = this.groups.find((g) => g.id === dataGroupId);
        const targetGroup = this.groups.find((g) => g.id === targetGroupId);
        if (
            dataGroupId !== targetGroupId &&
            sourceGroup &&
            targetGroup &&
            sourceGroup.groupByField.name === "workcenter_id"
        ) {
            const record = targetGroup.list.records.find((r) => r.id === dataRecordId);
//            await checkRainbowmanMessage(this.model.orm, this.model.effect, record.resId);
        }
    }
}

WoKanbanModel.DynamicGroupList = WoKanbanDynamicGroupList;
WoKanbanModel.services = [...RelationalModel.services, "effect"];
