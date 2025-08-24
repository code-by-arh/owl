/** @odoo-module */

import { loadJS } from "@web/core/assets";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, onMounted, onWillUnmount, useState, onWillUpdateProps } from "@odoo/owl";
import { Layout } from "@web/search/layout";

export class GoogleMap extends Component {
    static template = "owl_gmap.GoogleMap";
    static components = { Layout };
    static props = ["*"];

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        this.http = useService("http");

        this.state = useState({
            locations: [],
        });

        this.mapLayers = useState({
            showMarkers: true,
            showChoropleth: true,
            choroplethType: "country",
        });

        this.markers = [];
        this.dataClickListener = null;

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
            window.openRecord = this.openRecord.bind(this);
        });

        onWillUnmount(() => {
            this.cleanupMap();
        });

        onWillUpdateProps(async (nextProps) => {
            await this.reloadMap(nextProps.domain);
        });
    }

    async loadGoogleMaps() {
        try {
            const response = await this.http.post("/gmaps/get_api_key", {});
            const apiKey = response;
            if (!apiKey) {
                console.error("Google Maps API key not configured");
                return;
            }
            await Promise.all([
                loadJS(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`),
                loadJS("/owl_gmap/static/lib/markerclustererplus.min.js"),
            ]);
        } catch (error) {
            console.error("Error loading Google Maps:", error);
            // For testing, load without API key (will show "For development purposes only" watermark)
            await Promise.all([
                loadJS(`https://maps.googleapis.com/maps/api/js?libraries=visualization`),
                loadJS("/owl_gmap/static/lib/markerclustererplus.min.js"),
            ]);
        }
    }

    async loadLocations() {
        const resModel = this.props.resModel || "res.partner";
        const domain = this.props.domain || [];
        this.state.locations = await this.orm.searchRead(
            resModel,
            domain,
            ["name", "partner_latitude", "partner_longitude", "country_id"],
        );
    }

    async reloadMap(newDomain) {
        if (newDomain) {
            this.props.domain = newDomain;
        }
        this.cleanupMap();
        await this.loadLocations();
        this.initMap();
    }

    cleanupMap() {
        if (this.markerCluster) this.markerCluster.setMap(null);
        if (this.map) {
            this.map.data.forEach((feature) => this.map.data.remove(feature));
            this.map = null;
        }
        const el = document.getElementById("map");
        if (el) el.innerHTML = "";
    }

    initMap() {
        this.map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 20.0, lng: 150.0 },
            zoom: 2,
            mapId: "my-map-id",
        });

        // Control buttons container
        const toggleContainer = document.createElement("div");
        toggleContainer.style.margin = "10px";
        toggleContainer.style.display = "flex";
        toggleContainer.style.gap = "5px";

        // Create and style marker toggle button
        const markerBtn = document.createElement("button");
        markerBtn.textContent = "Toggle Markers";
        markerBtn.className = "custom-map-button";
        markerBtn.onclick = () => {
            this.toggleMarkerLayer();
            markerBtn.className = this.mapLayers.showMarkers
                ? "custom-map-button selected"
                : "custom-map-button";
        };
        if (this.mapLayers.showMarkers) markerBtn.classList.add("selected");

        // Country Choropleth toggle button
        const countryBtn = document.createElement("button");
        countryBtn.textContent = "Color by Country";
        countryBtn.className = "custom-map-button selected";
        countryBtn.onclick = () => {
            this.toggleChoroplethLayer("country");
            if (this.mapLayers.showChoropleth) {
                countryBtn.classList.add("selected");
            } else {
                countryBtn.classList.remove("selected");
            }
        };

        toggleContainer.append(markerBtn, countryBtn);
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleContainer);

        this.addMarkersWithClusters();
        this.loadChoroplethMap();
    }

    async addMarkersWithClusters() {
        const infoWindow = new google.maps.InfoWindow();

        this.markers = this.state.locations.map((loc) => {
            const initial = loc.initial || loc.name?.charAt(0) || "?";

            const marker = new google.maps.Marker({
                position: { lat: loc.partner_latitude, lng: loc.partner_longitude },
                map: this.map,
                title: loc.name,
                label: {
                    text: initial.toUpperCase(),
                    color: "#fff",
                    fontWeight: "bold",
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: "#1978d2",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#fff",
                },
            });

            marker.addListener("click", () => {
                infoWindow.setContent(`
                    <h2>${loc.name}</h2>
                    <div>${loc.partner_latitude}, ${loc.partner_longitude}<br/>
                    <a onclick="openRecord(${loc.id}, '${loc.name}')">View Partner</a>
                    </div>
                `);
                infoWindow.open(this.map, marker);
            });

            return marker;
        });

        this.markerCluster = new MarkerClusterer(this.map, this.markers, {
            imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            maxZoom: 17,
        });
    }

    toggleMarkerLayer() {
        if (this.mapLayers.showMarkers) {
            if (this.markerCluster) {
                this.markerCluster.clearMarkers();
                this.markerCluster.setMap(null);
            }
            this.markers.forEach((m) => m.setMap(null));
        } else {
            this.markers.forEach((m) => m.setMap(this.map));
            this.markerCluster = new MarkerClusterer(this.map, this.markers, {
                imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                maxZoom: 17,
            });
        }

        this.mapLayers.showMarkers = !this.mapLayers.showMarkers;
    }

    async toggleChoroplethLayer(type) {
        if (this.mapLayers.choroplethType === type && this.mapLayers.showChoropleth) {
            this.map.data.forEach((f) => this.map.data.remove(f));
            this.mapLayers.showChoropleth = false;
            return;
        }

        this.map.data.forEach((f) => this.map.data.remove(f));

        this.mapLayers.choroplethType = type;
        this.mapLayers.showChoropleth = true;

        this.loadChoroplethMap();
    }

    async loadChoroplethMap() {
        const res = await fetch("/owl_gmap/static/src/data/world-countries.geojson");
        const geojson = await res.json();

        let countryAggregation = {};
        this.state.locations.forEach((loc) => {
            const country = loc.country_id[1]; // country_id is a many2one, so we take the name
            if (country) {
                countryAggregation[country] = (countryAggregation[country] || 0) + 1;
            }
        });

        this.map.data.forEach((f) => this.map.data.remove(f));
        this.map.data.addGeoJson(geojson);

        this.map.data.setStyle((feature) => {
            const countryName = feature.getProperty("name");
            const count = countryAggregation[countryName] || 0;
            return {
                fillColor: this.getColor(count),
                fillOpacity: 0.5,
                strokeColor: "#bbb",
                strokeWeight: 1,
            };
        });

        const infoWindow = new google.maps.InfoWindow();
        if (this.dataClickListener) {
            google.maps.event.removeListener(this.dataClickListener);
            this.dataClickListener = null;
        }

        this.dataClickListener = this.map.data.addListener("click", (event) => {
            const name = event.feature.getProperty("name");
            const count = countryAggregation[name] || 0;
            infoWindow.setContent(`<strong>${name}</strong><br/>${count} partners`);
            infoWindow.setPosition(event.latLng);
            infoWindow.open(this.map);
        });
    }

    getColor(count) {
        if (count > 100) return "#a50026";
        if (count > 50) return "#d73027";
        if (count > 25) return "#fc8d59";
        if (count > 10) return "#fee08b";
        if (count > 0) return "#d9f0a3";
        return "#e0f3db";
    }

    openRecord(partnerId) {
        this.action.doAction({
            type: "ir.actions.act_window",
            res_model: this.props.resModel,
            res_id: partnerId,
            views: [[false, "form"]],
            target: "current",
        });
    }
}
