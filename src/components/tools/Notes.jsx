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

    return (
        <WidgetCard title="Notes">
            {text === null ? (
                <p className="text-red-600">Failed to load notes.</p>
            ) : (
                <div>
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            saveNotes(e.target.value);
                        }}
                        className="w-full h-60 p-2 bg-gray-800 border border-gray-700 text-white rounded-lg resize-none"
                    />
                    <p className="text-gray-400 text-xs mt-2">
                        Last edited: {lastEdited ? new Date(lastEdited).toLocaleString() : "N/A"}
                    </p>
                </div>
            )}
        </WidgetCard>
    );
}
