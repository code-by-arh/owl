/** @odoo-module **/

import { registry } from "@web/core/registry";
import { GoogleMapBasic } from "./components/maps/maps_basic";

export const mapView = {
    type: "map",
    display_name: "Map", 
    icon: "fa fa-globe",  // Use Font Awesome globe icon
    multi_record: true,
    Controller: GoogleMapBasic,
    
    props(genericProps, view, config) {
        const { resModel, domain, context } = genericProps;
        return {
            ...genericProps,
            resModel: resModel || "res.partner",
            domain: domain || [],
            context: context || {},
        };
    },
};

registry.category("views").add("map", mapView);
