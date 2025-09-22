import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";


function Chatbot({ chatOpen, setChatOpen }) {
    return (
        <AnimatePresence>
            {chatOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute bottom-24 right-6 w-96 h-96 bg-[#03263d] rounded-2xl shadow-2xl border border-cyan-500"
                >
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">OceanViz Assistant</h3>
                            <button
                                className="text-white hover:bg-cyan-600/30 p-1 rounded"
                                onClick={() => setChatOpen(false)}
                            >
                                <X />
                            </button>
                        </div>
                        <div className="bg-cyan-900/30 rounded-xl p-3 h-40 overflow-y-auto text-sm mb-3">
                            <p><strong>You:</strong> Show me temperature anomalies in the South Pacific.</p>
                            <p className="mt-2"><strong>Bot:</strong> I found 27 ARGO floats reporting anomalies. Would you like to see them on the map?</p>
                        </div>
                        <div className="mt-3 py-15 flex">
                            <input
                                type="text"
                                placeholder="Ask about oceanographic data..."
                                className="flex-1 px-3 py-2 rounded-l-xl bg-cyan-950 border border-cyan-700 focus:outline-none"
                            />
                            <button className="rounded-r-xl bg-cyan-500 hover:bg-cyan-600 px-4">Send</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


export default Chatbot;