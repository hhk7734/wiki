import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const configSource = fs.readFileSync(new URL("../../../docusaurus.config.ts", import.meta.url), "utf8");

test("docusaurus config does not enable legacy google analytics", () => {
	assert.equal(
		configSource.includes("googleAnalytics:"),
		false,
		"legacy googleAnalytics preset option enables plugin-google-analytics and can call window.ga at runtime",
	);
});

test("docusaurus config keeps gtag analytics", () => {
	assert.equal(configSource.includes('"@docusaurus/plugin-google-gtag"'), true);
});

test("docusaurus docs config excludes agent instruction symlinks", () => {
	assert.equal(configSource.includes('exclude: ["**/AGENTS.md", "**/CLAUDE.md"]'), true);
});

test("docusaurus config does not use docusaurus-search-local", () => {
	assert.equal(configSource.includes("@easyops-cn/docusaurus-search-local"), false);
});
