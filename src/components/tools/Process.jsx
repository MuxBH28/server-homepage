import { useEffect, useState, useRef } from "react";
import WidgetCard from "./WidgetCard";

export default function ProcessCard({ refreshInterval }) {
    const [processes, setProcesses] = useState([]);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchSystemProcess();
        intervalRef.current = setInterval(fetchSystemProcess, refreshInterval * 1000);
        return () => clearInterval(intervalRef.current);
    }, [refreshInterval]);

    const fetchSystemProcess = async () => {
        try {
            const res = await fetch("/api/process");
            const data = await res.json();
            setProcesses(data || []);
        } catch (err) {
            console.error(err);
            setProcesses(null);
        }
    };

    return (
        <WidgetCard title="Process Viewer">
            {!processes ? (
                <p className="text-red-600">Failed to load processes.</p>
            ) : processes.length === 0 ? (
                <p className="text-gray-400">No processes found.</p>
            ) : (
                <table className="w-full text-left text-sm text-gray-300 border border-gray-700 rounded-lg">
                    <thead className="bg-gray-800 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 border-b border-gray-700">PID</th>
                            <th className="px-3 py-2 border-b border-gray-700">Name</th>
                            <th className="px-3 py-2 border-b border-gray-700">CPU %</th>
                            <th className="px-3 py-2 border-b border-gray-700">Memory</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processes.map((p) => (
                            <tr key={p.pid} className="hover:bg-gray-700">
                                <td className="px-3 py-1 border-b border-gray-700">{p.pid}</td>
                                <td className="px-3 py-1 border-b border-gray-700">{p.name}</td>
                                <td className="px-3 py-1 border-b border-gray-700">{p.cpu}</td>
                                <td className="px-3 py-1 border-b border-gray-700">{formatBytes(p.memory)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </WidgetCard>
    );
}

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
