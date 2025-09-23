import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchMeasurements } from "../api/fetch";

function DensityContourPlot({ xField = 'depth', yField = 'temperature', xLabel = 'Depth (m)', yLabel = 'Temperature (°C)' }) {
  const svgRef = useRef();
  const width = 960;
  const height = 500;
  const margin = { top: 50, right: 50, bottom: 80, left: 80 }; // more margin for padding

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchMeasurements()
      .then((res) => {
        if (!res || res.length === 0) return;
        setData(res);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // X scale
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[xField])])
      .range([margin.left, width - margin.right]);

    // Y scale
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yField])])
      .range([height - margin.bottom, margin.top]);

    // Contour density
    const densityData = d3.contourDensity()
      .x((d) => xScale(d[xField]))
      .y((d) => yScale(d[yField]))
      .size([width, height])
      .bandwidth(30)
      (data);

    // Color scale for contours
    const colorScale = d3
      .scaleSequential(d3.interpolateTurbo)
      .domain([0, d3.max(densityData, (d) => d.value)]);

    // Draw contours
    svg
      .selectAll("path")
      .data(densityData)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", (d) => colorScale(d.value))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.8);

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("x", (width + margin.left - margin.right) / 2)
      .attr("y", 50)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(xLabel);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(yLabel);

    // Optional: overlay scatter points
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[xField]))
      .attr("cy", (d) => yScale(d[yField]))
      .attr("r", 4)
      .attr("fill", "black")
      .attr("opacity", 0.5);

  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default DensityContourPlot;
