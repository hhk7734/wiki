module.exports = {
  avr: [
    "mcu/avr/avr-build-project-in-terminal",
    "mcu/avr/avr-upload-executable-file-in-terminal",
    "mcu/avr/avr-upload-executable-file-in-atmel-studio-7",
    "mcu/avr/avr-lock-and-fuse-bits",
    "mcu/avr/avr-i2c"
  ],
  cpp: [
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
            "lang/cpp/libraries/opencl/opencl-example"
          ],
        },
        {
          type: "category",
          label: "OpenCV",
          items: [
            "lang/cpp/libraries/opencv/opencv-installation"
          ],
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
          items: ["lang/cpp/advanced-cpp/llvm/llvm-basics"],
        },
      ],
    },
  ],
  flutter: [
    {
      type: "category",
      label: "Engine",
      items: ["lang/flutter/engine/flutter-engine-for-linux-arm64"],
    },
  ],
  infineon: [
    "mcu/infineon/tricore-development-environment",
    "mcu/infineon/tricore-uploading-executable-file-in-udevisualplatform",
  ],
  "linux-tools": [
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
      ],
    },
  ],
  labview: [
    "lang/labview/labview-creating-project-and-vi",
    "lang/labview/labview-basic-terms",
  ],
  nodejs: [
    {
      type: "category",
      label: "Package",
      items: [
        {
          type: "category",
          label: "Node-addon-API",
          items: [
            "lang/nodejs/package/node-addon-api/nodejs-package-using-node-addon-api",
            "lang/nodejs/package/node-addon-api/nodejs-package-class-using-node-addon-api",
          ],
        },
      ],
    },
  ],
  python: [
    {
      type: "category",
      label: "Libraries",
      items: [
        "lang/python/libraries/python-logging",
        {
          type: "category",
          label: "ctypes",
          items: [
            "lang/python/libraries/ctypes/python-ctypes-convert-bytes-structure"
          ],
        },
        {
          type: "category",
          label: "OpenCV",
          items: [
            "lang/cpp/libraries/opencv/opencv-installation",
            "lang/python/libraries/opencv/opencv-read-image-video",
            "lang/python/libraries/opencv/opencv-draw-figure",
            "lang/python/libraries/opencv/opencv-color-spaces",
            "lang/python/libraries/opencv/opencv-histogram"
          ],
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
            "lang/python/package/pybind11/python-package-pybind11",
            "lang/python/package/pybind11/python-package-pybind11-type",
          ],
        },
      ],
    },
  ],
};
