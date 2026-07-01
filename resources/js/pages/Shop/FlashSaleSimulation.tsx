import React, { useState, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function Dashboard({ initialStats }) {
    const [form, setForm] = useState({
        url: initialStats.default_url,
        product_id: initialStats.product_id,
        concurrency: 50,
    });

    const [isRunning, setIsRunning] = useState(false);
    const [currentStock, setCurrentStock] = useState(initialStats.current_stock);
    const [logs, setLogs] = useState([]);
    const [metrics, setMetrics] = useState({
        success: 0,
        failed: 0,
        duration: 0,
    });

    const terminalWindowRef = useRef(null);

    // Auto-scroll the terminal to the bottom when new logs stream in
    useEffect(() => {
        if (terminalWindowRef.current) {
            terminalWindowRef.current.scrollTop = terminalWindowRef.current.scrollHeight;
        }
    }, [logs]);

    const clearLogs = () => {
        setLogs([]);
        setMetrics({ success: 0, failed: 0, duration: 0 });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const launchSimulation = async (e) => {
        e.preventDefault();
        if (isRunning) return;

        setIsRunning(true);
        clearLogs();

        try {
            // Hit our backend orchestrator route
            const response = await axios.post('/developer/flash-sale-dashboard/run', form);
            const data = response.data;

            setMetrics({
                duration: data.duration_seconds,
                success: data.success_2xx,
                failed: data.failed_4xx_5xx,
            });

            setLogs(data.detailed_logs);

            // Adjust the local presentation stock counter dynamically
            setCurrentStock((prevStock) => Math.max(0, prevStock - data.success_2xx));
        } catch (error) {
            setLogs([
                {
                    timestamp: new Date().toLocaleTimeString(),
                    request_index: 'ERR',
                    user_id: 'SYSTEM',
                    status: error.response?.status || '500',
                    success: false,
                    message: error.response?.data?.error || 'Fatal Execution Error routing multi-handle streams.',
                },
            ]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div class="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
            <Head title="High-Concurrency Sandbox" />

            {/* Header Section */}
            <div class="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span class="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                        High-Concurrency System Sandbox
                    </h1>
                    <p class="text-slate-400 mt-1 text-sm">
                        Simulate massive parallel request loads hitting a single-statement atomic database configuration layout.
                    </p>
                </div>
                <div class="text-right">
                    <span class="px-3 py-1 bg-slate-800 border border-slate-700 text-xs rounded-full font-mono text-emerald-400">
                        Environment: Multi-Tenant TenantAware Pipeline
                    </span>
                </div>
            </div>

            <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Panel Column */}
                <div class="space-y-6">
                    <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            ⚙️ Attack Configuration
                        </h2>

                        <form onSubmit={launchSimulation} class="space-y-4">
                            <div>
                                <label class="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Target API Endpoint</label>
                                <input
                                    type="text"
                                    name="url"
                                    value={form.url}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
                                    readOnly
                                />
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Product Target ID</label>
                                    <input
                                        type="number"
                                        name="product_id"
                                        value={form.product_id}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Simulated Concurrency</label>
                                    <select
                                        name="concurrency"
                                        value={form.concurrency}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value={10}>10 HTTP Streams</option>
                                        <option value={25}>25 HTTP Streams</option>
                                        <option value={50}>50 HTTP Streams</option>
                                        <option value={100}>100 HTTP Streams</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isRunning}
                                className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 rounded-lg shadow-lg tracking-wide transition duration-150 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isRunning && (
                                    <div class="border-2 border-white border-t-transparent animate-spin rounded-full h-4 w-4 mr-2"></div>
                                )}
                                {isRunning ? 'Firing Requests...' : '🚀 Launch Parallel Load Test'}
                            </button>
                        </form>
                    </div>

                    {/* System Architecture Reviewer for Upwork Clients */}
                    <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                        <h3 class="text-sm font-semibold text-slate-300 mb-3 font-mono uppercase tracking-wider">🔒 Atomic Back-End Protection Logic</h3>
                        <pre class="bg-slate-950 p-4 rounded-lg text-xs font-mono text-teal-300 overflow-x-auto border border-slate-800">
                            {`Product::where('id', $id)
  ->where('stock', '>', 0)
  ->decrement('stock');

if ($affectedRows === 0) {
    throw new Exception("Stock depleted");
}`}
                        </pre>
                        <p class="text-xs text-slate-400 mt-3 leading-relaxed">
                            This design uses direct row-level locking at the database database engine core. It eliminates high-stress memory verification errors completely without needing sluggish table-level locks.
                        </p>
                    </div>
                </div>

                {/* Real-time Live Dashboard Analytics Columns */}
                <div class="lg:col-span-2 space-y-6">
                    {/* Scorecards Row */}
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-md">
                            <div class="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Inventory Stock</div>
                            <div class={`text-3xl font-bold mt-2 font-mono ${currentStock > 0 ? 'text-amber-400' : 'text-rose-500'}`}>
                                {currentStock}
                            </div>
                            <div class="text-xs text-slate-500 mt-1">Tenant Database Row Value</div>
                        </div>
                        <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-md">
                            <div class="text-xs font-mono text-emerald-400 uppercase tracking-wider">HTTP Success Pipeline</div>
                            <div class="text-3xl font-bold mt-2 font-mono text-emerald-400">
                                {metrics.success}
                            </div>
                            <div class="text-xs text-slate-500 mt-1">200 OK Requests Dispatched</div>
                        </div>
                        <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-md">
                            <div class="text-xs font-mono text-rose-400 uppercase tracking-wider">Execution Pipeline Load</div>
                            <div class="text-3xl font-bold mt-2 font-mono text-slate-300">
                                {metrics.duration ? `${metrics.duration}s` : '--'}
                            </div>
                            <div class="text-xs text-slate-500 mt-1">Total cURL Multi-Handle Latency</div>
                        </div>
                    </div>

                    {/* Live Activity Logs Terminal Frame */}
                    <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl flex flex-col h-[415px]">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-md font-semibold text-white font-mono flex items-center gap-2">
                                🖥️ Cluster Execution Live Logs Terminal
                            </h3>
                            <button onClick={clearLogs} class="text-xs text-slate-500 hover:text-slate-300 underline font-mono cursor-pointer">Clear Stream</button>
                        </div>

                        <div
                            ref={terminalWindowRef}
                            className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs flex-1 overflow-y-auto space-y-2 scrollbar-thin"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {logs.length === 0 ? (
                                <div class="text-slate-600 italic text-center py-12">
                                    Terminal idle. Awaiting parallel stream trigger event...
                                </div>
                            ) : (
                                logs.map((log, idx) => (
                                    <div key={idx} className={`flex gap-2 leading-relaxed ${log.success ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        <span class="text-slate-600">[{log.timestamp}]</span>
                                        <span class={`font-bold ${log.success ? 'text-teal-400' : 'text-rose-400'}`}>[Stream-{log.request_index}]</span>
                                        <span>User ID #{log.user_id} hitting route {"->"} Status Code: <span class="underline font-bold">{log.status}</span> ({log.message})</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}