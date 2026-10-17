module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        teal: { 50: "#ecfdfa", 100: "#ccfbf1", 600: "#0f766e", 700: "#115e59" },
      },
    },
  },
  plugins: [],
};
