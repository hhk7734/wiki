import React, { useEffect, useRef, useState } from "react";

export default function DrawIOViewer({ src }: { src: string }) {
	const [tip, setTip] = useState("loading...");
	const el = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const GraphViewer = (window as any).GraphViewer;
		if (!GraphViewer) {
			setTip("GraphViewer is not loaded");
			return;
		}

		fetch(src)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch drawio file");
				return res.text();
			})
			.then((content) => {
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

				el.current!.dataset.mxgraph = JSON.stringify(data);
				setTip("");

				setTimeout(() => {
					GraphViewer.createViewerForElement(el.current!);
				}, 0);
			})
			.catch((err) => {
				setTip("Failed to load diagram: " + err.message);
			});
	}, [src]);

	return (
		<div className="w-full p-4">
			{tip && <p>{tip}</p>}
			<div className="w-full bg-white" ref={el} />
		</div>
	);
}
