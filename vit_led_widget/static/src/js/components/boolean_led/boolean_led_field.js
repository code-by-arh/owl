/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

export class BooleanLEDField extends Component {
    static template = "vit_led_widget.BooleanLEDField";
    static props = {
        ...standardFieldProps,
        icon: { type: String, optional: true },
        color: { type: String, optional: true },
        on_color: { type: String, optional: true },
        off_color: { type: String, optional: true },
        label: { type: String, optional: true },
        field_color: { type: String, optional: true },
    };
    static defaultProps = {
        icon: "fa-circle",
    };

    setup() {
        var color = this.props.field_color && this.props.record.data[this.props.field_color] || 'red';
        this.serve_color = color
    }
    
    update() {
        this.props.record.update({ [this.props.name]: !this.props.record.data[this.props.name] });
        var color =this.props.record.data[this.props.field_color]
        this.serve_color = color        
    }
}

export const booleanLEDField = {
    component: BooleanLEDField,
    displayName: _t("Boolean LED"),
    supportedOptions: [
        {
            label: _t("Icon"),
            name: "icon",
            type: "string",
        },
        {
            label: _t("Color"),
            name: "color",
            type: "string",
        },
        {
            label: _t("On Color"),
            name: "on_color",
            type: "string",
        },
        {
            label: _t("Off Color"),
            name: "off_color",
            type: "string",
        },
        {
            label: _t("Field Color"),
            name: "field_color",
            type: "string",
        },
    ],
    supportedTypes: ["boolean"],
    extractProps: ({ options, string }) => ({
        icon: options.icon,
        color: options.color,
        on_color: options.on_color,
        off_color: options.off_color,
        label: string,        
        field_color: options.field_color,
    }),
};

registry.category("fields").add("boolean_led", booleanLEDField);
