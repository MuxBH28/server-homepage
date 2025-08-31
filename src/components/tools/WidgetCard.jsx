export default function WidgetCard({ title, children }) {
    return (
        <div className="shadow-lg rounded-2xl p-4 bg-black/40 backdrop-blur-md border border-white/20 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-3">{title}</h2>
            <div className="flex-grow overflow-auto">{children}</div>
        </div>
    );
}
