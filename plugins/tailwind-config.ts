import postcss from "postcss-import";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default function tailwindPlugin(context, options) {
	return {
		name: "tailwind-plugin",
		configurePostCss(postcssOptions) {
			postcssOptions.plugins = [postcss, tailwindcss, autoprefixer];
			return postcssOptions;
		},
	};
}
