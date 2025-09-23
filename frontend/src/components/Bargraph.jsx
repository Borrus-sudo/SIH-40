import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { fetchMeasurements } from "../api/fetch";

function HueBarGraph({ valueField = 'temperature', labelField = 'depth', title = 'Bargraph' }) {
  const svgRef = useRef();
  const width = 960;
  const height = 500;
  const margin = { top: 20, right: 30, bottom: 100, left: 60 }; // increased bottom

  const [data, setData] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);

  useEffect(() => {
    fetchMeasurements()
      .then((res) => {
        console.log("Fetched data:", res);
        if (!res || res.length === 0) return [];
        setData(res);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!data || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleBand()
      .domain(data.map((_, i) => i))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[valueField]) || 100])
      .range([height - margin.bottom, margin.top])
      .nice();

    const colorScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[valueField]) || 100])
      .range([240, 0]);

    // X Axis with rotated labels and fewer ticks
    const xAxis = d3.axisBottom(xScale)
      .tickValues(data.map((_, i) => i).filter((d, i) => i % 5 === 0)) // every 5th tick
      .tickFormat((i) => data[i][labelField] !== undefined ? Math.round(data[i][labelField]) : i);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

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
      .text("Temperature (°C)");

    // Bars
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (_, i) => xScale(i))
      .attr("y", (d) => yScale(d[valueField]))
      .attr("width", xScale.bandwidth())
      .attr(
        "height",
        (d) => height - margin.bottom - yScale(d[valueField])
      )
      .attr("fill", (d) => `hsl(${colorScale(d[valueField])}, 100%, 50%)`)
      .attr("stroke", "#000")
      .attr("opacity", 0.8)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("click", (_, d) => setSelectedBar(d));
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
      <svg ref={svgRef} width={width} height={height}></svg>

      {selectedBar && (
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
          <p><b>Depth:</b> {selectedBar.depth} m</p>
          <p><b>Temperature:</b> {selectedBar.temperature} °C</p>
          <button onClick={() => setSelectedBar(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default HueBarGraph;
