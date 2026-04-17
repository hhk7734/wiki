import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url));

function createConfigSnippet({ trackingID, anonymizeIP }) {
	return `window.gtag('config', '${trackingID}', { ${anonymizeIP ? "'anonymize_ip': true" : ""} });`;
}

function createConfigSnippets({ trackingID: trackingIDArray, anonymizeIP }) {
	return trackingIDArray.map((trackingID) => createConfigSnippet({ trackingID, anonymizeIP })).join("\n");
}

export default function guardedGoogleGtagPlugin(_context, options) {
	if (process.env.NODE_ENV !== "production") {
		return null;
	}

	const firstTrackingId = options.trackingID[0];

	return {
		name: "guarded-google-gtag-plugin",
		contentLoaded({ actions }) {
			actions.setGlobalData(options);
		},
		getClientModules() {
			return [resolve(PLUGIN_DIR, "guarded-google-gtag-client.mjs")];
		},
		injectHtmlTags() {
			return {
				headTags: [
					{
						tagName: "link",
						attributes: {
							rel: "preconnect",
							href: "https://www.google-analytics.com",
						},
					},
					{
						tagName: "link",
						attributes: {
							rel: "preconnect",
							href: "https://www.googletagmanager.com",
						},
					},
					{
						tagName: "script",
						attributes: {
							async: true,
							src: `https://www.googletagmanager.com/gtag/js?id=${firstTrackingId}`,
						},
					},
					{
						tagName: "script",
						innerHTML: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
              window.gtag('js', new Date());
              ${createConfigSnippets(options)};
              `,
					},
				],
			};
		},
	};
}
