import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	corePlugins: {
		preflight: false,
		container: false,
	},
	darkMode: ["class", '[data-theme="dark"]'],
	content: ["./src/**/*.{tsx,html}", "./docs/**/*.{tsx,mdx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Inter"', ...fontFamily.sans],
				jakarta: ['"Plus Jakarta Sans"', ...fontFamily.sans],
				mono: ['"Fira Code"', ...fontFamily.mono],
			},
			borderRadius: {
				sm: "4px",
			},
			screens: {
				sm: "0px",
				lg: "997px",
			},
			colors: {},
		},
	},
	plugins: [],
} satisfies Config;
