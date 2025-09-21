import { useEffect, useState } from "react";
import WidgetCard from "./WidgetCard";

export default function NotesCard() {
    const [notesList, setNotesList] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch("/api/notes");
            const data = await res.json();
            if (Array.isArray(data) && data.length) {
                setNotesList(data);
            } else {
                setNotesList([{ header: "Notes1", notes: data.notes || "", lastEdited: data.lastEdited || null }]);
            }
        } catch (err) {
            console.error("Failed to load notes:", err);
            setNotesList([{ header: "Notes1", notes: "", lastEdited: null }]);
        }
    };

    const saveNotes = async (index, newText) => {
        setNotesList(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], notes: newText, lastEdited: new Date().toISOString() };
            return updated;
        });

        try {
            await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notesList),
            });
        } catch (err) {
            console.error("Failed to save notes:", err);
        }
    };

    const addNote = () => {
        setNotesList(prev => [
            ...prev,
            {
                header: `Note ${prev.length + 1}`,
                notes: "",
                lastEdited: new Date().toISOString(),
            },
        ]);
        setActiveIndex(notesList.length);
    };

    const deleteNote = (index) => {
        setNotesList(prev => {
            const updated = prev.filter((_, i) => i !== index);
            if (activeIndex >= updated.length) {
                setActiveIndex(updated.length - 1 >= 0 ? updated.length - 1 : 0);
            }
            return updated;
        });
    };

    const renameNote = async (index, newHeader) => {
        setNotesList(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                header: newHeader,
                lastEdited: new Date().toISOString(),
            };
            return updated;
        });

        try {
            await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notesList),
            });
        } catch (err) {
            console.error("Failed to save notes:", err);
        }
    };

    const downloadNote = (note) => {
        const blob = new Blob([note.notes], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${note.header}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <WidgetCard title="Notes">
            <section className="flex h-full gap-2">
                <article className="flex flex-col gap-2 overflow-y-auto scrollbar-none">
                    {notesList.map((note, idx) => (
                        <div
                            key={idx}
                            className={`p-2 rounded cursor-pointer transition-colors ${activeIndex === idx ? "bg-red-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"}`}
                            onClick={() => setActiveIndex(idx)}
                        >
                            <input
                                type="text"
                                value={note.header}
                                onChange={(e) => renameNote(idx, e.target.value)}
                                className="flex-1 bg-transparent border-none text-sm font-semibold text-white focus:outline-none pr-2"
                            />
                        </div>
                    ))}
                    <button
                        onClick={addNote}
                        className="mt-2 bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                        + Add Note
                    </button>

                    <div className="mt-auto pt-2 border-t border-gray-700 flex flex-col gap-2">
                        {notesList[activeIndex] ? (
                            <>
                                <p className="text-gray-400 text-xs mb-1" title="Last edited">
                                    {notesList[activeIndex]?.lastEdited
                                        ? new Date(notesList[activeIndex].lastEdited).toLocaleString()
                                        : "N/A"}
                                </p>
                                <button
                                    onClick={() => downloadNote(notesList[activeIndex])}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm mb-1"
                                >
                                    <i className="bi bi-cloud-download mr-1"></i> Download
                                </button>
                                <button
                                    onClick={() => deleteNote(activeIndex)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                                >
                                    <i className="bi bi-trash mr-1"></i> Delete
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-400 text-xs">No notes available</p>
                        )}
                    </div>
                </article>

                {notesList[activeIndex] && (
                    <textarea
                        value={notesList[activeIndex].notes}
                        onChange={(e) => saveNotes(activeIndex, e.target.value)}
                        className="flex-grow w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-lg resize-none min-h-[200px]"
                    />
                )}
            </section>
        </WidgetCard >
    );
}
