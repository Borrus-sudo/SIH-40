import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchMeasurements } from "../api/fetch";

function HueScatterPlot() {
  const svgRef = useRef();
  const width = 960;
  const height = 500;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchMeasurements().then(setData);
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear previous content

    // --- Scales ---
    const xScale = d3
      .scaleLinear()
      .domain([0, data.length]) // use index for x
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, d => d.depth), d3.max(data, d => d.depth)])
      .range([height - margin.bottom, margin.top]);

    // Color scale: temperature to hue (cold=blue, hot=red)
    const colorScale = d3
      .scaleLinear()
      .domain([d3.min(data, d => d.temperature), d3.max(data, d => d.temperature)])
      .range([240, 0]); // hue: blue(240) → red(0)

    // --- Axes ---
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Measurement Index");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Depth (m)");

    // --- Scatter points ---
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(i))
      .attr("cy", d => yScale(d.depth))
      .attr("r", 6)
      .attr("fill", d => `hsl(${colorScale(d.temperature)}, 100%, 50%)`)
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 10);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("r", 6);
      });
  }, [data]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default HueScatterPlot;
