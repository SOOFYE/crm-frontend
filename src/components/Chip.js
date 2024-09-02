const Chip = ({ color, status }) => {
    // Define Tailwind classes based on the color prop
    const colorClasses = {
      default: "bg-gray-100 text-gray-700",
      primary: "bg-blue-500 text-white",
      secondary: "bg-green-500 text-white",
      warning: "bg-yellow-500 text-white",
      danger: "bg-red-100 text-red-700",
      success: "bg-emerald-100 text-emerald-700"
    };
  
    // Get the color class or fallback to default
    const chipColorClass = colorClasses[color] || colorClasses.default;
  
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${chipColorClass}`}
      >
        {status}
      </span>
    );
  };
  
  export default Chip;