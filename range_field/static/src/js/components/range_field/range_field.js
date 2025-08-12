/** @odoo-module **/

import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

import { Component, useState, onWillUpdateProps } from "@odoo/owl";

export class ViewButton extends Component {
    setup() {
        this.state = useState({
            range: this.props.value || '',
        });

        //to show currency
        const { currency_id, phone } = this.props.record.data // semua field di recprd isi {name:'', currency_id:'', ....}
        this.currency = currency_id ? currency_id[1] : ''
    }


}

ViewButton.template = "vit_kerma_inherit.ViewButton";
ViewButton.props = {
    ...standardFieldProps,
};

ViewButton.supportedTypes = ["integer"];

registry.category("fields").add("view_button", ViewButton);