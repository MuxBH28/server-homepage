import { useEffect, useState, useRef } from "react";
import ApexCharts from "apexcharts";

const networkFields = [
    {
        key: "ifaceName",
        label: "Name",
        icon: "bi-diagram-3"
    },
    {
        key: "state",
        label: "State",
        icon: "bi-toggle-on",
        color: "text-green-500",
    },
    {
        key: "local_ip",
        label: "Local IP",
        icon: "bi-hdd-network"
    },
    {
        key: "public_ip",
        label: "Public IP",
        icon: "bi-globe"
    },
    {
        key: "city_country",
        label: "Location",
        icon: "bi-building"
    },
    {
        key: "loc",
        label: "Coordinates",
        icon: "bi-geo-alt"
    },
    {
        key: "upload_speed",
        label: "Upload",
        icon: "bi-cloud-upload"
    },
    {
        key: "download_speed",
        label: "Download",
        icon: "bi-cloud-download"
    },
];

export default function Network({ refreshInterval }) {
    const [networkData, setNetworkData] = useState({});
    const [loading, setLoading] = useState(true);
    const logsChartRef = useRef(null);

    const fetchNetwork = () => {
        fetch("/api/network")
            .then((res) => res.json())
            .then((data) => {
                setNetworkData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch network data:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchNetwork();
        fetchNetworkLogs(logsChartRef);

        const intervalId = setInterval(() => {
            fetchNetwork();
        }, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, [refreshInterval]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "r" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                e.preventDefault();
                fetchNetwork();
                fetchNetworkLogs(logsChartRef);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const renderFieldValue = (key) => {
        if (loading) return "Loading...";
        return key === "city_country"
            ? `${networkData.city || "N/A"}, ${networkData.country || "N/A"}`
            : networkData[key] || "N/A";
    };

    return (
        <section className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 mt-4 w-full">
            <h1 className="text-red-500 font-semibold text-xl mb-6 flex items-center gap-2">
                <i className="bi bi-router-fill"></i> Network Info
            </h1>

            <article className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-gray-300 text-sm">
                {networkFields.map(({ key, label, icon, color }) => (
                    <div
                        key={key}
                        className="flex flex-col gap-3 border border-red-700 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow bg-black/30"
                    >
                        <div className="flex items-center gap-3">
                            <i className={`bi ${icon} text-2xl`}></i>
                            <div>
                                <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
                                <p className="font-medium text-white mt-1">{renderFieldValue(key)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </article>

            <section className="shadow-lg rounded-2xl p-6 mt-6 md:p-8 bg-black/40 backdrop-blur-md border border-red-700 flex flex-col w-full">
                <div ref={logsChartRef} style={{ height: "400px" }}></div>
            </section>
        </section>
    );

}

function fetchNetworkLogs(logsChartRef) {
    fetch("/api/network-logs")
        .then(res => res.json())
        .then(logs => {
            if (!logsChartRef.current) return;
            const container = logsChartRef.current;

            if (!logs || logs.length === 0) {
                container.innerHTML = '<p class="text-gray-400">No logs found.</p>';
                return;
            }

            const validLogs = logs.filter(log => log.upload !== undefined && log.download !== undefined);
            if (validLogs.length === 0) {
                container.innerHTML = '<p class="text-gray-400">No valid logs to display.</p>';
                return;
            }

            const labels = validLogs.map(log => log.timestamp);
            const uploadData = validLogs.map(log => log.upload);
            const downloadData = validLogs.map(log => log.download);

            const options = {
                chart: {
                    type: 'line',
                    height: 400,
                    zoom: { enabled: true },
                    toolbar: { show: true, tools: { download: true } },
                    foreColor: '#fff'
                },
                theme: { mode: 'dark' },
                series: [
                    { name: 'Upload MB/s', data: uploadData, color: '#28a745' },
                    { name: 'Download MB/s', data: downloadData, color: '#007bff' }
                ],
                xaxis: { categories: labels, labels: { style: { colors: '#fff' } } },
                yaxis: { min: 0, labels: { style: { colors: '#fff' } } },
                stroke: { curve: 'smooth' },
                tooltip: { shared: true },
                legend: { position: 'top', labels: { colors: '#fff' } }
            };

            container.innerHTML = '';
            new ApexCharts(container, options).render();
        })
        .catch(err => {
            console.error(err);
            if (logsChartRef.current) {
                logsChartRef.current.innerHTML = '<p class="text-red-600">Failed to load logs.</p>';
            }
        });
}
