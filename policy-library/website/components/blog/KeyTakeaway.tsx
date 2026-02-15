interface KeyTakeawayProps {
  takeaways: string[];
}

export default function KeyTakeaway({ takeaways }: KeyTakeawayProps) {
  return (
    <div className="my-8 p-6 bg-sand-50 rounded-lg border-l-4 border-gradient-to-b from-copper-600 to-evergreen-600 relative overflow-hidden">
      {/* Gradient Left Border (absolute positioned for proper gradient) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-copper-600 to-evergreen-600" />

      <div className="pl-4">
        <h3 className="text-xl font-bold text-dark-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-r from-copper-600 to-evergreen-600 flex items-center justify-center text-white text-sm">
            ✓
          </span>
          Key Takeaways
        </h3>
        <ul className="space-y-3">
          {takeaways.map((takeaway, index) => (
            <li key={index} className="flex gap-3 text-dark-700">
              <span className="text-copper-600 font-bold mt-1">•</span>
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
