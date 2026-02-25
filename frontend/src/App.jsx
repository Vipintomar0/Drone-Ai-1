import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
    Activity,
    Wind,
    Battery,
    Map as MapIcon,
    ShieldCheck,
    Eye,
    Navigation,
    AlertTriangle,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

const socket = io('http://localhost:5000');

const App = () => {
    const [telemetry, setTelemetry] = useState({
        armed: false,
        mode: 'STABILIZE',
        battery: 100,
        gps: { lat: 0, lon: 0, alt: 0 },
        vision_targets: []
    });

    const [altHistory, setAltHistory] = useState([]);

    useEffect(() => {
        socket.on('telemetry', (data) => {
            setTelemetry(data);
            setAltHistory(prev => [...prev.slice(-20), { time: new Date().toLocaleTimeString(), alt: data.gps.alt }]);
        });

        return () => socket.off('telemetry');
    }, []);

    return (
        <div className="dashboard-container">
            {/* Left Panel: Flight Data */}
            <div className="flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card"
                >
                    <div className="hud-title"><Activity size={16} /> Flight Status</div>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span className="text-dim">Engine</span>
                            <span className={telemetry.armed ? 'text-accent-green' : 'text-accent-red'}>
                                {telemetry.armed ? 'ARMED' : 'DISARMED'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-dim">Mode</span>
                            <span className="text-primary font-bold">{telemetry.mode}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                >
                    <div className="hud-title"><Zap size={16} /> Power Systems</div>
                    <div className="stat-value">{telemetry.battery}%</div>
                    <div className="w-full bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${telemetry.battery}%` }}
                            style={{ boxShadow: '0 0 10px var(--primary)' }}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card flex-grow"
                >
                    <div className="hud-title"><Navigation size={16} /> Altitude Profile</div>
                    <div className="h-48 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={altHistory}>
                                <Line
                                    type="monotone"
                                    dataKey="alt"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: 'none', borderRadius: '8px' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Center Panel: AI Vision Feed */}
            <div className="flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card relative flex-grow overflow-hidden flex items-center justify-center min-h-[400px]"
                >
                    <div className="absolute top-4 left-4 hud-title"><Eye size={16} /> AI Vision Engine - Live</div>
                    <div className="text-center opacity-30">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-64 h-64 border-2 border-dashed border-primary rounded-full mb-4 flex items-center justify-center">
                                <ShieldCheck size={120} className="text-primary" />
                            </div>
                            <span className="text-xl tracking-widest uppercase">Initializing Neural Link...</span>
                        </div>
                    </div>

                    {/* Simulated Detection Overlays */}
                    <AnimatePresence>
                        {telemetry.vision_targets.map((target, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute border-2 border-primary"
                                style={{
                                    left: target.bbox[0],
                                    top: target.bbox[1],
                                    width: target.bbox[2],
                                    height: target.bbox[3]
                                }}
                            >
                                <div className="absolute -top-6 left-0 bg-primary text-black text-xs font-bold px-2 py-0.5">
                                    {target.label} {Math.round(target.confidence * 100)}%
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Right Panel: Mission Logic */}
            <div className="flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card"
                >
                    <div className="hud-title"><MapIcon size={16} /> Mission Intelligence</div>
                    <div className="flex flex-col gap-4">
                        <button className="w-full py-4 bg-primary/10 border border-primary/40 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                            <Navigation size={18} /> Set Home Point
                        </button>
                        <button className="w-full py-4 bg-accent-red/10 border border-accent-red/40 text-accent-red font-bold rounded-xl hover:bg-accent-red/20 transition-all">
                            EMERGENCY RTL
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card flex-grow"
                >
                    <div className="hud-title"><AlertTriangle size={16} /> System Logs</div>
                    <div className="text-xs font-mono text-dim space-y-2 max-h-[400px] overflow-y-auto">
                        <div className="text-accent-green">[SYS] Pre-flight connection: OK</div>
                        <div className="text-primary">[AI] Vision Engine Model Loaded: YOLOv5s</div>
                        <div>[MAV] FCU Heartbeat: Fixed-wing found</div>
                        <div className="text-accent-red">[WARN] Geofence active in current sector</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default App;
