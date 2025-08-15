/** @odoo-module **/

import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { Component, useState } from "@odoo/owl";

export class RangeButton extends Component {
    static template = "widget_range_field.RangeButton";

    //get standard properties 
    static props = {
        ...standardFieldProps,
    };
    setup() {
        this.state = useState({
            range: this.props.record.data[this.props.name] || '',
        });

        //to show currency
        const { currency_id } = this.props.record.data // semua field di record isi {name:'', currency_id:'', ....}
        this.currency = currency_id ? currency_id[1] : ''
    }
}

export const rangeButton = {
    component: RangeButton,
    supportedTypes: ["integer"],
};


registry.category("fields").add("range", rangeButton);