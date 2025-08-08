/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // İlan kartları için
    'bg-white',
    'bg-gray-50',
    'bg-blue-50',
    'shadow-sm',
    'shadow-md',
    'shadow-lg',
    'rounded-lg',
    'rounded-xl',
    'p-4',
    'p-6',
    'm-2',
    'm-4',
    
    // İlan başlıkları için
    'text-lg',
    'text-xl',
    'text-2xl',
    'font-bold',
    'font-semibold',
    'text-gray-900',
    'text-blue-900',
    
    // İlan fiyatları için
    'text-green-600',
    'text-green-700',
    'text-red-600',
    'text-red-700',
    'text-2xl',
    'text-3xl',
    'font-bold',
    
    // İlan durumları için
    'bg-green-100',
    'bg-red-100',
    'bg-yellow-100',
    'bg-blue-100',
    'text-green-800',
    'text-red-800',
    'text-yellow-800',
    'text-blue-800',
    'px-2',
    'py-1',
    'rounded-full',
    'text-sm',
    
    // Butonlar için
    'bg-blue-500',
    'bg-blue-600',
    'bg-green-500',
    'bg-red-500',
    'hover:bg-blue-600',
    'hover:bg-green-600',
    'hover:bg-red-600',
    'text-white',
    'px-4',
    'py-2',
    'rounded',
    'transition-colors',
    
    // Grid ve layout için
    'grid',
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'gap-4',
    'gap-6',
    'flex',
    'flex-col',
    'flex-row',
    'justify-between',
    'items-center',
    'space-y-2',
    'space-y-4',
    'space-x-2',
    'space-x-4',
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
} 