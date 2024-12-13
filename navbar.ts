import type { NavbarItem } from "@docusaurus/theme-common";

export const navbar = {
    Programming: {
        Design: "design",
        "C++": "cpp",
        Go: "go",
        Rust: "rust",
        Python: "python",
        Database: "db",
        JavaScript: "javascript",
        Flutter: "flutter",
        ShellScript: "shellscript",
        LabVIEW: "labview",
        Etc: "programmingetc",
    },
    MLOps: {
        MLOps: "mlops",
        Monitoring: "monitoring",
        NueralNetwork: "nn",
    },
    Linux: {
        Package: "linux-package",
        Kernel: "linux-kernel",
        "u-boot": "linux-uboot",
        ShellScript: "shellscript",
        Etc: "programmingetc",
    },
    MCU: {
        STM32: "stm32",
        AVR: "avr",
        Arduino: "arduino",
        Espressif: "espressif",
        SAM: "sam",
        Infineon: "infineon",
        Nordic: "nordic",
    },
    Etc: {
        BioChemistry: "biochemistry",
        Circuit: "circuit",
        Memo: "memo",
        Project: "project",
    },
};

export const navbarItems: NavbarItem[] = Object.entries(navbar).map(([key, categories]) => {
    return {
        type: "dropdown",
        label: key,
        position: "left",
        items: Object.entries(categories).map(([label, to]) => {
            return {
                type: "docSidebar",
                label: label,
                sidebarId: to,
            };
        }),
    };
});
