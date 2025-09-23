import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { fetchMeasurements } from '../api/fetch'

const Heatmap = ({ xField = 'depth', yField = 'temperature', xBins = 30, yBins = 30, xLabel = 'Depth', yLabel = 'Temperature' }) => {
  const svgRef = useRef()
  const [data, setData] = useState([])

  useEffect(() => {
    fetchMeasurements().then(setData)
  }, [])

  useEffect(() => {
    if (!data.length) return

    const margin = { top: 20, right: 50, bottom: 50, left: 60 }
    const width = 700 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    svg.selectAll('*').remove()

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[xField]))
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[yField]))
      .range([height, 0])

    // Bin data
    const xBinsArr = d3.bin().domain(xScale.domain()).thresholds(xBins)(data.map(d => d[xField]))
    const yBinsArr = d3.bin().domain(yScale.domain()).thresholds(yBins)(data.map(d => d[yField]))

    const freqMap = {}
    data.forEach(d => {
      const xBin = xBinsArr.findIndex(b => d[xField] >= b.x0 && d[xField] < b.x1)
      const yBin = yBinsArr.findIndex(b => d[yField] >= b.x0 && d[yField] < b.x1)
      const key = `${xBin}-${yBin}`
      freqMap[key] = (freqMap[key] || 0) + 1
    })

    const maxCount = d3.max(Object.values(freqMap))

    const colorScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([0, maxCount])

    const cellWidth = width / xBinsArr.length
    const cellHeight = height / yBinsArr.length

    // Draw heatmap cells
    for (let xi = 0; xi < xBinsArr.length; xi++) {
      for (let yi = 0; yi < yBinsArr.length; yi++) {
        const key = `${xi}-${yi}`
        g.append('rect')
          .attr('x', xi * cellWidth)
          .attr('y', yi * cellHeight)
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('fill', colorScale(freqMap[key] || 0))
      }
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .text(xLabel)

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(10))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('fill', 'black')
      .text(yLabel)

    // Legend
    const legendHeight = 200
    const legendWidth = 20
    const legendScale = d3.scaleLinear().domain([0, maxCount]).range([legendHeight, 0])
    const legendAxis = d3.axisRight(legendScale).ticks(5)

    const legend = svg.append('g')
      .attr('transform', `translate(${width + margin.left + 10},${margin.top})`)

    const legendGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%')

    legendGradient.append('stop').attr('offset', '0%').attr('stop-color', colorScale(maxCount))
    legendGradient.append('stop').attr('offset', '100%').attr('stop-color', colorScale(0))

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')

    legend.append('g')
      .attr('transform', `translate(${legendWidth},0)`)
      .call(legendAxis)

  }, [data])

  return <svg ref={svgRef}></svg>
}

export default Heatmap
