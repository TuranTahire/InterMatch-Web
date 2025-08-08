import { SparklesIcon } from '@heroicons/react/24/solid';

export default function FancyButton({ children, onClick, variant = "purple", disabled = false, loading = false, icon: Icon, label, subLabel, loadingText = "Yükleniyor..." }) {
  const variants = {
    purple: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 focus:ring-pink-300 shadow-purple-500/25",
    blue: "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 focus:ring-blue-300 shadow-blue-500/25",
    green: "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 focus:ring-green-300 shadow-green-500/25",
    orange: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 focus:ring-orange-300 shadow-orange-500/25",
    rainbow: "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 focus:ring-purple-300 shadow-purple-500/25"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex flex-col items-center justify-center
        ${variants[variant]}
        text-white font-semibold
        px-6 py-5 rounded-2xl
        shadow-lg hover:shadow-xl
        hover:brightness-110 hover:scale-105
        active:scale-95
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100 disabled:hover:scale-100
        min-h-[70px] w-full
        relative overflow-hidden
        group
      `}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mb-2"></div>
          <span className="text-sm font-medium">{loadingText}</span>
        </>
      ) : (
        <>
          {Icon ? <Icon className="h-5 w-5 mb-2 group-hover:scale-110 transition-transform duration-300" /> : <SparklesIcon className="h-5 w-5 mb-2 group-hover:scale-110 transition-transform duration-300" />}
          <span className="text-base font-semibold">{label || children}</span>
          {subLabel && <span className="text-sm opacity-90 mt-1 font-medium">{subLabel}</span>}
        </>
      )}
    </button>
  );
}
