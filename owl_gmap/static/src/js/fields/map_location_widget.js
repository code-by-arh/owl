/** @odoo-module */

import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { Component, onWillStart, onMounted, onWillUpdateProps, useState, useRef } from "@odoo/owl";
import { loadJS } from "@web/core/assets";
import { rpc } from "@web/core/network/rpc";
import { useService } from "@web/core/utils/hooks";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

export class MapLocationField extends Component {
    static template = "owl_gmap.MapLocationWidget";
    static props = standardFieldProps;

    setup() {
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.mapContainer = useRef("mapContainer");
        
        this.state = useState({
            mapLoaded: false,
            apiKey: null,
            address: "",
            lat: null,
            lng: null,
        });

        this.map = null;
        this.marker = null;
        this.geocoder = null;

        onWillStart(async () => {
            await this.fetchApiKey();
            await this.loadGoogleMaps();
            await this.loadInitialData();
        });

        onMounted(() => {
            if (this.state.mapLoaded) {
                this.initMap();
            }
        });

        onWillUpdateProps((nextProps) => {
            // Update map when record changes
            if (nextProps.record.id !== this.props.record.id) {
                this.loadInitialData();
                if (this.map) {
                    this.updateMapPosition();
                }
            }
        });
    }

    async fetchApiKey() {
        try {
            const result = await rpc("/gmaps/get_api_key", {});
            this.state.apiKey = result;
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
            let mapsUrl = "https://maps.googleapis.com/maps/api/js?libraries=places";
            if (this.state.apiKey) {
                mapsUrl += `&key=${this.state.apiKey}`;
            }
            
            await loadJS(mapsUrl);
            this.state.mapLoaded = true;
        } catch (error) {
            console.error("Error loading Google Maps:", error);
            this.notification.add("Failed to load Google Maps", { type: "danger" });
        }
    }

    async loadInitialData() {
        const record = this.props.record;
        
        // Get latitude and longitude from record
        this.state.lat = record.data.partner_latitude || null;
        this.state.lng = record.data.partner_longitude || null;
        
        // Get address fields
        const street = record.data.street || "";
        const street2 = record.data.street2 || "";
        const city = record.data.city || "";
        const state_id = record.data.state_id;
        const state = state_id && state_id[1] ? state_id[1] : "";
        const zip = record.data.zip || "";
        const country_id = record.data.country_id;
        const country = country_id && country_id[1] ? country_id[1] : "";
        
        // Construct full address
        const addressParts = [street, street2, city, state, zip, country].filter(Boolean);
        this.state.address = addressParts.join(", ");
    }

    initMap() {
        if (!this.mapContainer.el) {
            return;
        }

        // Default to coordinates or a default location
        let center = { lat: 0, lng: 0 };
        let zoom = 2;

        if (this.state.lat && this.state.lng) {
            center = { lat: this.state.lat, lng: this.state.lng };
            zoom = 15;
        }

        // Initialize map
        this.map = new google.maps.Map(this.mapContainer.el, {
            center: center,
            zoom: zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
        });

        // Initialize geocoder
        this.geocoder = new google.maps.Geocoder();

        // Add marker
        this.marker = new google.maps.Marker({
            position: center,
            map: this.map,
            draggable: true,
            animation: google.maps.Animation.DROP,
            title: "Drag to update location",
        });

        // Add marker drag listener
        this.marker.addListener("dragend", () => {
            const position = this.marker.getPosition();
            this.updateCoordinates(position.lat(), position.lng());
        });

        // Add map click listener
        this.map.addListener("click", (event) => {
            this.marker.setPosition(event.latLng);
            this.updateCoordinates(event.latLng.lat(), event.latLng.lng());
        });

        // If no coordinates but we have an address, geocode it
        if (!this.state.lat && !this.state.lng && this.state.address) {
            this.geocodeAddress();
        }
    }

    async geocodeAddress() {
        if (!this.geocoder || !this.state.address) {
            return;
        }

        this.geocoder.geocode({ address: this.state.address }, (results, status) => {
            if (status === "OK" && results[0]) {
                const location = results[0].geometry.location;
                this.map.setCenter(location);
                this.map.setZoom(15);
                this.marker.setPosition(location);
                this.updateCoordinates(location.lat(), location.lng());
            } else if (status === "ZERO_RESULTS") {
                this.notification.add("Address not found on map", { type: "warning" });
            }
        });
    }

    async updateCoordinates(lat, lng) {
        this.state.lat = lat;
        this.state.lng = lng;

        try {
            // Update the record's latitude and longitude fields
            if (this.props.record) {
                await this.props.record.update({
                    partner_latitude: lat,
                    partner_longitude: lng,
                });
                this.notification.add("Location updated", { type: "success" });
            }
        } catch (error) {
            console.error("Error updating coordinates:", error);
            this.notification.add("Failed to update location", { type: "danger" });
        }
    }

    onGeocodeClick() {
        this.geocodeAddress();
    }

    onClearClick() {
        this.marker.setPosition({ lat: 0, lng: 0 });
        this.map.setCenter({ lat: 0, lng: 0 });
        this.map.setZoom(2);
        this.updateCoordinates(null, null);
    }

    get displayCoordinates() {
        if (this.state.lat && this.state.lng) {
            return `${this.state.lat.toFixed(6)}, ${this.state.lng.toFixed(6)}`;
        }
        return "No location set";
    }
}

export const mapLocationField = {
    component: MapLocationField,
    displayName: _t("Map Location"),
    supportedTypes: ["float"],
};

registry.category("fields").add("map_location", mapLocationField);