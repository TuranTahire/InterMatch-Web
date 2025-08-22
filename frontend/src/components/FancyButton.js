import { SparklesIcon } from '@heroicons/react/24/solid';

export default function FancyButton({ children, onClick, variant = "purple", disabled = false, loading = false, icon: Icon, label, subLabel, loadingText = "Yükleniyor...", compact = false }) {
  const variants = {
    purple: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 focus:ring-pink-300 shadow-purple-500/25",
    blue: "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 focus:ring-blue-300 shadow-blue-500/25",
    green: "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 focus:ring-green-300 shadow-green-500/25",
    orange: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 focus:ring-orange-300 shadow-orange-500/25",
    rainbow: "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 focus:ring-purple-300 shadow-purple-500/25",
    career: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 focus:ring-purple-300 shadow-purple-500/25 career-assistant-button"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${compact ? 'inline-flex flex-row items-center justify-center px-3 py-2 min-h-[50px]' : 'inline-flex flex-col items-center justify-center px-4 py-3 min-h-[60px]'}
        ${variants[variant]}
        text-white font-semibold
        rounded-xl
        shadow-lg hover:shadow-xl
        hover:brightness-110 hover:scale-105
        active:scale-95
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-4
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100 disabled:hover:scale-100
        w-full
        relative overflow-hidden
        group
        btn-micro hover-lift focus-ring
      `}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {loading ? (
        <>
          <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white ${compact ? 'mr-2' : 'mb-1'}`}></div>
          <span className="text-xs font-medium">{loadingText}</span>
        </>
      ) : (
        <>
          {Icon ? (
            <Icon className={`h-4 w-4 group-hover:scale-110 transition-transform duration-300 ${compact ? 'mr-2' : 'mb-1'}`} />
          ) : (
            <SparklesIcon className={`h-4 w-4 group-hover:scale-110 transition-transform duration-300 ${compact ? 'mr-2' : 'mb-1'}`} />
          )}
          <div className={`${compact ? 'flex flex-col items-start' : 'flex flex-col items-center'}`}>
            <span className="text-sm font-semibold">{label || children}</span>
            {subLabel && <span className={`text-xs opacity-90 font-medium ${compact ? '' : 'mt-0.5'}`}>{subLabel}</span>}
          </div>
        </>
      )}
    </button>
  );
}
