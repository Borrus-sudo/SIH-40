import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { fetchMeasurements } from '../../../ArgoMaps/src/api/fetch'

function StreamGraph() {
  const svgRef = useRef()
  const width = 1800          // very wide
  const height = 1000         // taller
  const margin = { top: 50, right: 80, bottom: 80, left: 100 }  // spacious margins

  const [data, setData] = useState([])

  useEffect(() => {
    fetchMeasurements().then(setData)
  }, [])

  useEffect(() => {
    if (!data.length) return

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
    svg.selectAll('*').remove()

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Prepare data: group by depth
    const depths = Array.from(new Set(data.map(d => d.depth)))
    const timePoints = d3.range(data.length) // use indices or timestamps if available

    const stackData = timePoints.map((i) => {
      const obj = {}
      depths.forEach(depth => {
        const d = data[i]
        obj[depth] = d && d.depth === depth ? d.temperature : 0
      })
      return obj
    })

    const stack = d3.stack()
      .keys(depths)
      .offset(d3.stackOffsetWiggle) // smooth flowing stream
    const series = stack(stackData)

    // X scale
    const xScale = d3.scaleLinear()
      .domain([0, timePoints.length - 1])
      .range([0, innerWidth])

    // Y scale
    const yExtent = [
      d3.min(series, s => d3.min(s, d => d[0])),
      d3.max(series, s => d3.max(s, d => d[1]))
    ]
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([innerHeight, 0])

    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(depths)

    // Area generator
    const area = d3.area()
      .x((d, i) => xScale(i))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveBasis)

    // Draw layers
    g.selectAll('path')
      .data(series)
      .enter()
      .append('path')
      .attr('d', area)
      .attr('fill', d => colorScale(d.key))
      .attr('stroke', 'black')
      .attr('stroke-width', 0.4)
      .attr('opacity', 0.85)

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(20))
      .selectAll('text')
      .attr('font-size', '16px')
      .attr('fill', 'black')

    g.append('text')  // X-axis label
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .attr('fill', 'black')
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text('Time / Index')

    // Y-axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '16px')
      .attr('fill', 'black')

    g.append('text')  // Y-axis label
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -70)
      .attr('fill', 'black')
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text('Temperature')

  }, [data])

  return <svg ref={svgRef}></svg>
}

export default StreamGraph
