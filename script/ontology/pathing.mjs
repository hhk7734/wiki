import { basename } from "node:path";

function normalizeSourcePath(source) {
	return source.replaceAll("\\", "/").replace(/^\.?\//, "");
}

function splitPath(source) {
	return normalizeSourcePath(source).split("/").filter(Boolean);
}

function fileStem(source) {
	return basename(source, ".mdx");
}

function sourceSlug(source) {
	return normalizeSourcePath(source)
		.replace(/^docs\//, "")
		.replace(/\.mdx$/, "")
		.replaceAll("/", "-");
}

function hasPrefix(parts, prefix) {
	if (parts.length < prefix.length) {
		return false;
	}

	return prefix.every((segment, index) => parts[index] === segment);
}

function deriveAspect(stem, instance, prefixes = []) {
	let aspect = stem;

	for (const prefix of prefixes) {
		if (aspect.startsWith(`${prefix}-`)) {
			aspect = aspect.slice(prefix.length + 1);
		}
	}

	if (aspect.startsWith(`${instance}-`)) {
		aspect = aspect.slice(instance.length + 1);
	}

	if (aspect === "" || aspect === instance) {
		return "overview";
	}

	return aspect;
}

function makeSeed(source, ontology) {
	const { className, ...rest } = ontology;

	return {
		source: normalizeSourcePath(source),
		target: buildTargetPath(ontology),
		ontology: {
			...rest,
			class: className,
		},
	};
}

function classifyPrefixGroup(source, rule) {
	const parts = splitPath(source);
	const stem = fileStem(source);
	const instancePart = parts[rule.prefix.length];
	const instance = instancePart && instancePart.endsWith(".mdx") ? stem : instancePart ?? stem;
	const aspect = deriveAspect(stem, instance, rule.aspectPrefixes);
	const role = aspect === "overview" ? rule.roleOverview : rule.roleDetail;

	return makeSeed(source, {
		role,
		domain: rule.domain,
		className: rule.className,
		instance,
		aspect,
	});
}

function directConcept(source, domain, className, instance = fileStem(source)) {
	return makeSeed(source, {
		role: "concept",
		domain,
		className,
		instance,
		aspect: "overview",
	});
}

const EXACT_RULES = new Map([
	["docs/lang/go/go.mdx", () => makeSeed("docs/lang/go/go.mdx", {
		role: "entity",
		domain: "language",
		className: "programming-language",
		instance: "go",
		aspect: "overview",
	})],
	["docs/lang/javascript/javascript.mdx", () => makeSeed("docs/lang/javascript/javascript.mdx", {
		role: "entity",
		domain: "language",
		className: "programming-language",
		instance: "javascript",
		aspect: "overview",
	})],
	["docs/lang/rust/rust.mdx", () => makeSeed("docs/lang/rust/rust.mdx", {
		role: "entity",
		domain: "language",
		className: "programming-language",
		instance: "rust",
		aspect: "overview",
	})],
	["docs/lang/shellscript/shellscript.mdx", () => makeSeed("docs/lang/shellscript/shellscript.mdx", {
		role: "entity",
		domain: "language",
		className: "programming-language",
		instance: "shellscript",
		aspect: "overview",
	})],
]);

const PREFIX_RULES = [
	{ prefix: ["docs", "lang", "go", "libraries"], domain: "language", className: "library", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["go"] },
	{ prefix: ["docs", "lang", "go", "package"], domain: "language", className: "package", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["go"] },
	{ prefix: ["docs", "lang", "go", "cgo"], domain: "language", className: "toolchain", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["go"] },
	{ prefix: ["docs", "lang", "go"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["go"] },
	{ prefix: ["docs", "lang", "python", "libraries"], domain: "language", className: "library", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["python"] },
	{ prefix: ["docs", "lang", "python", "package"], domain: "language", className: "package", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["python"] },
	{ prefix: ["docs", "lang", "python", "env"], domain: "language", className: "environment", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["python"] },
	{ prefix: ["docs", "lang", "python", "logger"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["python"] },
	{ prefix: ["docs", "lang", "python", "context"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["python"] },
	{ prefix: ["docs", "lang", "python"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["python"] },
	{ prefix: ["docs", "lang", "javascript", "libraries"], domain: "language", className: "library", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["javascript"] },
	{ prefix: ["docs", "lang", "javascript", "react"], domain: "language", className: "framework", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["javascript"] },
	{ prefix: ["docs", "lang", "javascript", "svelte"], domain: "language", className: "framework", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["javascript"] },
	{ prefix: ["docs", "lang", "javascript", "node-addon-api"], domain: "language", className: "api", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["javascript"] },
	{ prefix: ["docs", "lang", "javascript", "env"], domain: "language", className: "environment", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["javascript"] },
	{ prefix: ["docs", "lang", "javascript"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["javascript"] },
	{ prefix: ["docs", "lang", "cpp", "libraries"], domain: "language", className: "library", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["cpp"] },
	{ prefix: ["docs", "lang", "cpp", "build"], domain: "language", className: "build-tooling", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["cpp"] },
	{ prefix: ["docs", "lang", "cpp", "package"], domain: "language", className: "package", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["cpp"] },
	{ prefix: ["docs", "lang", "cpp", "advanced-cpp"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["cpp"] },
	{ prefix: ["docs", "lang", "cpp", "env"], domain: "language", className: "environment", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["cpp"] },
	{ prefix: ["docs", "lang", "cpp"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["cpp"] },
	{ prefix: ["docs", "lang", "rust"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["rust"] },
	{ prefix: ["docs", "lang", "shellscript"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["shellscript"] },
	{ prefix: ["docs", "lang", "flutter"], domain: "language", className: "framework", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["flutter"] },
	{ prefix: ["docs", "lang", "labview"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["labview"] },
	{ prefix: ["docs", "lang", "db", "sql"], domain: "data", className: "database", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["sql"] },
	{ prefix: ["docs", "lang", "db", "mongodb"], domain: "data", className: "database", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["mongodb"] },
	{ prefix: ["docs", "lang", "db", "dynamodb"], domain: "data", className: "database", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["dynamodb"] },
	{ prefix: ["docs", "lang", "db", "elasticsearch"], domain: "data", className: "database", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["elasticsearch"] },
	{ prefix: ["docs", "lang", "db", "s3"], domain: "data", className: "storage-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["s3"] },
	{ prefix: ["docs", "lang", "db"], domain: "data", className: "database", roleOverview: "concept", roleDetail: "operation", aspectPrefixes: ["db"] },
	{ prefix: ["docs", "lang", "design", "protocol-spec"], domain: "protocol", className: "application-protocol", roleOverview: "specification", roleDetail: "specification", aspectPrefixes: ["protocol", "spec"] },
	{ prefix: ["docs", "lang", "design", "openapi"], domain: "protocol", className: "api-spec", roleOverview: "specification", roleDetail: "specification", aspectPrefixes: ["openapi"] },
	{ prefix: ["docs", "lang", "design", "ddd"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["ddd"] },
	{ prefix: ["docs", "lang", "design", "pattern"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["pattern"] },
	{ prefix: ["docs", "lang", "design", "asynchronous-request-response"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["asynchronous-request-response"] },
	{ prefix: ["docs", "lang", "design", "limited-resources"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["limited-resources"] },
	{ prefix: ["docs", "lang", "design"], domain: "language", className: "concept", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["design"] },
	{ prefix: ["docs", "lang", "etc", "command-line-tools"], domain: "platform", className: "tool", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["command-line-tools"] },
	{ prefix: ["docs", "lang", "etc", "vim"], domain: "platform", className: "tool", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["vim"] },
	{ prefix: ["docs", "lang", "etc", "terminal"], domain: "platform", className: "tool", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["terminal"] },
	{ prefix: ["docs", "lang", "etc"], domain: "platform", className: "tool", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["etc"] },
	{ prefix: ["docs", "mlops", "mlops", "auth"], domain: "mlops", className: "auth-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["auth"] },
	{ prefix: ["docs", "mlops", "mlops", "container"], domain: "mlops", className: "container-platform", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["container"] },
	{ prefix: ["docs", "mlops", "mlops", "event"], domain: "mlops", className: "eventing-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["event"] },
	{ prefix: ["docs", "mlops", "mlops", "iac", "terragrunt"], domain: "mlops", className: "iac-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["terragrunt"] },
	{ prefix: ["docs", "mlops", "mlops", "iac"], domain: "mlops", className: "iac-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["iac"] },
	{ prefix: ["docs", "mlops", "mlops", "kubeflow"], domain: "mlops", className: "ml-platform", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["kubeflow"] },
	{ prefix: ["docs", "mlops", "mlops", "pulumi"], domain: "mlops", className: "iac-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["pulumi"] },
	{ prefix: ["docs", "mlops", "mlops", "aws"], domain: "mlops", className: "cloud-service", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["aws"] },
	{ prefix: ["docs", "mlops", "kubernetes", "cluster"], domain: "mlops", className: "cluster-orchestrator", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "kubernetes", "network", "gateway-api"], domain: "mlops", className: "gateway-api", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["gateway-api"] },
	{ prefix: ["docs", "mlops", "kubernetes", "network"], domain: "mlops", className: "networking", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "kubernetes", "security"], domain: "mlops", className: "security", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "kubernetes", "configuration"], domain: "mlops", className: "configuration", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "kubernetes", "workloads"], domain: "mlops", className: "workload", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "kubernetes", "storage"], domain: "mlops", className: "storage", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "kubernetes", "tools"], domain: "mlops", className: "tool", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "kubernetes", "upgrade"], domain: "mlops", className: "upgrade-plan", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "kubernetes"], domain: "mlops", className: "orchestrator", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["kubernetes"] },
	{ prefix: ["docs", "mlops", "network", "istio", "traffic-management", "envoy-filter"], domain: "mlops", className: "service-mesh", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["istio"] },
	{ prefix: ["docs", "mlops", "network", "istio", "traffic-management"], domain: "mlops", className: "service-mesh", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["istio"] },
	{ prefix: ["docs", "mlops", "network", "istio", "telemetry"], domain: "mlops", className: "service-mesh", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["istio"] },
	{ prefix: ["docs", "mlops", "network", "istio"], domain: "mlops", className: "service-mesh", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["istio"] },
	{ prefix: ["docs", "mlops", "network", "cilium"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["cilium"] },
	{ prefix: ["docs", "mlops", "network", "coredns"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["coredns"] },
	{ prefix: ["docs", "mlops", "network", "metallb"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["metallb"] },
	{ prefix: ["docs", "mlops", "network", "multus"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["multus"] },
	{ prefix: ["docs", "mlops", "network", "wireguard"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["wireguard"] },
	{ prefix: ["docs", "mlops", "network", "infiniband"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["infiniband"] },
	{ prefix: ["docs", "mlops", "network", "gcp"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["gcp"] },
	{ prefix: ["docs", "mlops", "network", "aws-load-balancer"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["aws-load-balancer"] },
	{ prefix: ["docs", "mlops", "network"], domain: "mlops", className: "networking-stack", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["network"] },
	{ prefix: ["docs", "mlops", "storage", "ceph"], domain: "data", className: "storage-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["ceph"] },
	{ prefix: ["docs", "mlops", "storage", "postgresql"], domain: "data", className: "database", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["postgresql"] },
	{ prefix: ["docs", "mlops", "storage", "mongodb"], domain: "data", className: "database", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["mongodb"] },
	{ prefix: ["docs", "mlops", "storage", "minio"], domain: "data", className: "object-storage", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["minio"] },
	{ prefix: ["docs", "mlops", "storage", "csi"], domain: "data", className: "storage-interface", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["csi"] },
	{ prefix: ["docs", "mlops", "storage"], domain: "data", className: "storage-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["storage"] },
	{ prefix: ["docs", "mlops", "monitoring", "collector", "vector"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["vector"] },
	{ prefix: ["docs", "mlops", "monitoring", "collector"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["collector"] },
	{ prefix: ["docs", "mlops", "monitoring", "prometheus"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["prometheus"] },
	{ prefix: ["docs", "mlops", "monitoring", "grafana"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["grafana"] },
	{ prefix: ["docs", "mlops", "monitoring", "loki"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["loki"] },
	{ prefix: ["docs", "mlops", "monitoring", "k6"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["k6"] },
	{ prefix: ["docs", "mlops", "monitoring", "opensearch"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["opensearch"] },
	{ prefix: ["docs", "mlops", "monitoring", "tempo"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["tempo"] },
	{ prefix: ["docs", "mlops", "monitoring"], domain: "mlops", className: "observability-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["monitoring"] },
	{ prefix: ["docs", "mlops", "serving", "llm", "gateway-api-inference-extension"], domain: "mlops", className: "serving-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["gateway-api-inference-extension"] },
	{ prefix: ["docs", "mlops", "serving", "llm", "vllm"], domain: "mlops", className: "serving-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["vllm"] },
	{ prefix: ["docs", "mlops", "serving", "llm"], domain: "mlops", className: "serving-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["llm"] },
	{ prefix: ["docs", "mlops", "provisioning", "karpenter"], domain: "mlops", className: "provisioning-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["karpenter"] },
	{ prefix: ["docs", "mlops", "provisioning", "keda"], domain: "mlops", className: "provisioning-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["keda"] },
	{ prefix: ["docs", "mlops", "provisioning", "knative"], domain: "mlops", className: "provisioning-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["knative"] },
	{ prefix: ["docs", "mlops", "provisioning", "kubevirt"], domain: "mlops", className: "provisioning-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["kubevirt"] },
	{ prefix: ["docs", "mlops", "provisioning", "ecr"], domain: "mlops", className: "provisioning-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["ecr"] },
	{ prefix: ["docs", "mlops", "provisioning", "harbor"], domain: "mlops", className: "provisioning-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["harbor"] },
	{ prefix: ["docs", "mlops", "provisioning", "spegel"], domain: "mlops", className: "provisioning-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["spegel"] },
	{ prefix: ["docs", "mlops", "provisioning"], domain: "mlops", className: "provisioning-tool", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["provisioning"] },
	{ prefix: ["docs", "mlops", "workflow", "argo-cd", "gitops"], domain: "mlops", className: "workflow-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["argo-cd"] },
	{ prefix: ["docs", "mlops", "workflow", "argo-cd"], domain: "mlops", className: "workflow-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["argo-cd"] },
	{ prefix: ["docs", "mlops", "workflow", "argo-workflows"], domain: "mlops", className: "workflow-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["argo-workflows"] },
	{ prefix: ["docs", "mlops", "workflow", "awx"], domain: "mlops", className: "workflow-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["awx"] },
	{ prefix: ["docs", "mlops", "workflow", "kubeflow-trainer"], domain: "mlops", className: "workflow-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["kubeflow-trainer"] },
	{ prefix: ["docs", "mlops", "workflow", "mpi-operator"], domain: "mlops", className: "workflow-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["mpi-operator"] },
	{ prefix: ["docs", "mlops", "workflow"], domain: "mlops", className: "workflow-system", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["workflow"] },
	{ prefix: ["docs", "mlops", "nn", "llm"], domain: "science", className: "model-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["llm"] },
	{ prefix: ["docs", "mlops", "nn", "cnn"], domain: "science", className: "model-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["cnn"] },
	{ prefix: ["docs", "mlops", "nn", "gnn"], domain: "science", className: "model-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["gnn"] },
	{ prefix: ["docs", "mlops", "nn", "rnn"], domain: "science", className: "model-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["rnn"] },
	{ prefix: ["docs", "mlops", "nn"], domain: "science", className: "model-family", roleOverview: "concept", roleDetail: "operation", aspectPrefixes: ["nn"] },
	{ prefix: ["docs", "mlops", "device", "amd"], domain: "mlops", className: "cluster-addon", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["amd"] },
	{ prefix: ["docs", "mlops", "device", "nvidia"], domain: "mlops", className: "cluster-addon", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["nvidia"] },
	{ prefix: ["docs", "mlops", "device", "node-feature-discovery"], domain: "mlops", className: "cluster-addon", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["node-feature-discovery"] },
	{ prefix: ["docs", "mlops", "device"], domain: "mlops", className: "cluster-addon", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["device"] },
	{ prefix: ["docs", "mlops", "scheduling"], domain: "mlops", className: "scheduler", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["scheduling"] },
	{ prefix: ["docs", "linux", "linux-kernel"], domain: "platform", className: "kernel", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["linux-kernel"] },
	{ prefix: ["docs", "linux", "linux-uboot"], domain: "platform", className: "bootloader", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["linux-uboot"] },
	{ prefix: ["docs", "linux", "kernel", "namespace"], domain: "platform", className: "kernel", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["namespace"] },
	{ prefix: ["docs", "linux", "kernel", "storage"], domain: "platform", className: "kernel", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["storage"] },
	{ prefix: ["docs", "linux", "kernel"], domain: "platform", className: "kernel", roleOverview: "operation", roleDetail: "operation", aspectPrefixes: ["kernel"] },
	{ prefix: ["docs", "linux", "package", "debian"], domain: "platform", className: "package-manager", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["debian"] },
	{ prefix: ["docs", "linux", "package"], domain: "platform", className: "package-manager", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["package"] },
	{ prefix: ["docs", "mcu", "avr"], domain: "hardware", className: "mcu-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["avr"] },
	{ prefix: ["docs", "mcu", "sam"], domain: "hardware", className: "mcu-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["sam"] },
	{ prefix: ["docs", "mcu", "stm32"], domain: "hardware", className: "mcu-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["stm32"] },
	{ prefix: ["docs", "mcu", "infineon"], domain: "hardware", className: "mcu-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["infineon"] },
	{ prefix: ["docs", "mcu", "nordic"], domain: "hardware", className: "mcu-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["nordic"] },
	{ prefix: ["docs", "mcu", "espressif"], domain: "hardware", className: "mcu-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["espressif"] },
	{ prefix: ["docs", "mcu", "arduino"], domain: "hardware", className: "mcu-family", roleOverview: "entity", roleDetail: "operation", aspectPrefixes: ["arduino"] },
	{ prefix: ["docs", "etc", "memo", "dev-lead"], domain: "management", className: "memo", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["dev-lead"] },
	{ prefix: ["docs", "etc", "memo"], domain: "management", className: "memo", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["memo"] },
	{ prefix: ["docs", "etc", "circuit"], domain: "hardware", className: "electronics", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["circuit"] },
	{ prefix: ["docs", "etc", "biochemistry"], domain: "science", className: "biology", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["biochemistry"] },
	{ prefix: ["docs", "etc", "project", "ahrs"], domain: "science", className: "project", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["ahrs"] },
	{ prefix: ["docs", "etc", "project"], domain: "science", className: "project", roleOverview: "concept", roleDetail: "concept", aspectPrefixes: ["project"] },
];

export function buildTargetPath({ role, domain, className, instance, aspect }) {
	const filename = aspect === "overview" ? instance : aspect;
	return `docs/${role}/${domain}/${className}/${instance}/${filename}.mdx`;
}

export function classifySeed(source) {
	const sourcePath = normalizeSourcePath(source);

	if (EXACT_RULES.has(sourcePath)) {
		return EXACT_RULES.get(sourcePath)();
	}

	for (const rule of PREFIX_RULES) {
		if (hasPrefix(splitPath(sourcePath), rule.prefix)) {
			return classifyPrefixGroup(sourcePath, rule);
		}
	}

	const parts = splitPath(sourcePath);
	const stem = fileStem(sourcePath);
	const root = parts[1] ?? "";
	const branch = parts[2] ?? "";

	if (parts[0] !== "docs") {
		throw new Error(`Unsupported source path: ${sourcePath}`);
	}

	if (root === "lang") {
		return directConcept(sourcePath, "language", "source-path", sourceSlug(sourcePath));
	}

	if (root === "mlops") {
		return directConcept(sourcePath, "mlops", "source-path", sourceSlug(sourcePath));
	}

	if (root === "linux") {
		return directConcept(sourcePath, "platform", "source-path", sourceSlug(sourcePath));
	}

	if (root === "mcu") {
		return makeSeed(sourcePath, {
			role: "entity",
			domain: "hardware",
			className: "mcu-family",
			instance: branch || stem,
			aspect: stem === (branch || stem) ? "overview" : stem,
		});
	}

	if (root === "etc") {
		return directConcept(sourcePath, "management", "source-path", sourceSlug(sourcePath));
	}

	return directConcept(sourcePath, "platform", "source-path", sourceSlug(sourcePath));
}
