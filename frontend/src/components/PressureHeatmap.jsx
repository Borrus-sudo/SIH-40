import React, { useEffect, useMemo, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import Map from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import { fetchMeasurements } from '../api/fetch'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
}

export default function PressureHeatmap() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchMeasurements().then((rows) => setData(rows || []))
  }, [])

  function randomLatLon() {
    return {
      lat: -90 + Math.random() * 180,
      lon: -180 + Math.random() * 360,
    }
  }

  const points = useMemo(() => {
    return (data || [])
      .filter(d => d && d.pressure != null)
      .map(d => {
        const lat = d.lat ?? randomLatLon().lat
        const lon = d.long ?? d.lon ?? randomLatLon().lon
        return {
          position: [Number(lon), Number(lat)],
          weight: Number(d.pressure)
        }
      })
  }, [data])

  const layers = [
    new HeatmapLayer({
      id: 'pressure-heatmap',
      data: points,
      getPosition: d => d.position,
      getWeight: d => d.weight,
      radiusPixels: 40,
      aggregation: 'MEAN',
      intensity: 1,
      threshold: 0.03,
      colorRange: [
        [255, 255, 178, 30],
        [254, 217, 118, 60],
        [254, 178, 76, 90],
        [253, 141, 60, 150],
        [240, 59, 32, 220],
        [189, 0, 38, 255]
      ],
    })
  ]

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller layers={layers}>
        <Map reuseMaps mapLib={maplibregl} mapStyle={MAP_STYLE} />
      </DeckGL>
    </div>
  )
}


