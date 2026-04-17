import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import guardedGtagClient from "../../../plugins/guarded-google-gtag-client.mjs";
import guardedGoogleGtagPlugin from "../../../plugins/guarded-google-gtag.mjs";

test("guarded gtag client does not throw when window.gtag is unavailable", () => {
	const originalWindow = globalThis.window;
	const originalSetTimeout = globalThis.setTimeout;

	globalThis.window = {};
	globalThis.setTimeout = (callback) => {
		callback();
		return 0;
	};

	assert.doesNotThrow(() =>
		guardedGtagClient.onRouteDidUpdate({
			location: { pathname: "/docs/test", search: "", hash: "" },
			previousLocation: { pathname: "/", search: "", hash: "" },
		}),
	);

	globalThis.window = originalWindow;
	globalThis.setTimeout = originalSetTimeout;
});

test("guarded gtag client tracks page views when window.gtag exists", () => {
	const originalWindow = globalThis.window;
	const originalSetTimeout = globalThis.setTimeout;
	const calls = [];

	globalThis.window = {
		gtag: (...args) => calls.push(args),
	};
	globalThis.setTimeout = (callback) => {
		callback();
		return 0;
	};

	guardedGtagClient.onRouteDidUpdate({
		location: { pathname: "/docs/test", search: "?q=1", hash: "#top" },
		previousLocation: { pathname: "/", search: "", hash: "" },
	});

	assert.deepEqual(calls, [
		["set", "page_path", "/docs/test?q=1#top"],
		["event", "page_view"],
	]);

	globalThis.window = originalWindow;
	globalThis.setTimeout = originalSetTimeout;
});

test("guarded gtag plugin returns a resolvable client module path in production", () => {
	const originalNodeEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = "production";

	const plugin = guardedGoogleGtagPlugin(
		{},
		{
			trackingID: ["G-E8VGH1197Y"],
			anonymizeIP: false,
		},
	);
	const [clientModulePath] = plugin.getClientModules();

	assert.equal(fs.existsSync(clientModulePath), true);

	process.env.NODE_ENV = originalNodeEnv;
});
