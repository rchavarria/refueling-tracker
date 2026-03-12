export default function ReminderColorTooltip() {
  return (
    <span className="relative group cursor-default">
      <span className="text-base select-none">❓</span>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <p className="font-semibold mb-1">Color rules:</p>
        <p className="mb-1 font-medium text-gray-300">By due date:</p>
        <ul className="mb-2 space-y-0.5">
          <li><span className="text-red-400">🔴 Red</span> — due in 7 days or less</li>
          <li><span className="text-orange-400">🟠 Orange</span> — due in 8–30 days</li>
          <li><span className="text-green-400">🟢 Green</span> — due in more than 30 days</li>
        </ul>
        <p className="mb-1 font-medium text-gray-300">By remaining km (if set):</p>
        <ul className="space-y-0.5">
          <li><span className="text-red-400">🔴 Red</span> — less than 1,000 km left</li>
          <li><span className="text-orange-400">🟠 Orange</span> — 1,000–3,000 km left</li>
          <li><span className="text-green-400">🟢 Green</span> — more than 3,000 km left</li>
        </ul>
        <p className="mt-2 text-gray-400 text-[10px]">The most urgent color (red &gt; orange &gt; green) takes priority.</p>
      </div>
    </span>
  );
}

