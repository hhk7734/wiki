import React, { useEffect, useRef, useState } from "react";

const DRAWIO_VIEWER_SRC = "https://www.draw.io/js/viewer.min.js";

type DrawIOGraphViewer = {
	createViewerForElement: (element: HTMLElement) => void;
};

declare global {
	interface Window {
		GraphViewer?: DrawIOGraphViewer;
	}
}

let drawIOViewerPromise: Promise<DrawIOGraphViewer> | undefined;

function loadDrawIOViewer(): Promise<DrawIOGraphViewer> {
	if (typeof window === "undefined") {
		return Promise.reject(new Error("GraphViewer is only available in browser"));
	}

	if (window.GraphViewer) {
		return Promise.resolve(window.GraphViewer);
	}

	if (drawIOViewerPromise) {
		return drawIOViewerPromise;
	}

	drawIOViewerPromise = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = DRAWIO_VIEWER_SRC;
		script.async = true;

		script.addEventListener(
			"load",
			() => {
				if (window.GraphViewer) {
					resolve(window.GraphViewer);
				} else {
					drawIOViewerPromise = undefined;
					reject(new Error("GraphViewer is not loaded"));
				}
			},
			{ once: true },
		);

		script.addEventListener(
			"error",
			() => {
				drawIOViewerPromise = undefined;
				reject(new Error("Failed to load GraphViewer"));
			},
			{ once: true },
		);

		document.head.appendChild(script);
	});

	return drawIOViewerPromise;
}

export default function DrawIOViewer({ src }: { src: string }) {
	const [tip, setTip] = useState("loading...");
	const el = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;

		let cancelled = false;
		let frame = 0;
		const element = el.current;

		if (!element) return;

		setTip("loading...");
		element.replaceChildren();
		delete element.dataset.mxgraph;

		Promise.all([
			loadDrawIOViewer(),
			fetch(src).then((res) => {
				if (!res.ok) throw new Error("Failed to fetch drawio file");
				return res.text();
			}),
		])
			.then(([GraphViewer, content]) => {
				if (cancelled) return;

				if (!content) {
					setTip("Drawio file is empty");
					return;
				}

				const data = {
					editable: "_blank",
					highlight: "#0000ff",
					nav: true,
					resize: true,
					toolbar: "zoom lightbox",
					xml: content,
				};

				element.dataset.mxgraph = JSON.stringify(data);
				setTip("");

				frame = window.requestAnimationFrame(() => {
					if (!cancelled && element.isConnected && element.childElementCount === 0) {
						GraphViewer.createViewerForElement(element);
					}
				});
			})
			.catch((err) => {
				if (cancelled) return;
				setTip("Failed to load diagram: " + err.message);
			});

		return () => {
			cancelled = true;
			if (frame) window.cancelAnimationFrame(frame);
			element.replaceChildren();
			delete element.dataset.mxgraph;
		};
	}, [src]);

	return (
		<div className="w-full p-4">
			{tip && <p>{tip}</p>}
			<div className="w-full bg-white" ref={el} />
		</div>
	);
}
