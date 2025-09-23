import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, FeatureGroup } from 'react-leaflet'

import * as d3 from 'd3'
import { fetchMeasurements } from '../api/fetch'
import 'leaflet/dist/leaflet.css'

function Geomaps() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchMeasurements().then(measurements => {
      if (!measurements || !measurements.length) return
      const dataWithCoords = measurements
        .filter(d => d.depth != null && d.temperature != null)
        .map(d => ({
          ...d,
          lat: -60 + Math.random() * 120,
          lon: -180 + Math.random() * 360
        }))
      setData(dataWithCoords)
    })
  }, [])

  if (!data.length) return <p>Loading map...</p>

  const tempExtent = d3.extent(data, d => d.temperature)
  const colorScale = d3.scaleSequential(d3.interpolateInferno).domain(tempExtent)

  const depthExtent = d3.extent(data, d => d.depth)
  const sizeScale = d3.scaleLinear().domain(depthExtent).range([5, 20])

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      <FeatureGroup>
        {data.map((d, idx) => (
          <CircleMarker
            key={idx}
            center={[d.lat, d.lon]}
            radius={sizeScale(d.depth)}
            fillColor={colorScale(d.temperature)}
            color="#333"
            fillOpacity={0.7}
            stroke={true}
            weight={1}
          >
            <Popup>
              <div>
                <strong>Depth:</strong> {d.depth} m<br />
                <strong>Temperature:</strong> {d.temperature} °C
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </FeatureGroup>
    </MapContainer>
  )
}

export default Geomaps
