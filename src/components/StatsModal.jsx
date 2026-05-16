import { useEffect, useState } from "react";

const StatCard = ({ title, icon, data, unit = "%" }) => (
    <div className="bg-black/40 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors duration-200">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <i className={`bi ${icon} text-red-500 text-xl`}></i>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">
                {title}
            </h3>
        </div>

        <div className="space-y-2.5 text-sm text-neutral-400">
            <div className="flex justify-between items-center">
                <span>24h Min</span>
                <span className="font-mono text-green-400 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                    {data?.min24h ?? "N/A"}{unit}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <span>24h Max</span>
                <span className="font-mono text-red-400 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                    {data?.max24h ?? "N/A"}{unit}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <span>24h Avg</span>
                <span className="font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                    {data?.avg24h ?? "N/A"}{unit}
                </span>
            </div>

            <hr className="border-neutral-800 my-3" />

            <div className="flex justify-between items-center">
                <span>All Time Min</span>
                <span className="font-mono text-green-400 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                    {data?.allTimeMin ?? "N/A"}{unit}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <span>All Time Max</span>
                <span className="font-mono text-red-400 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                    {data?.allTimeMax ?? "N/A"}{unit}
                </span>
            </div>
        </div>
    </div>
);

export default function StatsModal({ isOpen, onClose }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        fetch("/api/stats")
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-5xl bg-[#111] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-black/20">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            System Statistics
                        </h2>
                        <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                            Historical monitoring overview
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-neutral-800/50 rounded-lg text-xl"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {!stats ? (
                        <div className="py-20 text-center text-neutral-400 flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                            <span className="text-sm font-medium tracking-wide">Loading statistics...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <div className="md:col-span-3 bg-black/40 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors duration-200">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                        <i className="bi bi-clock-history text-red-500 text-xl"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        Server Uptime
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-neutral-300">
                                    <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-800/50">
                                        <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                                            Current Uptime
                                        </p>
                                        <p className="text-xl font-bold text-green-400 mt-1 font-mono">
                                            {stats.uptime?.current || "N/A"}
                                        </p>
                                    </div>

                                    <div className="bg-neutral-900/40 p-3 rounded-lg border border-neutral-800/50 flex flex-col justify-center">
                                        <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                                            Stats Tracking
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                                            <p className="text-base font-semibold text-neutral-200">Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <StatCard title="CPU" icon="bi-cpu" data={stats.cpu} />
                            <StatCard title="RAM" icon="bi-memory" data={stats.ram} />
                            <StatCard title="Temperature" icon="bi-thermometer-half" data={stats.temp} unit="°C" />

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}