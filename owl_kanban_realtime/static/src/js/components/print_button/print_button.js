/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { useService } from "@web/core/utils/hooks";

export class PrintLabelButton extends Component {
    static template = "vit_progressbar_timer.PrintLabelButton";
    static props = {
        ...standardFieldProps,
        icon: { type: String, optional: true },
        label: { type: String, optional: true },
    };
    static defaultProps = {
        icon: "fa-print",
    };

    setup() {
        super.setup();
        this.orm = useService("orm");
        this.uiService = useService("ui");
    }

    update() {
        const val = this.props.record.data[this.props.name];
        if (!val){
            this.props.record.update({ [this.props.name]: true });
        }

        this.loadPrintData(this.props.record.data.id)
    }

    async loadPrintData(recordId) {
        console.log("Loading Print Data for record:", recordId);
        this.uiService.block();
        try {
            const res = await this.orm.searchRead('mrp.workorder', [['id', '=', recordId]], ["print_data","html_data"]);
            console.log("Print Data:", res);
            $('#html_data').html(res[0].html_data);
            $('#print_data').html(res[0].print_data);
            $('#wo_id').text(recordId);
            $('#printModal').modal('show');
            this.uiService.unblock();
        } catch (error) {
            console.error("Error loading print data:", error);
            this.uiService.unblock();
        }

    }
}

export const printLabelButton = {
    component: PrintLabelButton,
    displayName: _t("Boolean Print"),
    supportedOptions: [
        {
            label: _t("Icon"),
            name: "icon",
            type: "string",
        }
    ],
    supportedTypes: ["boolean"],
    extractProps: ({ options, string }) => ({
        icon: options.icon,
        label: string,
    }),
};

registry.category("fields").add("print_button", printLabelButton);
