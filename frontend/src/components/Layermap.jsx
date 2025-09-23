import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchMeasurements } from "./fetch";

const Layermap = () => {
  useEffect(() => {
    const map = L.map("map").setView([0, 0], 2);

    // Base tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    async function loadData() {
      const measurements = await fetchMeasurements();
      if (!measurements || measurements.length === 0) return;

      // Generate random lat/lng for demo (replace with actual lat/lng when available)
      const points = measurements.map((m) => {
        const lat = -50 + Math.random() * 100;
        const lng = -180 + Math.random() * 360;
        return { ...m, lat, lng };
      });

      // For each point, create a colored marker and a circle heatmap around it
      points.forEach((p) => {
        // Hue based on temperature (cold=blue, hot=red)
        const hue = Math.max(0, Math.min(240 - (p.temperature * 12), 240)); // 0-240 hue
        const color = `hsl(${hue}, 100%, 50%)`;

        // Marker as a small colored circle
        L.circleMarker([p.lat, p.lng], {
          radius: 8,
          fillColor: color,
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(
            `<b>Temperature:</b> ${p.temperature} °C<br><b>Depth:</b> ${p.depth} m`
          );

        // Circle around marker representing "heat" intensity
        L.circle([p.lat, p.lng], {
          radius: 50000, // meters, adjust to your preference
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          weight: 1,
        }).addTo(map);
      });

      // Fit map to all points
      const group = L.featureGroup(points.map((p) => L.marker([p.lat, p.lng])));
      map.fitBounds(group.getBounds().pad(0.1));
    }

    loadData();

    return () => map.remove();
  }, []);

  return <div id="map" style={{ width: "100%", height: "100vh" }} />;
};

export default Layermap;
