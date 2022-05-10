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
  "debian-package": [
    "linux/debian-package/debian-package-basics",
    "linux/debian-package/debian-package-makefile",
    "linux/debian-package/debian-package-advanced",
    "linux/debian-package/debian-launchpad-ppa",
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
      label: "DynamoDB",
      items: ["lang/db/dynamodb/basics", "lang/db/dynamodb/update-item"],
    },
    "lang/db/mongodb",
    "lang/db/influxdb",
    {
      type: "category",
      label: "SQL",
      items: ["lang/db/sql/postgresql", "lang/db/sql/sqlalchemy"],
    },
    {
      type: "category",
      label: "S3",
      items: ["lang/db/s3/basics"],
    },
  ],
  design: [
    "lang/design/ddd",
    // "lang/design/tdd",
    "lang/design/solid",
    "lang/design/repository-pattern",
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
        "lang/flutter/bloc/flutter-bloc-event-state",
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
    "lang/go/basics",
    "lang/go/restful-api",
    "lang/go/logging",
    "lang/go/testify",
    "lang/go/context",
    "lang/go/goroutine",
    {
      type: "category",
      label: "Libraries",
      items: [
        "lang/go/libraries/gin",
        "lang/go/libraries/gin-swagger",
        "lang/go/libraries/go-redis",
        "lang/go/libraries/encoding-json",
        "lang/go/libraries/go-yaml",
      ],
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
    "linux/linux-kernel/build-external-linux-module",
    "linux/linux-kernel/linux-kernel-how-to-contribute",
    "linux/linux-kernel/linux-kernel-tty0uart",
    {
      type: "category",
      label: "Device tree",
      items: [
        "linux/linux-kernel/device-tree/device-tree-basics",
        "linux/linux-kernel/device-tree/device-tree-overlay",
      ],
    },
  ],
  "linux-tools": [
    "linux/linux-tools/zsh-and-utility",
    {
      type: "category",
      label: "Vim",
      items: [
        "linux/linux-tools/vim/vim-basics",
        "linux/linux-tools/vim/regex-for-vim",
      ],
    },
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
      ],
    },
    {
      type: "category",
      label: "Shell script",
      items: [
        "linux/linux-tools/shell-script/shell-script-basics",
        "linux/linux-tools/shell-script/shell-script-text-color",
        "linux/linux-tools/shell-script/shell-script-getopt",
      ],
    },
    "linux/linux-tools/progress-bar",
    "linux/linux-tools/ssh",
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
      items: [
        "linux/linux-tools/network/nmap",
        "linux/linux-tools/network/ss",
        "linux/linux-tools/network/nslookup",
      ],
    },
    "linux/linux-tools/linux-tools-etc",
  ],
  "linux-uboot": [
    "linux/linux-uboot/embedded-linux-boot-process",
    "linux/linux-uboot/build-uboot",
    "linux/linux-uboot/uboot-custom-command",
    "linux/linux-uboot/uboot-configuration",
  ],
  memo: ["etc/memo/semantic-versioning-2-0-0", "etc/memo/ssl-lets-encrypt"],
  mlops: [
    {
      type: "category",
      label: "Pulumi",
      items: [
        "nn/mlops/pulumi/basics",
        "nn/mlops/pulumi/config",
        "nn/mlops/pulumi/import-export",
        "nn/mlops/pulumi/resource-options",
        "nn/mlops/pulumi/dynamic",
      ],
    },
    {
      type: "category",
      label: "Terraform",
      items: ["nn/mlops/terraform/basics"],
    },
    {
      type: "category",
      label: "Ansible",
      items: [
        "nn/mlops/ansible/basics",
        "nn/mlops/ansible/vault",
        "nn/mlops/ansible/roles",
      ],
    },
    {
      type: "category",
      label: "Container",
      items: [
        "nn/mlops/container/cri-containerd",
        "nn/mlops/container/apptainer",
        "nn/mlops/container/buildah-skopeo",
        "nn/mlops/container/podman",
        "nn/mlops/container/image-pull-secrets",
      ],
    },
    "nn/mlops/kubeadm",
    {
      type: "category",
      label: "Kubernetes",
      items: [
        "nn/mlops/kubernetes/deployment",
        "nn/mlops/kubernetes/service",
        "nn/mlops/kubernetes/mlops-k8s-persistent-volume",
      ],
    },
    "nn/mlops/kustomize",
    "nn/mlops/helm",
    {
      type: "category",
      label: "Storage",
      items: [
        "nn/mlops/storage/local-path-provisioner",
        "nn/mlops/storage/aws-ebs-csi-driver",
        "nn/mlops/storage/aws-efs-csi-driver",
        "nn/mlops/storage/rook-ceph",
        "nn/mlops/storage/postgresql",
        "nn/mlops/storage/redis",
      ],
    },
    {
      type: "category",
      label: "Node",
      items: ["nn/mlops/node/karpenter", "nn/mlops/node/nvidia-gpu-operator"],
    },
    {
      type: "category",
      label: "Network",
      items: [
        "nn/mlops/network/cni-calico",
        "nn/mlops/network/coredns",
        {
          type: "category",
          label: "Istio",
          items: [
            "nn/mlops/network/istio/basics",
            "nn/mlops/network/istio/gateway-virtual-service",
            "nn/mlops/network/istio/kiali",
            "nn/mlops/network/istio/jwt",
            "nn/mlops/network/istio/cors",
            "nn/mlops/network/istio/multi-cluster",
          ],
        },
        "nn/mlops/network/cert-manager",
      ],
    },
    {
      type: "category",
      label: "Monitoring",
      items: [
        "nn/mlops/monitoring/metrics-server",
        "nn/mlops/monitoring/kubernetes-dashboard",
        "nn/mlops/monitoring/prometheus-operator",
        "nn/mlops/monitoring/dcgm-exporter",
        {
          type: "category",
          label: "ECK",
          items: [
            "nn/mlops/monitoring/eck/basics",
            "nn/mlops/monitoring/eck/fluentd",
          ],
        },
        {
          type: "category",
          label: "OpenSearch",
          items: ["nn/mlops/monitoring/opensearch/basics"],
        },
      ],
    },
    {
      type: "category",
      label: "Auth",
      items: [
        "nn/mlops/auth/kubeconfig",
        "nn/mlops/auth/rbac",
        "nn/mlops/auth/x509",
        "nn/mlops/auth/keycloak",
        "nn/mlops/auth/oauth2-proxy",
      ],
    },
    {
      type: "category",
      label: "CI/CD",
      items: [
        "nn/mlops/cicd/harbor",
        "nn/mlops/cicd/argo-cd",
        "nn/mlops/cicd/argo-cd-crd",
        "nn/mlops/cicd/argo-workflows",
        "nn/mlops/cicd/argo-workflows-crd",
        "nn/mlops/cicd/argo-events",
      ],
    },
    "nn/mlops/mlops-kubeflow",
    {
      type: "category",
      label: "AWS",
      items: [
        {
          type: "category",
          label: "IAM",
          items: [
            "nn/mlops/aws/iam/basics",
            "nn/mlops/aws/iam/cross-accounts-access",
            "nn/mlops/aws/iam/spot-role",
          ],
        },
        "nn/mlops/aws/vpc",
        {
          type: "category",
          label: "EKS",
          items: [
            "nn/mlops/aws/eks/basics",
            "nn/mlops/aws/eks/eks-rbac",
            "nn/mlops/aws/eks/keycloak",
          ],
        },
        "nn/mlops/aws/aws-cloud-controller-manager​",
        "nn/mlops/aws/cluster-autoscaler",
        "nn/mlops/aws/parallel-cluster",
        "nn/mlops/aws/ecr",
        "nn/mlops/aws/ses",
      ],
    },
    {
      type: "category",
      label: "Firebase",
      items: ["nn/mlops/firebase/authentication"],
    },
  ],
  nn: [
    "nn/basics/nn-basics",
    "nn/basics/nn-cpu-gpu-npu",
    "nn/basics/nn-derivative",
    {
      type: "category",
      label: "CNN",
      items: ["nn/basics/cnn/nn-cnn-conv2d"],
    },
    {
      type: "category",
      label: "RNN",
      items: ["nn/basics/rnn/nn-rnn"],
    },
  ],
  javascript: [
    {
      type: "category",
      label: "ENV",
      items: ["lang/javascript/env/nvm"],
    },
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
      label: "emscripten",
      items: ["lang/javascript/emscripten/basics"],
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
      ],
    },
    "lang/python/exception",
    "lang/python/logging",
    "lang/python/pytest",
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
          label: "Django Rest Framework",
          items: ["lang/python/libraries/django-rest-framework/basics"],
        },
      ],
    },
    {
      type: "category",
      label: "Package",
      items: [
        {
          type: "category",
          label: "Pybind11",
          items: [
            "lang/python/package/pybind11/pybind11",
            "lang/python/package/pybind11/type",
          ],
        },
        "lang/python/package/conda",
        "lang/python/package/python-package-sphinx",
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
  stm32: [
    "mcu/stm32/stm32-create-project-stm32cubeide",
    "mcu/stm32/stm32-call-c++-on-c",
    "mcu/stm32/stm32-upload-executable-file-stm32cubeide",
    "mcu/stm32/stm32-printf-usage-stm32cubeide",
    "mcu/stm32/stm32-spi",
    "mcu/stm32/stm32-low-power-modes",
  ],
};
