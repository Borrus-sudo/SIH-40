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

function randomLatLon() {
  return {
    lat: -90 + Math.random() * 180,
    lon: -180 + Math.random() * 360,
  }
}

export default function SalinityHeatmap() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchMeasurements().then((rows) => setData(rows || []))
  }, [])

  const points = useMemo(() => {
    return (data || [])
      .filter(d => d && d.salinity != null)
      .map(d => {
        const lat = d.lat ?? randomLatLon().lat
        const lon = d.long ?? d.lon ?? randomLatLon().lon
        return {
          position: [Number(lon), Number(lat)],
          weight: Number(d.salinity)
        }
      })
  }, [data])

  const layers = [
    new HeatmapLayer({
      id: 'salinity-heatmap',
      data: points,
      getPosition: d => d.position,
      getWeight: d => d.weight,
      radiusPixels: 40,
      aggregation: 'MEAN',
      intensity: 1,
      threshold: 0.03,
      colorRange: [
        [33, 102, 172, 30],
        [67, 147, 195, 60],
        [146, 197, 222, 90],
        [209, 229, 240, 150],
        [247, 247, 247, 200],
        [253, 219, 199, 220],
        [244, 165, 130, 230],
        [214, 96, 77, 240],
        [178, 24, 43, 255]
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


