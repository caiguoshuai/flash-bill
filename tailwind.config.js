/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1677ff', // Ant Design Blue / Alipay Blue
        success: '#52c41a',
        warning: '#faad14',
        danger: '#ff4d4f',
      },
    },
  },
  plugins: [],
}