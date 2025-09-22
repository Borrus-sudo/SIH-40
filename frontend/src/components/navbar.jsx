import React from "react";
import { LayoutDashboard, Home, Thermometer, Droplets, Gauge } from "lucide-react";


function Navbar({ activePage, setActivePage }) {
    const navItems = [
        { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Home", icon: <Home size={18} /> },
        { name: "Temperature", icon: <Thermometer size={18} /> },
        { name: "Salinity", icon: <Droplets size={18} /> },
        { name: "Pressure", icon: <Gauge size={18} /> },
    ];


    return (
        <div className="w-64 bg-[#03263d] p-4 flex flex-col space-y-4 shadow-xl">
            <h1 className="text-2xl font-bold text-cyan-400">OceanViz</h1>
            <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => setActivePage(item.name)}
                        className={`flex items-center gap-3 text-left px-3 py-2 rounded-xl transition ${activePage === item.name ? "bg-cyan-700" : "hover:bg-cyan-600/30"
                            }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}


export default Navbar;