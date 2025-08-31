import { useEffect, useState, useRef } from "react";
import baseGaugeOptions from "./gauges/baseGauge";

const appVersion = 'v1.3.7';

export default function Preloader() {
    const [visible, setVisible] = useState(true);
    const preloadRef = useRef(null);
    const gaugeRef = useRef(null);

    useEffect(() => {
        if (preloadRef.current) {
            gaugeRef.current = new RadialGauge({
                ...baseGaugeOptions,
                renderTo: preloadRef.current,
                width: 300,
                height: 300,
                units: 'HOMEPAGE',
                minValue: 0,
                maxValue: 100,
                majorTicks: ['0', '20', '40', '60', '80', '100'],
                minorTicks: 4,
                highlights: [
                    { from: 0, to: 20, color: 'rgba(0, 200, 0, 0.7)' },
                    { from: 20, to: 60, color: 'rgba(0,0,0,0)' },
                    { from: 60, to: 80, color: 'rgba(255, 255, 0, 0.7)' },
                    { from: 80, to: 100, color: 'rgba(255, 0, 0, 0.7)' }
                ],
                title: "SERVER",
                valueBox: true,
                valueText: appVersion
            }).draw();

            gaugeRef.current.value = 100;

            const hideTimeout = setTimeout(() => setVisible(false), 1200);
            return () => clearTimeout(hideTimeout);
        }
    }, []);

    if (!visible) return null;

    return (
        <div
            id="preloader"
            className={`fixed inset-0 flex flex-col items-center justify-center
                bg-gradient-to-br from-[#1f1f2e] to-[#2c2c3a] text-red-600 z-50
                transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}
        >
            <canvas
                ref={preloadRef}
                width="300"
                height="300"
            />
        </div>
    );
}
