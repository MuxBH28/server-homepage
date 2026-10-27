import { useEffect, useState } from "react";

export default function useIsMobile(breakpoint = 768) {
    const query = `(max-width: ${breakpoint - 1}px)`;

    const [isMobile, setIsMobile] = useState(
        () => typeof window !== "undefined" && window.matchMedia(query).matches
    );

    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = (e) => setIsMobile(e.matches);

        setIsMobile(mq.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [query]);

    return isMobile;
}