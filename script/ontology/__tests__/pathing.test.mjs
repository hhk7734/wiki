import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildTargetPath, classifySeed } from "../pathing.mjs";
import { CLASSIFICATION_REGISTRY_PATH, bootstrapRegistry } from "../bootstrap-registry.mjs";
import { ROOT_DIR } from "../constants.mjs";
import { inventory } from "../inventory.mjs";

test("buildTargetPath uses unique canonical filenames for overview pages", () => {
	assert.equal(
		buildTargetPath({
			role: "entity",
			domain: "language",
			className: "programming-language",
			instance: "go",
			aspect: "overview",
		}),
		"docs/entity/language/programming-language/go/go.mdx",
	);
});

test("buildTargetPath uses the aspect name for non-overview pages", () => {
	assert.equal(
		buildTargetPath({
			role: "operation",
			domain: "platform",
			className: "cluster-addon",
			instance: "node-feature-discovery",
			aspect: "install",
		}),
		"docs/operation/platform/cluster-addon/node-feature-discovery/install.mdx",
	);
});

test("current Go overview path maps to canonical ontology path", () => {
	assert.equal(
		classifySeed("docs/lang/go/go.mdx").target,
		"docs/entity/language/programming-language/go/go.mdx",
	);
});

test("inventory excludes docs/superpowers pages", () => {
	assert.equal(
		inventory().some((file) => file.startsWith("docs/superpowers/")),
		false,
	);
});

test("bootstrap registry keeps targets unique for the current corpus", () => {
	const entries = bootstrapRegistry();
	const targets = entries.map((entry) => entry.target);

	assert.equal(new Set(targets).size, targets.length);
});

test("classification registry path is rooted to the repo", () => {
	const moduleUrl = pathToFileURL(resolve("script/ontology/bootstrap-registry.mjs")).href;
	const result = spawnSync(
		"/usr/bin/node",
		["--input-type=module", "-e", `import { CLASSIFICATION_REGISTRY_PATH } from ${JSON.stringify(moduleUrl)}; console.log(CLASSIFICATION_REGISTRY_PATH);`],
		{
			cwd: "/tmp",
			encoding: "utf8",
		},
	);

	assert.equal(result.status, 0);
	assert.equal(result.stdout.trim(), CLASSIFICATION_REGISTRY_PATH);
	assert.equal(CLASSIFICATION_REGISTRY_PATH, resolve(ROOT_DIR, "ontology", "classification-registry.json"));
});
