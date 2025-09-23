import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import { fetchMeasurements } from '../api/fetch'

function D3WorldMap() {
  const svgRef = useRef()
  const [data, setData] = useState([])

  const width = 1000
  const height = 600

  useEffect(() => {
    fetchMeasurements().then(measurements => {
      // Add random lat/lon for demonstration
      const dataWithCoords = measurements.map(d => ({
        ...d,
        lat: -60 + Math.random() * 120,
        lon: -180 + Math.random() * 360
      }))
      setData(dataWithCoords)
    })
  }, [])

  useEffect(() => {
    if (!data.length) return

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
    svg.selectAll('*').remove()

    // Projection and path
    const projection = d3.geoMercator()
      .scale(150)
      .translate([width / 2, height / 1.5])

    const path = d3.geoPath().projection(projection)

    // Load world map TopoJSON
    d3.json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(worldData => {
      const countries = feature(worldData, worldData.objects.countries).features

      // Draw countries
      svg.selectAll('path')
        .data(countries)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#ddd')
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5)

      // Scales for data points
      const tempExtent = d3.extent(data, d => d.temperature)
      const colorScale = d3.scaleSequential(d3.interpolateInferno).domain(tempExtent)

      const depthExtent = d3.extent(data, d => d.depth)
      const sizeScale = d3.scaleLinear().domain(depthExtent).range([4, 12])

      // Plot data points
      svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => projection([d.lon, d.lat])[0])
        .attr('cy', d => projection([d.lon, d.lat])[1])
        .attr('r', d => sizeScale(d.depth))
        .attr('fill', d => colorScale(d.temperature))
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.7)
        .append('title')
        .text(d => `Depth: ${d.depth}, Temp: ${d.temperature}`)
    })
  }, [data])

  return <svg ref={svgRef}></svg>
}

export default D3WorldMap
