/** @odoo-module */

import { loadJS } from "@web/core/assets";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, onMounted, useState } from "@odoo/owl";
import { Layout } from "@web/search/layout";
import { useBus } from "@web/core/utils/hooks";
import { rpc } from "@web/core/network/rpc";

export class GoogleMapBasic extends Component {
    static template = "owl_gmap.GoogleMapBasic";
    static components = { Layout };
    static props = ["*"];

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        
        // Listen for search/filter changes if searchModel exists
        if (this.env.searchModel) {
            useBus(this.env.searchModel, "update", () => {
                this.onSearchUpdate();
            });
        }

        this.state = useState({
            locations: [],
            mapLoaded: false,
            apiKey: null,
        });

        onWillStart(async () => {
            await this.fetchApiKey();
            await this.loadGoogleMaps();
            await this.loadLocations();
        });

        onMounted(() => {
            if (window.google?.maps) {
                this.initMap();
            }
        });
    }

    async fetchApiKey() {
        try {
            const result = await rpc("/gmaps/get_api_key", {});
            this.state.apiKey = result;
            console.log("Google Maps API key fetched:", result ? "Key found" : "No key configured");
        } catch (error) {
            console.error("Error fetching Google Maps API key:", error);
            this.state.apiKey = null;
        }
    }

    async loadGoogleMaps() {
        try {
            // Check if Google Maps is already loaded
            if (window.google?.maps) {
                this.state.mapLoaded = true;
                return;
            }
            
            // Load Google Maps with API key if available
            let mapsUrl = "https://maps.googleapis.com/maps/api/js";
            if (this.state.apiKey) {
                mapsUrl += `?key=${this.state.apiKey}`;
            } else {
                console.warn("No Google Maps API key configured. Map may have limited functionality.");
            }
            
            await loadJS(mapsUrl);
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
                ["name", "partner_latitude", "partner_longitude"],
                { limit: 100 }
            );
            console.log("Loaded locations:", this.state.locations.length);
        } catch (error) {
            console.error("Error loading locations:", error);
            this.state.locations = [];
        }
    }

    initMap() {
        const mapElement = document.getElementById("gmap_container");
        if (!mapElement) {
            console.error("Map element not found");
            return;
        }

        this.map = new google.maps.Map(mapElement, {
            center: { lat: 0, lng: 0 },
            zoom: 2,
        });

        // Add markers
        const bounds = new google.maps.LatLngBounds();
        let hasMarkers = false;

        this.state.locations.forEach((loc) => {
            if (loc.partner_latitude && loc.partner_longitude) {
                const position = { 
                    lat: loc.partner_latitude, 
                    lng: loc.partner_longitude 
                };
                
                const marker = new google.maps.Marker({
                    position: position,
                    map: this.map,
                    title: loc.name || "Partner",
                });

                bounds.extend(position);
                hasMarkers = true;

                // Add click listener
                marker.addListener("click", () => {
                    this.openRecord(loc.id);
                });
            }
        });

        // Fit bounds if we have markers
        if (hasMarkers) {
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
    
    onSearchUpdate() {
        // Reload locations when search/filters change
        this.loadLocations().then(() => {
            if (this.map) {
                this.initMap();
            }
        });
    }
}