/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        btn: {
          background: "hsl(var(--btn-background))",
          "background-hover": "hsl(var(--btn-background-hover))",
        },
        zIndex: {
          10: "10",
          20: "20",
          30: "30",
          40: "40",
          50: "50",
          60: "60",
          70: "70",
          80: "80",
          90: "90",
          100: "100",
          110: "110",
          120: "120",
          130: "130",
          140: "140",
          150: "150",
          160: "160",
          170: "170",
          180: "180",
          190: "190",
          200: "200",
          // Add more if needed
          999: "999",
          1000: "1000",
          1100: "1100",
        },
      },
    },
  },
  plugins: [],
};
