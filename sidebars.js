module.exports = {
  arduino: [
    'mcu/arduino/arduino-platform-specification',
    'mcu/arduino/arduino-library-specification',
    'mcu/arduino/arduino-how-to-use-library',
  ],
  avr: [
    'mcu/avr/avr-build-project-in-terminal',
    'mcu/avr/avr-upload-executable-file-in-terminal',
    'mcu/avr/avr-upload-executable-file-in-atmel-studio-7',
    'mcu/avr/avr-lock-and-fuse-bits',
    'mcu/avr/avr-printf',
    'mcu/avr/avr-eeprom',
    'mcu/avr/avr-i2c',
  ],
  basics: [
    'nn/basics/nn-basics',
    'nn/basics/nn-cpu-gpu-npu',
    'nn/basics/nn-derivative',
    {
      type: 'category',
      label: 'CNN',
      items: ['nn/basics/cnn/nn-cnn-conv2d'],
    },
    {
      type: 'category',
      label: 'RNN',
      items: ['nn/basics/rnn/nn-rnn'],
    },
  ],
  biochemistry: ['etc/biochemistry/biochemistry-receptor-ligand'],
  circuit: [
    {
      type: 'category',
      label: 'Basics',
      items: ['etc/circuit/basics/circuit-capacitor'],
    },
    {
      type: 'category',
      label: 'Sensor',
      items: ['etc/circuit/sensor/sensor-fine-dust'],
    },
    {
      type: 'category',
      label: 'KiCad',
      items: ['etc/circuit/kicad/kicad-basics'],
    },
  ],
  'debian-package': [
    'linux/debian-package/debian-package-basics',
    'linux/debian-package/debian-package-makefile',
    'linux/debian-package/debian-package-advanced',
    'linux/debian-package/debian-launchpad-ppa',
  ],
  cpp: [
    {
      type: 'category',
      label: 'Build',
      items: [
        {
          type: 'category',
          label: 'Makefile',
          items: [
            'lang/cpp/build/makefile/makefile-basics',
            'lang/cpp/build/makefile/makefile-avr-example',
          ],
        },
        'lang/cpp/build/cpp-cmake',
      ],
    },
    {
      type: 'category',
      label: 'Libraries',
      items: [
        'lang/cpp/libraries/cpp-stl',
        'lang/cpp/libraries/cpp-exception-handling',
        {
          type: 'category',
          label: 'OpenCL',
          items: [
            'lang/cpp/libraries/opencl/opencl-basics',
            'lang/cpp/libraries/opencl/opencl-with-mali-gpu',
            'lang/cpp/libraries/opencl/opencl-example',
          ],
        },
        {
          type: 'category',
          label: 'OpenCV',
          items: ['lang/cpp/libraries/opencv/opencv-installation'],
        },
        {
          type: 'category',
          label: 'Eigen',
          items: ['lang/cpp/libraries/Eigen/eigen-basics'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Advanced C++',
      items: [
        'lang/cpp/advanced-cpp/cpp-constexpr',
        {
          type: 'category',
          label: 'LLVM',
          items: [
            'lang/cpp/advanced-cpp/llvm/llvm-basics',
            'lang/cpp/advanced-cpp/llvm/llvm-build-from-source',
            'lang/cpp/advanced-cpp/llvm/llvm-cross-compile',
          ],
        },
      ],
    },
  ],
  espressif: ['mcu/espressif/esp8266-esp-01-module'],
  flutter: [
    {
      type: 'category',
      label: 'Engine',
      items: [
        'lang/flutter/engine/flutter-engine-for-linux-arm64',
        'lang/flutter/engine/flutter-app-for-linux-arm64',
      ],
    },
    {
      type: 'category',
      label: 'Bloc',
      items: [
        'lang/flutter/bloc/flutter-bloc-widgets',
        'lang/flutter/bloc/flutter-bloc-event-state',
        'lang/flutter/bloc/flutter-bloc-observer',
      ],
    },
    {
      type: 'category',
      label: 'Package',
      items: ['lang/flutter/package/flutter-package-linux-methodchannel'],
    },
  ],
  infineon: [
    'mcu/infineon/tricore-development-environment',
    'mcu/infineon/tricore-upload-executable-file-in-udevisualplatform',
    'mcu/infineon/tricore-shieldbuddy-tc275',
    'mcu/infineon/tricore-tc27d-ports',
    'mcu/infineon/tricore-tc27d-stm',
    'mcu/infineon/tricore-tc27d-bsp',
    'mcu/infineon/tricore-tc27d-asc',
    'mcu/infineon/tricore-tc27d-terminal',
    'mcu/infineon/tricore-tc27d-vadc',
  ],
  labview: [
    'lang/labview/labview-creating-project-and-vi',
    'lang/labview/labview-basic-terms',
    'lang/labview/labview-shortcut',
    'lang/labview/labview-basic-arithmetic',
    'lang/labview/labview-for-loop',
    'lang/labview/labview-while-loop',
    'lang/labview/labview-case-structure',
  ],
  'linux-kernel': [
    'linux/linux-kernel/build-linux-kernel',
    'linux/linux-kernel/linux-kernel-ftrace',
    'linux/linux-kernel/build-external-linux-module',
    'linux/linux-kernel/linux-kernel-how-to-contribute',
    'linux/linux-kernel/linux-kernel-tty0uart',
    {
      type: 'category',
      label: 'Device tree',
      items: [
        'linux/linux-kernel/device-tree/device-tree-basics',
        'linux/linux-kernel/device-tree/device-tree-overlay',
      ],
    },
  ],
  'linux-tools': [
    {
      type: 'category',
      label: 'Vim',
      items: [
        'linux/linux-tools/vim/vim-basics',
        'linux/linux-tools/vim/regex-for-vim',
      ],
    },
    {
      type: 'category',
      label: 'Git',
      items: [
        'linux/linux-tools/git/git-basics',
        'linux/linux-tools/git/git-commit-message',
        'linux/linux-tools/git/git-fork-pull-request',
        'linux/linux-tools/git/git-submodule',
        'linux/linux-tools/git/git-tag',
        'linux/linux-tools/git/git-create-apply-patch',
        'linux/linux-tools/git/git-github-issue',
      ],
    },
    {
      type: 'category',
      label: 'Shell script',
      items: [
        'linux/linux-tools/shell-script/shell-script-basics',
        'linux/linux-tools/shell-script/shell-script-text-color',
        'linux/linux-tools/shell-script/shell-script-getopt',
      ],
    },
    'linux/linux-tools/linux-ssh-scp',
    'linux/linux-tools/linux-udev',
    'linux/linux-tools/linux-clone-os-image',
    'linux/linux-tools/linux-tools-etc',
  ],
  'linux-uboot': [
    'linux/linux-uboot/embedded-linux-boot-process',
    'linux/linux-uboot/build-uboot',
    'linux/linux-uboot/uboot-custom-command',
    'linux/linux-uboot/uboot-configuration',
  ],
  memo: ['etc/memo/semantic-versioning-2-0-0', 'etc/memo/ssl-lets-encrypt'],
  mlops: [
    'nn/mlops/mlops-ansible',
    'nn/mlops/mlops-cri-docker',
    'nn/mlops/mlops-kubeadm',
    'nn/mlops/mlops-cni-calico',
    {
      type: 'category',
      label: 'Kubernetes',
      items: [
        'nn/mlops/kubernetes/mlops-k8s-dashboard',
        'nn/mlops/kubernetes/mlops-k8s-service',
        'nn/mlops/kubernetes/mlops-k8s-persistent-volume',
      ],
    },
    'nn/mlops/mlops-cert-manager',
    'nn/mlops/mlops-kubeflow',
    'nn/mlops/mlops-kustomize',
    'nn/mlops/mlops-istio',
    'nn/mlops/mlops-knative',
    {
      type: 'category',
      label: 'DB',
      items: [
        'nn/mlops/db/dynamodb',
        'nn/mlops/db/mongodb',
        'nn/mlops/db/influxdb',
        'nn/mlops/db/postgresql',
      ],
    },
  ],
  nodejs: [
    {
      type: 'category',
      label: 'Package',
      items: [
        {
          type: 'category',
          label: 'Node-addon-API',
          items: [
            'lang/nodejs/package/node-addon-api/nodejs-package-using-node-addon-api',
            'lang/nodejs/package/node-addon-api/nodejs-package-class-using-node-addon-api',
          ],
        },
      ],
    },
  ],
  nordic: ['mcu/nordic/nrf-development-environment'],
  project: [
    {
      type: 'category',
      label: 'AHRS',
      items: [
        'etc/project/ahrs/ahrs-quaternions-rotations',
        'etc/project/ahrs/ahrs-euler-angles',
        'etc/project/ahrs/ahrs-extended-kalman-filter',
        'etc/project/ahrs/ahrs-sensor-calibration',
      ],
    },
  ],
  python: [
    {
      type: 'category',
      label: 'Libraries',
      items: [
        {
          type: 'category',
          label: 'ctypes',
          items: [
            'lang/python/libraries/ctypes/python-ctypes-convert-bytes-structure',
          ],
        },
        {
          type: 'category',
          label: 'gpiod',
          items: ['lang/python/libraries/gpiod/python-gpiod-about'],
        },
        'lang/python/libraries/python-logging',
        {
          type: 'category',
          label: 'OpenCV',
          items: [
            'lang/cpp/libraries/opencv/opencv-installation',
            'lang/python/libraries/opencv/opencv-read-image-video',
            'lang/python/libraries/opencv/opencv-draw-figure',
            'lang/python/libraries/opencv/opencv-color-spaces',
            'lang/python/libraries/opencv/opencv-histogram',
          ],
        },
        'lang/python/libraries/python-pybluez',
        {
          type: 'category',
          label: 'PySide2',
          items: [
            'lang/python/libraries/pyside2/pyside2-installation',
            'lang/python/libraries/pyside2/pyside2-convert-ui-to-python',
            'lang/python/libraries/pyside2/pyside2-signal-and-slot',
            'lang/python/libraries/pyside2/pyside2-qtimer',
            'lang/python/libraries/pyside2/pyside2-qthread',
            'lang/python/libraries/pyside2/pyside2-qrunnable-and-qthreadpool',
            'lang/python/libraries/pyside2/pyside2-custom-qdialog',
          ],
        },
        'lang/python/libraries/python-socket',
        'lang/python/libraries/python-tkinter',
        {
          type: 'category',
          label: 'yolov4',
          items: [
            'lang/python/libraries/yolov4/python-yolov4-about',
            'lang/python/libraries/yolov4/python-yolov4-dataset',
            'lang/python/libraries/yolov4/python-yolov4-training',
            'lang/python/libraries/yolov4/python-yolov4-map',
            'lang/python/libraries/yolov4/python-yolov4-edge-tpu',
            {
              type: 'category',
              label: 'Model',
              items: [
                'lang/python/libraries/yolov4/model/python-yolov4-model-backbone',
                'lang/python/libraries/yolov4/model/python-yolov4-model-neck',
                'lang/python/libraries/yolov4/model/python-yolov4-model-loss',
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Package',
      items: [
        {
          type: 'category',
          label: 'Pybind11',
          items: [
            'lang/python/package/pybind11/python-package-pybind11',
            'lang/python/package/pybind11/python-package-pybind11-type',
          ],
        },
        'lang/python/package/python-package-sphinx',
      ],
    },
  ],
  sam: [
    'mcu/sam/sam-development-environment',
    'mcu/sam/sam-sam4s2a-fcpu',
    'mcu/sam/sam-sam4s2a-usart',
    'mcu/sam/sam-sam4s2a-stdio',
    'mcu/sam/sam-sam4s2a-time',
    'mcu/sam/sam-sam4s2a-ioport',
    'mcu/sam/sam-sam4s2a-adc',
  ],
  stm32: [
    'mcu/stm32/stm32-create-project-stm32cubeide',
    'mcu/stm32/stm32-call-c++-on-c',
    'mcu/stm32/stm32-upload-executable-file-stm32cubeide',
    'mcu/stm32/stm32-printf-usage-stm32cubeide',
    'mcu/stm32/stm32-spi',
    'mcu/stm32/stm32-low-power-modes',
  ],
};
