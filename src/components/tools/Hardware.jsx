import { useEffect, useState } from "react";
import WidgetCard from "./WidgetCard";

export default function HardwareCard() {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        fetchInfo();
    }, []);

    const fetchInfo = async () => {
        try {
            const res = await fetch("/api/info");
            const data = await res.json();
            setInfo(data);
        } catch {
            setInfo(null);
        }
    };

    if (!info) {
        return (
            <WidgetCard title="Hardware Info">
                <p className="text-red-600">Failed to load info.</p>
            </WidgetCard>
        );
    }

    return (
        <WidgetCard title="Hardware Info">
            <div>
                <p>
                    <strong>CPU:</strong> {info.cpu.manufacturer} {info.cpu.brand} ({info.cpu.cores} cores, {info.cpu.physicalCores} physical, {info.cpu.speed} GHz)
                </p>
                <p>
                    <strong>Memory:</strong> {info.memory.totalGB} GB
                </p>
                <p>
                    <strong>OS:</strong> {info.os.distro} {info.os.release} ({info.os.arch}), Hostname: {info.os.hostname}
                </p>

                {info.disk?.length > 0 && (
                    <>
                        <p><strong>Disks:</strong></p>
                        {info.disk.map((d, i) => (
                            <p key={`disk-${i}`}>&nbsp;&nbsp;{d.device} - {d.name} ({d.sizeGB} GB, {d.type})</p>
                        ))}
                    </>
                )}

                {info.graphics?.length > 0 && (
                    <>
                        <p><strong>Graphics:</strong></p>
                        {info.graphics.map((g, i) => (
                            <p key={`gpu-${i}`}>&nbsp;&nbsp;{g.model} ({g.vendor}), VRAM: {g.vramGB} GB</p>
                        ))}
                    </>
                )}

                {info.network?.length > 0 && (
                    <>
                        <p><strong>Network Interfaces:</strong></p>
                        {info.network.map((n, i) => (
                            <p key={`net-${i}`}>&nbsp;&nbsp;{n.iface} - IPv4: {n.ip4}, MAC: {n.mac}</p>
                        ))}
                    </>
                )}
            </div>
        </WidgetCard>
    );
}
