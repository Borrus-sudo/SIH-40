
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Dashboard from './components/Dashboard';
import Map from './components/map';
import Geomaps from './components/Geomaps';
import Bargraph from './components/Bargraph';
import HeatmapGraph from './components/Heatmap';
import LayerHeatmap from './components/LayerHeatmap';
import DensityContour from './components/DensityContour';
import Linegraphs from './components/Linegraphs';
import SalinityHeatmap from './components/SalinityHeatmap';
import PressureHeatmap from './components/PressureHeatmap';
function OceanVizApp() {
    const [chatOpen, setChatOpen] = useState(false);
    const [activePage, setActivePage] = useState('Dashboard');

    return (
        <div className="flex h-screen bg-[#021b2c] text-white">
            <Navbar activePage={activePage} setActivePage={setActivePage} />

            <div className="flex-1 relative bg-gradient-to-b from-[#03263d] to-[#00121e] overflow-y-auto">
                {activePage !== 'Dashboard' && (
                    <button
                        onClick={() => setActivePage('Dashboard')}
                        className="absolute top-4 left-4 z-10 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-md shadow"
                    >
                        ← Back to Home
                    </button>
                )}
                {activePage === 'Dashboard' && <Dashboard setActivePage={setActivePage} />}
                {activePage === 'Map' && <Map />}
                {activePage === 'Geomaps' && <Geomaps />}
                {activePage === 'Bargraph' && <Bargraph />}
                {activePage === 'HeatmapGraph' && <HeatmapGraph />}
                {activePage === 'LayerHeatmap' && <LayerHeatmap />}
                {activePage === 'DensityContour' && <DensityContour />}
                {activePage === 'Linegraphs' && <Linegraphs />}
                {activePage === 'Salinity' && <SalinityHeatmap />}
                {activePage === 'Pressure' && <PressureHeatmap />}

                {/* Chatbot Button */}
                <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition"
                >
                    🤖
                </button>
                <Chatbot chatOpen={chatOpen} setChatOpen={setChatOpen} />
            </div>
        </div>
    );
}

export default OceanVizApp;