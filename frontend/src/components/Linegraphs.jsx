import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchMeasurements } from "../api/fetch";

function HueLineGraph({
  xField = 'pres',
  yField = 'temp',
  xLabel = 'Depth (m)',
  yLabel = 'Temperature (°C)'
}) {
  const svgRef = useRef();
  const width = 960;
  const height = 500;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

  const [data, setData] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    fetchMeasurements()
      .then((res) => {
        if (!res || res.length === 0) return [];
        setData(res);
      })
      .catch((err) => console.error(err));
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

    // Color scale for points
    const colorScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yField])])
      .range([240, 0]);

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(xLabel);

    // Y Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -45)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(yLabel);

    // Line generator
    const lineGenerator = d3
      .line()
      .x((d) => xScale(d[xField]))
      .y((d) => yScale(d[yField]))
      .curve(d3.curveMonotoneX); // smooth line

    // Add line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // Add points
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d[xField]))
      .attr("cy", (d) => yScale(d[yField]))
      .attr("r", 5)
      .attr("fill", (d) => `hsl(${colorScale(d[yField])},100%,50%)`)
      .attr("stroke", "#000")
      .attr("opacity", 0.8)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1).attr("r", 7);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.8).attr("r", 5);
      })
      .on("click", (_, d) => setSelectedPoint(d));
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width={width} height={height}></svg>

      {selectedPoint && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 50,
            padding: "10px 15px",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        >
          <h4>Measurement Info</h4>
          <p>
            <b>Depth:</b> {selectedPoint.depth} m
          </p>
          <p>
            <b>Temperature:</b> {selectedPoint.temperature} °C
          </p>
          <button onClick={() => setSelectedPoint(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default HueLineGraph;
