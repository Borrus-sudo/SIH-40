import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat"; 

const HeatMap = () => {
  useEffect(() => {
    
    const map = L.map("map").setView([-37.87, 175.475], 11);

     
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

     
    const points = [
      [-37.87, 175.475],
      [-37.88, 175.48],
      [-37.86, 175.46],
    ];

     
    L.heatLayer(points, { radius: 25 }).addTo(map);

     
    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
};

export default HeatMap;
