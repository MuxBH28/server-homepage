import { useEffect, useState } from "react";
import WidgetCard from "./WidgetCard";

export default function NotesCard() {
    const [text, setText] = useState("");
    const [lastEdited, setLastEdited] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch("/api/notes");
            const data = await res.json();
            setText(data.notes || "");
            setLastEdited(data.lastEdited);
        } catch {
            setText(null);
        }
    };

    const saveNotes = async (val) => {
        try {
            await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: val }),
            });
            setLastEdited(new Date().toISOString());
        } catch {
            console.error("Failed to save notes.");
        }
    };

    const downloadNotes = () => {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "notes.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <WidgetCard title="Notes">
            {text === null ? (
                <p className="text-red-600">Failed to load notes.</p>
            ) : (
                <div className="flex flex-col h-full relative">
                    <button
                        onClick={downloadNotes}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm z-10"
                    >
                        <i className="bi bi-cloud-download"></i> Download
                    </button>
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            saveNotes(e.target.value);
                        }}
                        className="flex-grow w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-lg resize-none min-h-[150px]"
                    />
                    <p className="text-gray-400 text-xs mt-2">
                        Last edited: {lastEdited ? new Date(lastEdited).toLocaleString() : "N/A"}
                    </p>
                </div>
            )}
        </WidgetCard>
    );
}
