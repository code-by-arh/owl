/** @odoo-module */

import { loadJS } from "@web/core/assets";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, onMounted, useState } from "@odoo/owl";
import { Layout } from "@web/search/layout";

export class GoogleMapSimple extends Component {
    static template = "owl_gmap.GoogleMapSimple";
    static components = { Layout };
    static props = ["*"];

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        this.state = useState({
            locations: [],
            mapLoaded: false,
        });

        onWillStart(async () => {
            await this.loadGoogleMaps();
            await this.loadLocations();
        });

        onMounted(() => {
            if (window.google?.maps) {
                this.initMap();
            } else {
                console.error("Google Maps API not loaded");
            }
        });
    }

    async loadGoogleMaps() {
        try {
            // For now, load without API key (will show "For development purposes only" watermark)
            await loadJS(`https://maps.googleapis.com/maps/api/js?libraries=visualization`);
            this.state.mapLoaded = true;
        } catch (error) {
            console.error("Error loading Google Maps:", error);
        }
    }

    async loadLocations() {
        try {
            const resModel = this.props.resModel || "res.partner";
            const domain = this.props.domain || [];
            this.state.locations = await this.orm.searchRead(
                resModel,
                domain,
                ["name", "partner_latitude", "partner_longitude", "country_id"],
            );
        } catch (error) {
            console.error("Error loading locations:", error);
            this.state.locations = [];
        }
    }

    initMap() {
        const mapElement = document.getElementById("map");
        if (!mapElement) {
            console.error("Map element not found");
            return;
        }

        this.map = new google.maps.Map(mapElement, {
            center: { lat: 20.0, lng: 0.0 },
            zoom: 2,
        });

        // Add markers for locations
        this.state.locations.forEach((loc) => {
            if (loc.partner_latitude && loc.partner_longitude) {
                const marker = new google.maps.Marker({
                    position: { 
                        lat: loc.partner_latitude, 
                        lng: loc.partner_longitude 
                    },
                    map: this.map,
                    title: loc.name,
                });

                // Add click listener to open record
                marker.addListener("click", () => {
                    this.openRecord(loc.id);
                });
            }
        });

        // Center map on markers if any exist
        if (this.state.locations.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            this.state.locations.forEach((loc) => {
                if (loc.partner_latitude && loc.partner_longitude) {
                    bounds.extend(new google.maps.LatLng(
                        loc.partner_latitude, 
                        loc.partner_longitude
                    ));
                }
            });
            this.map.fitBounds(bounds);
        }
    }

    openRecord(recordId) {
        this.action.doAction({
            type: "ir.actions.act_window",
            res_model: this.props.resModel || "res.partner",
            res_id: recordId,
            views: [[false, "form"]],
            target: "current",
        });
    }
}