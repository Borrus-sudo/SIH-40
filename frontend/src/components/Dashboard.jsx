import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function LineChart({ data, title, color }) {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 300;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const x = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.x))
            .range([margin.left, width - margin.right]);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.y)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const line = d3
            .line()
            .x((d) => x(d.x))
            .y((d) => y(d.y));

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', line);
    }, [data]);

    return (
        <div className="bg-[#03263d] p-4 rounded-xl shadow-xl border border-cyan-700">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <svg ref={svgRef} width={300} height={200}></svg>
        </div>
    );
}

function Dashboard() {
    const tempData = Array.from({ length: 20 }, (_, i) => ({
        x: i * 5,
        y: Math.random() * 25,
    }));
    const salData = Array.from({ length: 20 }, (_, i) => ({
        x: i * 5,
        y: Math.random() * 40,
    }));
    const presData = Array.from({ length: 20 }, (_, i) => ({
        x: i * 5,
        y: Math.random() * 1000,
    }));

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <LineChart
                title="Temperature vs Depth"
                data={tempData}
                color="cyan"
            />
            <LineChart
                title="Salinity vs Depth"
                data={salData}
                color="orange"
            />
            <LineChart title="Pressure vs Depth" data={presData} color="lime" />
        </div>
    );
}

export default Dashboard;