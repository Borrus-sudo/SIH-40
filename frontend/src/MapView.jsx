import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../api/supabaseClient';

const MapView = () => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('measurements').select('*');
      if (error) console.error(error);
      else setPoints(data);
    };
    fetchData();
  }, []);

  return (
    <MapContainer center={[0, 160]} zoom={2} style={{ height: "70vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {points.map((pt, i) => (
        <CircleMarker
          key={i}
          center={[pt.latitude, pt.longitude]}
          radius={6}
          fillColor={pt.temperature > 20 ? "#ff3333" : "#007BFF"}
          color="#000"
          fillOpacity={0.7}
        >
          <Tooltip>
            <div>
              <div>{`Temp: ${pt.temperature}°C`}</div>
              <div>{`Salinity: ${pt.salinity}`}</div>
              <div>{`Lat: ${pt.latitude}, Lon: ${pt.longitude}`}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default MapView;
