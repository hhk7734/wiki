module.exports = {
	arduino: [
		"mcu/arduino/arduino-platform-specification",
		"mcu/arduino/arduino-library-specification",
		"mcu/arduino/arduino-how-to-use-library",
	],
	avr: [
		"mcu/avr/avr-build-project-in-terminal",
		"mcu/avr/avr-upload-executable-file-in-terminal",
		"mcu/avr/avr-upload-executable-file-in-atmel-studio-7",
		"mcu/avr/avr-lock-and-fuse-bits",
		"mcu/avr/avr-printf",
		"mcu/avr/avr-eeprom",
		"mcu/avr/avr-i2c",
	],
	biochemistry: ["etc/biochemistry/biochemistry-receptor-ligand"],
	circuit: [
		{
			type: "category",
			label: "Basics",
			items: ["etc/circuit/basics/circuit-capacitor"],
		},

		{
			type: "category",
			label: "Sensor",
			items: ["etc/circuit/sensor/sensor-fine-dust"],
		},
		{
			type: "category",
			label: "KiCad",
			items: ["etc/circuit/kicad/kicad-basics"],
		},
	],
	cpp: [
		{
			type: "category",
			label: "Build",
			items: [
				{
					type: "category",
					label: "Makefile",
					items: [
						"lang/cpp/build/makefile/makefile-basics",
						"lang/cpp/build/makefile/makefile-avr-example",
					],
				},
				"lang/cpp/build/cpp-cmake",
			],
		},
		{
			type: "category",
			label: "Libraries",
			items: [
				"lang/cpp/libraries/cpp-stl",
				"lang/cpp/libraries/cpp-exception-handling",
				{
					type: "category",
					label: "OpenCL",
					items: [
						"lang/cpp/libraries/opencl/opencl-basics",
						"lang/cpp/libraries/opencl/opencl-with-mali-gpu",
						"lang/cpp/libraries/opencl/opencl-example",
					],
				},
				{
					type: "category",
					label: "OpenCV",
					items: ["lang/cpp/libraries/opencv/opencv-installation"],
				},
				{
					type: "category",
					label: "Eigen",
					items: ["lang/cpp/libraries/Eigen/eigen-basics"],
				},
			],
		},
		{
			type: "category",
			label: "Advanced C++",
			items: [
				"lang/cpp/advanced-cpp/cpp-constexpr",
				{
					type: "category",
					label: "LLVM",
					items: [
						"lang/cpp/advanced-cpp/llvm/llvm-basics",
						"lang/cpp/advanced-cpp/llvm/llvm-build-from-source",
						"lang/cpp/advanced-cpp/llvm/llvm-cross-compile",
					],
				},
			],
		},
	],
	db: [
		{
			type: "category",
			label: "SQL",
			items: [
				"lang/db/sql/type",
				{
					type: "category",
					label: "MySQL",
					items: [
						"lang/db/sql/mysql/mysql",
						"lang/db/sql/mysql/user",
						"lang/db/sql/mysql/aggregate",
						"lang/db/sql/mysql/window",
						"lang/db/sql/mysql/join",
						"lang/db/sql/mysql/explain",
						"lang/db/sql/mysql/lock",
						"lang/db/sql/mysql/stored-program",
					],
				},
				{
					type: "category",
					label: "PostgresSQL",
					items: [
						"lang/db/sql/postgresql/postgresql",
						"lang/db/sql/postgresql/user",
						"lang/db/sql/postgresql/table",
					],
				},
				{
					type: "category",
					label: "Design",
					items: [
						"lang/db/sql/design/pagination",
						"lang/db/sql/design/user-defined-order",
					],
				},
			],
		},
		{
			type: "category",
			label: "S3",
			items: ["lang/db/s3/basics"],
		},
		"lang/db/elasticsearch",
		{
			type: "category",
			label: "DynamoDB",
			items: ["lang/db/dynamodb/basics", "lang/db/dynamodb/update-item"],
		},
	],
	design: [
		"lang/design/tdd",
		{
			type: "category",
			label: "Domain-Driven",
			items: [
				"lang/design/ddd/domain",
				"lang/design/ddd/repository",
				"lang/design/ddd/hexagonal",
				"lang/design/ddd/refactoring",
			],
		},
		"lang/design/eda",
		"lang/design/event-storming",
		"lang/design/solid",
		"lang/design/contextual-logging",
		{
			type: "category",
			label: "Pattern",
			items: ["lang/design/pattern/repository"],
		},
		{
			type: "category",
			label: "OpenAPI",
			items: ["lang/design/openapi/restful-api", "lang/design/openapi/openapi"],
		},
		{
			type: "category",
			label: "Protocol",
			items: [
				{
					type: "category",
					label: "HTTP",
					items: [
						"lang/design/protocol/http/mime-type",
						"lang/design/protocol/http/cookie",
						"lang/design/protocol/http/cors",
						"lang/design/protocol/http/websocket",
						"lang/design/protocol/http/webrtc",
					],
				},
				{
					type: "category",
					label: "Protobuf",
					items: [
						"lang/design/protocol/protobuf/protobuf",
						"lang/design/protocol/protobuf/type",
					],
				},
				{
					type: "category",
					label: "Email",
					items: ["lang/design/protocol/email/authentication"],
				},
			],
		},
		{
			type: "category",
			label: "Cache",
			items: ["lang/design/cache/cache-aside"],
		},
		{
			type: "category",
			label: "Asynch Request Response",
			items: [
				"lang/design/asynchronous-request-response/asynchronous-request-response",
				"lang/design/asynchronous-request-response/queue-worker",
			],
		},
		{
			type: "category",
			label: "Limited Resources",
			items: ["lang/design/limited-resources/request-rate-limit"],
		},
	],
	programmingetc: [
		{
			type: "category",
			label: "Terminal",
			items: [
				{
					type: "category",
					label: "Emulator",
					items: ["lang/etc/terminal/emulator/alacritty"],
				},
				{
					type: "category",
					label: "Shell",
					items: ["lang/etc/terminal/shell/zsh"],
				},
			],
		},
		{
			type: "category",
			label: "Vim",
			items: [
				"lang/etc/vim/nvim",
				"lang/etc/vim/nvim-tree",
				"lang/etc/vim/regex",
			],
		},
	],
	espressif: ["mcu/espressif/esp8266-esp-01-module"],
	flutter: [
		{
			type: "category",
			label: "Engine",
			items: [
				"lang/flutter/engine/flutter-engine-for-linux-arm64",
				"lang/flutter/engine/flutter-app-for-linux-arm64",
			],
		},
		{
			type: "category",
			label: "Bloc",
			items: [
				"lang/flutter/bloc/flutter-bloc-widgets",
				"lang/flutter/bloc/event-state",
				"lang/flutter/bloc/flutter-bloc-observer",
			],
		},
		{
			type: "category",
			label: "Package",
			items: ["lang/flutter/package/flutter-package-linux-methodchannel"],
		},
	],
	go: [
		"lang/go/go",
		{
			type: "link",
			label: "Logging",
			href: "https://github.com/hhk7734/zapx.go",
		},
		"lang/go/error",
		"lang/go/test",
		"lang/go/context",
		"lang/go/goroutine",
		{
			type: "category",
			label: "Libraries",
			items: [
				{
					type: "category",
					label: "Gin",
					items: [
						"lang/go/libraries/gin/gin",
						"lang/go/libraries/gin/validator",
						"lang/go/libraries/gin/crud",
						"lang/go/libraries/gin/shutdown",
						"lang/go/libraries/gin/deploy",
					],
				},
				{
					type: "category",
					label: "gRPC",
					items: [
						"lang/go/libraries/grpc/protobuf",
						"lang/go/libraries/grpc/type",
						"lang/go/libraries/grpc/grpc",
					],
				},
				"lang/go/libraries/validator",
				"lang/go/libraries/swagger",
				"lang/go/libraries/gorm",
				"lang/go/libraries/encoding-json",
				"lang/go/libraries/smtp",
				"lang/go/libraries/session",
				"lang/go/libraries/websocket",
				{
					type: "category",
					label: "Firebase",
					items: ["lang/go/libraries/firebase/custom-email"],
				},
			],
		},
		{
			type: "category",
			label: "Custom Package",
			items: ["lang/go/package/package"],
		},
	],
	infineon: [
		"mcu/infineon/tricore-development-environment",
		"mcu/infineon/tricore-upload-executable-file-in-udevisualplatform",
		"mcu/infineon/tricore-shieldbuddy-tc275",
		"mcu/infineon/tricore-tc27d-ports",
		"mcu/infineon/tricore-tc27d-stm",
		"mcu/infineon/tricore-tc27d-bsp",
		"mcu/infineon/tricore-tc27d-asc",
		"mcu/infineon/tricore-tc27d-terminal",
		"mcu/infineon/tricore-tc27d-vadc",
	],
	labview: [
		"lang/labview/labview-creating-project-and-vi",
		"lang/labview/labview-basic-terms",
		"lang/labview/labview-shortcut",
		"lang/labview/labview-basic-arithmetic",
		"lang/labview/labview-for-loop",
		"lang/labview/labview-while-loop",
		"lang/labview/labview-case-structure",
	],
	"linux-kernel": [
		"linux/linux-kernel/build-linux-kernel",
		"linux/linux-kernel/linux-kernel-ftrace",
		"linux/linux-kernel/linux-kernel-how-to-contribute",
		"linux/linux-kernel/linux-kernel-tty0uart",
		{
			type: "category",
			label: "Module",
			items: [
				"linux/linux-kernel/module/build-external-module",
				"linux/linux-kernel/module/dkms",
			],
		},
		{
			type: "category",
			label: "Device tree",
			items: [
				"linux/linux-kernel/device-tree/device-tree-basics",
				"linux/linux-kernel/device-tree/device-tree-overlay",
			],
		},
		{
			type: "category",
			label: "Drivers",
			items: ["linux/linux-kernel/driver/bluetooth"],
		},
	],
	"linux-package": [
		{
			type: "category",
			label: "Debian",
			items: [
				"linux/package/debian/basics",
				"linux/package/debian/makefile",
				"linux/package/debian/advanced",
				"linux/package/debian/launchpad-ppa",
			],
		},
	],
	"linux-tools": [
		"linux/linux-tools/zsh-and-utility",
		{
			type: "category",
			label: "Git",
			items: [
				"linux/linux-tools/git/git-basics",
				"linux/linux-tools/git/git-commit-message",
				"linux/linux-tools/git/git-fork-pull-request",
				"linux/linux-tools/git/git-submodule",
				"linux/linux-tools/git/git-tag",
				"linux/linux-tools/git/git-create-apply-patch",
				"linux/linux-tools/git/git-github-issue",
				"linux/linux-tools/git/pre-commit",
				"linux/linux-tools/git/lfs",
			],
		},
		"linux/linux-tools/progress-bar",
		// DEPRECATED: 2023-11-01
		{
			type: "link",
			label: "SSH",
			href: "/docs/lang/shellscript/command-line-tools/ssh",
		},
		"linux/linux-tools/linux-udev",
		{
			type: "category",
			label: "Storage",
			items: [
				"linux/linux-tools/storage/partition-management",
				"linux/linux-tools/storage/clone-os-image",
			],
		},
		{
			type: "category",
			label: "Network",
			items: ["linux/linux-tools/network/nmap"],
		},
		"linux/linux-tools/linux-tools-etc",
	],
	"linux-uboot": [
		"linux/linux-uboot/embedded-linux-boot-process",
		"linux/linux-uboot/build-uboot",
		"linux/linux-uboot/uboot-custom-command",
		"linux/linux-uboot/uboot-configuration",
	],
	memo: [
		"etc/memo/semantic-versioning-2-0-0",
		"etc/memo/ssl-lets-encrypt",
		{
			type: "category",
			label: "Dev-Lead",
			items: [
				"etc/memo/dev-lead/role-and-responsibility",
				"etc/memo/dev-lead/planning-to-development",
				"etc/memo/dev-lead/scrum",
			],
		},
	],
	mlops: [
		{
			type: "category",
			label: "IaC",
			items: [
				{
					type: "category",
					label: "Pulumi",
					items: [
						"mlops/mlops/pulumi/pulumi",
						"mlops/mlops/pulumi/config",
						"mlops/mlops/pulumi/import-export",
						"mlops/mlops/pulumi/resource-options",
						"mlops/mlops/pulumi/dynamic",
						"mlops/mlops/pulumi/stack-reference",
						"mlops/mlops/pulumi/micro-stacks",
						"mlops/mlops/pulumi/crd2pulumi",
					],
				},
				{
					type: "category",
					label: "Terraform",
					items: ["mlops/mlops/terraform/basics"],
				},
				{
					type: "category",
					label: "Ansible",
					items: [
						"mlops/mlops/ansible/basics",
						"mlops/mlops/ansible/vault",
						"mlops/mlops/ansible/roles",
					],
				},
			],
		},
		{
			type: "category",
			label: "Container",
			items: [
				"mlops/mlops/container/cri-containerd",
				"mlops/mlops/container/apptainer",
				"mlops/mlops/container/buildah-skopeo",
				"mlops/mlops/container/podman",
				"mlops/mlops/container/nvidia-container-toolkit",
			],
		},
		{
			type: "category",
			label: "Kubernetes",
			items: [
				{
					type: "category",
					label: "Tools",
					items: [
						"mlops/mlops/kubernetes/tools/kubeadm",
						"mlops/mlops/kubernetes/tools/kustomize",
						"mlops/mlops/kubernetes/tools/helm",
						"mlops/mlops/kubernetes/tools/k0s",
						"mlops/mlops/kubernetes/tools/etc",
					],
				},
				"mlops/mlops/kubernetes/deployment",
				"mlops/mlops/kubernetes/service",
				"mlops/mlops/kubernetes/persistent-volume",
				"mlops/mlops/kubernetes/label",
				{
					type: "category",
					label: "Workloads",
					items: ["mlops/mlops/kubernetes/workloads/pod-lifecycle"],
				},
				{
					type: "category",
					label: "Configuration",
					items: [
						"mlops/mlops/kubernetes/configuration/env",
						"mlops/mlops/kubernetes/configuration/configmap",
						"mlops/mlops/kubernetes/configuration/secret",
					],
				},
				{
					type: "category",
					label: "Scheduling",
					items: [
						"mlops/mlops/kubernetes/scheduling/affinity",
						"mlops/mlops/kubernetes/scheduling/taint-toleration",
						"mlops/mlops/kubernetes/scheduling/topology-spread-constraints",
					],
				},
				{
					type: "category",
					label: "API Access Control",
					items: [
						"mlops/mlops/kubernetes/api-access-control/admission-controller",
					],
				},
				{
					type: "category",
					label: "Administer a Cluster",
					items: ["mlops/mlops/kubernetes/administer-cluster/drain-node"],
				},
				{
					type: "category",
					label: "Upgrade",
					items: [
						"mlops/mlops/kubernetes/upgrade/1-21-1-22",
						"mlops/mlops/kubernetes/upgrade/1-22-1-23",
					],
				},
			],
		},
		{
			type: "category",
			label: "Storage",
			items: [
				"mlops/mlops/storage/local-path-provisioner",
				"mlops/mlops/storage/aws-ebs-csi-driver",
				"mlops/mlops/storage/aws-efs-csi-driver",
				"mlops/mlops/storage/rook-ceph",
				{
					type: "category",
					label: "PostgresSQL",
					items: [
						"mlops/mlops/storage/postgresql/postgresql",
						"mlops/mlops/storage/postgresql/pgbouncer",
						"mlops/mlops/storage/postgresql/ha",
					],
				},
				"mlops/mlops/storage/harbor",
			],
		},
		{
			type: "category",
			label: "Provisioning",
			items: [
				{
					type: "category",
					label: "Karpenter",
					items: [
						"mlops/mlops/provisioning/karpenter/karpenter",
						"mlops/mlops/provisioning/karpenter/spot-event",
						"mlops/mlops/provisioning/karpenter/crd",
						"mlops/mlops/provisioning/karpenter/scheduling",
						"mlops/mlops/provisioning/karpenter/deprovisioning",
					],
				},
				{
					type: "category",
					label: "KEDA",
					items: [
						"mlops/mlops/provisioning/keda/keda",
						"mlops/mlops/provisioning/keda/crd",
						"mlops/mlops/provisioning/keda/external-scaler",
					],
				},
				{
					type: "category",
					label: "Knative",
					items: [
						"mlops/mlops/provisioning/knative/knative",
						"mlops/mlops/provisioning/knative/serving-crds",
					],
				},
				{
					type: "category",
					label: "KServe",
					items: [
						"mlops/mlops/provisioning/kserve/kserve",
						"mlops/mlops/provisioning/kserve/crds",
						"mlops/mlops/provisioning/kserve/custom",
						"mlops/mlops/provisioning/kserve/mlflow",
					],
				},
				{
					type: "category",
					label: "Nvidia",
					items: [
						"mlops/mlops/provisioning/nvidia/k8s-device-plugin",
						"mlops/mlops/provisioning/nvidia/gpu-operator",
					],
				},
			],
		},
		{
			type: "category",
			label: "Network",
			items: [
				"mlops/mlops/network/cni-calico",
				{
					type: "category",
					label: "Istio",
					items: [
						"mlops/mlops/network/istio/istio",
						"mlops/mlops/network/istio/istio-csr",
						"mlops/mlops/network/istio/multi-cluster",
						"mlops/mlops/network/istio/upgrade",
						{
							type: "category",
							label: "Traffic Management",
							items: [
								"mlops/mlops/network/istio/traffic-management/gateway",
								"mlops/mlops/network/istio/traffic-management/virtual-service",
								{
									type: "category",
									label: "EnvoyFilter",
									items: [
										"mlops/mlops/network/istio/traffic-management/envoy-filter/envoy-filter",
										"mlops/mlops/network/istio/traffic-management/envoy-filter/auth",
										"mlops/mlops/network/istio/traffic-management/envoy-filter/compression",
									],
								},
							],
						},
						{
							type: "category",
							label: "Security",
							items: [
								{
									type: "category",
									label: "Authorization",
									items: [
										"mlops/mlops/network/istio/security/authorization/authorization",
									],
								},
							],
						},
						"mlops/mlops/network/istio/kiali",
						"mlops/mlops/network/istio/jaeger",
						"mlops/mlops/network/istio/jwt",
					],
				},
				{
					type: "category",
					label: "MetalLB",
					items: [
						"mlops/mlops/network/metallb/metallb",
						"mlops/mlops/network/metallb/crds",
					],
				},
			],
		},
		{
			type: "category",
			label: "Monitoring",
			items: [
				"mlops/mlops/monitoring/metrics-server",
				{
					type: "category",
					label: "Collector",
					items: [
						"mlops/mlops/monitoring/collector/fluent-bit",
						"mlops/mlops/monitoring/collector/fluentd",
					],
				},
				{
					type: "category",
					label: "ECK",
					items: ["mlops/mlops/monitoring/eck/operator"],
				},
				{
					type: "category",
					label: "Prometheus",
					items: [
						"mlops/mlops/monitoring/prometheus/operator",
						"mlops/mlops/monitoring/prometheus/crd",
						"mlops/mlops/monitoring/prometheus/promql",
						"mlops/mlops/monitoring/prometheus/kube-state-metrics",
						"mlops/mlops/monitoring/prometheus/node-exporter",
						"mlops/mlops/monitoring/prometheus/kubelet",
						"mlops/mlops/monitoring/prometheus/thanos",
					],
				},
				{
					type: "category",
					label: "PLG",
					items: [
						"mlops/mlops/monitoring/plg/loki",
						"mlops/mlops/monitoring/plg/label",
						"mlops/mlops/monitoring/plg/grafana",
						"mlops/mlops/monitoring/plg/dashboard",
						"mlops/mlops/monitoring/plg/alert",
					],
				},
				{
					type: "category",
					label: "OpenSearch",
					items: ["mlops/mlops/monitoring/opensearch/basics"],
				},
				"mlops/mlops/monitoring/dcgm-exporter",
				"mlops/mlops/monitoring/kubernetes-dashboard",
			],
		},
		{
			type: "category",
			label: "Auth",
			items: [
				"mlops/mlops/auth/kubeconfig",
				"mlops/mlops/auth/rbac",
				"mlops/mlops/auth/x509",
				{
					type: "category",
					label: "cert-manager",
					items: [
						"mlops/mlops/auth/cert-manager/cert-manager",
						"mlops/mlops/auth/cert-manager/crds",
						"mlops/mlops/auth/cert-manager/lets-encrypt",
					],
				},
				{
					type: "category",
					label: "Keycloak",
					items: [
						"mlops/mlops/auth/keycloak/keycloak",
						"mlops/mlops/auth/keycloak/realm",
						"mlops/mlops/auth/keycloak/openid-connect",
						"mlops/mlops/auth/keycloak/identity-providers",
					],
				},
				"mlops/mlops/auth/oauth2-proxy",
			],
		},
		{
			type: "category",
			label: "Workflow",
			items: [
				{
					type: "category",
					label: "Argo CD",
					items: [
						"mlops/mlops/workflow/argo-cd/argo-cd",
						"mlops/mlops/workflow/argo-cd/crd",
						{
							type: "category",
							label: "GitOps",
							items: [
								"mlops/mlops/workflow/argo-cd/gitops/gitops",
								"mlops/mlops/workflow/argo-cd/gitops/github-action",
							],
						},
					],
				},
				{
					type: "category",
					label: "Argo Workflows",
					items: [
						"mlops/mlops/workflow/argo-workflows/argo-workflows",
						"mlops/mlops/workflow/argo-workflows/crd",
						"mlops/mlops/workflow/argo-workflows/entrypoint-templates",
						"mlops/mlops/workflow/argo-workflows/dag",
						"mlops/mlops/workflow/argo-workflows/variables",
						"mlops/mlops/workflow/argo-workflows/garbage-collection",
						"mlops/mlops/workflow/argo-workflows/client",
					],
				},
			],
		},
		{
			type: "category",
			label: "Event",
			items: [
				"mlops/mlops/event/argo-events",
				{
					type: "category",
					label: "NATS",
					items: [
						"mlops/mlops/event/nats/nats",
						"mlops/mlops/event/nats/cli",
						"mlops/mlops/event/nats/crd",
						"mlops/mlops/event/nats/auth",
						"mlops/mlops/event/nats/dlq",
					],
				},
				{
					type: "category",
					label: "Redis",
					items: ["mlops/mlops/event/redis/redis"],
				},
				"mlops/mlops/event/rabbitmq",
				"mlops/mlops/event/rabbitmq-flow",
			],
		},
		{
			type: "category",
			label: "AWS",
			items: [
				{
					type: "category",
					label: "IAM",
					items: [
						"mlops/mlops/aws/iam/iam",
						"mlops/mlops/aws/iam/cross-accounts-access",
						"mlops/mlops/aws/iam/spot-role",
					],
				},
				"mlops/mlops/aws/vpc",
				{
					type: "category",
					label: "EKS",
					items: [
						"mlops/mlops/aws/eks/eks",
						"mlops/mlops/aws/eks/node-group",
						"mlops/mlops/aws/eks/eks-rbac",
						"mlops/mlops/aws/eks/keycloak",
					],
				},
				"mlops/mlops/aws/cluster-autoscaler",
				"mlops/mlops/aws/ecr",
				{
					type: "category",
					label: "ParallelCluster",
					items: [
						"mlops/mlops/aws/parallel-cluster/parallel-cluster",
						"mlops/mlops/aws/parallel-cluster/custom-action",
						"mlops/mlops/aws/parallel-cluster/etc",
					],
				},
				"mlops/mlops/aws/ses",
			],
		},
		{
			type: "category",
			label: "Kubeflow",
			items: [
				"mlops/mlops/kubeflow/architecture",
				"mlops/mlops/kubeflow/access-management",
				"mlops/mlops/kubeflow/notebook",
			],
		},
	],
	nn: [
		{
			type: "category",
			label: "Neural Network",
			items: ["mlops/nn/nn/nn", "mlops/nn/nn/derivative"],
		},
		"mlops/nn/nn-cpu-gpu-npu",
		{
			type: "category",
			label: "CNN",
			items: ["mlops/nn/cnn/conv2d", "mlops/nn/cnn/batch-normalization"],
		},
		{
			type: "category",
			label: "RNN",
			items: ["mlops/nn/rnn/rnn"],
		},
		{
			type: "category",
			label: "Transformer",
			items: ["mlops/nn/transformer/transformer"],
		},
		{
			type: "category",
			label: "GNN",
			items: ["mlops/nn/gnn/gnn"],
		},
	],
	javascript: [
		"lang/javascript/javascript",
		{
			type: "category",
			label: "node-addon-api",
			items: [
				"lang/javascript/node-addon-api/basics",
				"lang/javascript/node-addon-api/class-binding",
			],
		},
		{
			type: "category",
			label: "Emscripten",
			items: ["lang/javascript/emscripten/basics"],
		},
		{
			type: "category",
			label: "React",
			items: [
				"lang/javascript/react/lifecycle",
				{
					type: "category",
					label: "Redux",
					items: ["lang/javascript/react/redux/redux-toolkit"],
				},
				{
					type: "category",
					label: "Jotai",
					items: ["lang/javascript/react/jotai/jotai"],
				},
				{
					type: "category",
					label: "React Query",
					items: [
						"lang/javascript/react/react-query/use-query",
						"lang/javascript/react/react-query/use-mutation",
					],
				},
				{
					type: "category",
					label: "Next.js",
					items: [
						"lang/javascript/react/nextjs/nextjs",
						"lang/javascript/react/nextjs/env",
					],
				},
			],
		},
		{
			type: "category",
			label: "Components",
			items: ["lang/javascript/components/semantic-elements"],
		},
		{
			type: "category",
			label: "Libraries",
			items: [
				{
					type: "category",
					label: "Firebase",
					items: [
						"lang/javascript/libraries/firebase/authentication",
						"lang/javascript/libraries/firebase/custom-email-handler",
					],
				},
				"lang/javascript/libraries/github-probot",
			],
		},
	],
	nordic: ["mcu/nordic/nrf-development-environment"],
	project: [
		{
			type: "category",
			label: "AHRS",
			items: [
				"etc/project/ahrs/ahrs-quaternions-rotations",
				"etc/project/ahrs/ahrs-euler-angles",
				"etc/project/ahrs/ahrs-extended-kalman-filter",
				"etc/project/ahrs/ahrs-sensor-calibration",
			],
		},
	],
	python: [
		{
			type: "category",
			label: "ENV",
			items: [
				"lang/python/env/pyenv",
				"lang/python/env/pipenv",
				"lang/python/env/poetry",
				"lang/python/env/conda",
				"lang/python/env/linting-formatting",
			],
		},
		"lang/python/exception",
		{
			type: "category",
			label: "Logger",
			items: [
				"lang/python/logger/logger",
				"lang/python/logger/custom",
				{
					type: "link",
					label: "Contextual Logging",
					href: "https://github.com/hhk7734/loggingx.py",
				},
			],
		},
		"lang/python/pytest",
		{
			type: "category",
			label: "asyncio",
			items: ["lang/python/asyncio/asyncio"],
		},
		{
			type: "category",
			label: "context",
			items: ["lang/python/context/contextvar"],
		},
		{
			type: "category",
			label: "Libraries",
			items: [
				{
					type: "category",
					label: "ctypes",
					items: [
						"lang/python/libraries/ctypes/python-ctypes-convert-bytes-structure",
					],
				},
				"lang/python/libraries/concurrent-futures",
				{
					type: "category",
					label: "gpiod",
					items: ["lang/python/libraries/gpiod/python-gpiod-about"],
				},
				{
					type: "category",
					label: "OpenCV",
					items: [
						"lang/cpp/libraries/opencv/opencv-installation",
						"lang/python/libraries/opencv/opencv-read-image-video",
						"lang/python/libraries/opencv/opencv-draw-figure",
						"lang/python/libraries/opencv/opencv-color-spaces",
						"lang/python/libraries/opencv/opencv-histogram",
					],
				},
				"lang/python/libraries/python-pybluez",
				{
					type: "category",
					label: "PySide2",
					items: [
						"lang/python/libraries/pyside2/pyside2-installation",
						"lang/python/libraries/pyside2/pyside2-convert-ui-to-python",
						"lang/python/libraries/pyside2/pyside2-signal-and-slot",
						"lang/python/libraries/pyside2/pyside2-qtimer",
						"lang/python/libraries/pyside2/pyside2-qthread",
						"lang/python/libraries/pyside2/pyside2-qrunnable-and-qthreadpool",
						"lang/python/libraries/pyside2/pyside2-custom-qdialog",
					],
				},
				"lang/python/libraries/python-socket",
				"lang/python/libraries/python-tkinter",
				{
					type: "category",
					label: "yolov4",
					items: [
						"lang/python/libraries/yolov4/python-yolov4-about",
						"lang/python/libraries/yolov4/python-yolov4-dataset",
						"lang/python/libraries/yolov4/python-yolov4-training",
						"lang/python/libraries/yolov4/python-yolov4-map",
						"lang/python/libraries/yolov4/python-yolov4-edge-tpu",
						{
							type: "category",
							label: "Model",
							items: [
								"lang/python/libraries/yolov4/model/python-yolov4-model-backbone",
								"lang/python/libraries/yolov4/model/python-yolov4-model-neck",
								"lang/python/libraries/yolov4/model/python-yolov4-model-loss",
							],
						},
					],
				},
				{
					type: "category",
					label: "MPI4PY",
					items: ["lang/python/libraries/mpi4py/basics"],
				},
				{
					type: "category",
					label: "FastAPI",
					items: [
						"lang/python/libraries/fastapi/basics",
						{
							type: "category",
							label: "Middleware",
							items: ["lang/python/libraries/fastapi/middleware/logger"],
						},
						"lang/python/libraries/fastapi/lifespan",
					],
				},
				{
					type: "category",
					label: "gRPC",
					items: [
						"lang/python/libraries/grpc/protobuf",
						"lang/python/libraries/grpc/type",
					],
				},
			],
		},
		{
			type: "category",
			label: "Custom Package",
			items: [
				{
					type: "category",
					label: "Pybind11",
					items: [
						"lang/python/package/pybind11/pybind11",
						"lang/python/package/pybind11/type",
					],
				},
				"lang/python/package/setuptools",
				"lang/python/package/poetry",
				"lang/python/package/conda",
				"lang/python/package/python-package-sphinx",
			],
		},
	],
	rust: [
		"lang/rust/rust",
		{
			type: "category",
			label: "Libraries",
			items: [
				{
					type: "category",
					label: "Actix Web",
					items: ["lang/rust/libraries/actix-web/actix-web"],
				},
			],
		},
	],
	sam: [
		"mcu/sam/sam-development-environment",
		"mcu/sam/sam-sam4s2a-fcpu",
		"mcu/sam/sam-sam4s2a-usart",
		"mcu/sam/sam-sam4s2a-stdio",
		"mcu/sam/sam-sam4s2a-time",
		"mcu/sam/sam-sam4s2a-ioport",
		"mcu/sam/sam-sam4s2a-adc",
	],
	shellscript: [
		"lang/shellscript/shellscript",
		"lang/shellscript/text-color",
		"lang/shellscript/getopt",
		"lang/shellscript/redirection-piping",
		{
			type: "category",
			label: "Command Line Tools",
			items: [
				"lang/shellscript/command-line-tools/xargs",
				"lang/shellscript/command-line-tools/jq",
				"lang/shellscript/command-line-tools/ssh",
			],
		},
	],
	stm32: [
		"mcu/stm32/stm32-create-project-stm32cubeide",
		"mcu/stm32/stm32-call-c++-on-c",
		"mcu/stm32/stm32-upload-executable-file-stm32cubeide",
		"mcu/stm32/stm32-printf-usage-stm32cubeide",
		"mcu/stm32/stm32-spi",
		"mcu/stm32/stm32-low-power-modes",
	],
};
