import Link from "@docusaurus/Link";
import React from "react";

import type { OntologyPreviewPanelProps } from "./ontologyGraph.types";
import styles from "./ontologyGraph.module.css";

function toTopicLabel(topic?: string): string {
	if (!topic) {
		return "Node";
	}

	return topic.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toTypeLabel(type: OntologyPreviewPanelProps["selectedNode"] extends infer T
	? T extends { type: infer U }
		? U
		: never
	: never): string {
	return String(type).replace(/[-_]+/g, " ");
}

export default function OntologyPreviewPanel({ selectedNode, onClose }: OntologyPreviewPanelProps) {
	if (!selectedNode) {
		return null;
	}

	const isDocNode = selectedNode.type === "doc" && typeof selectedNode.href === "string";

	return (
		<aside className={styles.panel} aria-label="Topic node preview">
			<div className={styles.header}>
				<div>
					<span className={styles.eyebrow}>{toTopicLabel(selectedNode.topic)}</span>
					<h2 className={styles.title}>{selectedNode.label}</h2>
				</div>
				<button className={styles.closeButton} type="button" onClick={onClose} aria-label="Close preview">
					Close
				</button>
			</div>

			<p className={styles.description}>
				{selectedNode.description ??
					(isDocNode
						? "Open this document to inspect the full wiki entry."
						: "This structural node groups related documents in the homepage map.")}
			</p>

			<div className={styles.metaList}>
				<div className={styles.metaRow}>
					<p className={styles.metaLabel}>Type</p>
					<p className={styles.metaValue}>{toTypeLabel(selectedNode.type)}</p>
				</div>
				<div className={styles.metaRow}>
					<p className={styles.metaLabel}>Children</p>
					<p className={styles.metaValue}>{selectedNode.childCount}</p>
				</div>
				{selectedNode.docId ? (
					<div className={styles.metaRow}>
						<p className={styles.metaLabel}>Doc ID</p>
						<p className={styles.metaValue}>{selectedNode.docId}</p>
					</div>
				) : null}
				{selectedNode.href ? (
					<div className={styles.metaRow}>
						<p className={styles.metaLabel}>Path</p>
						<p className={styles.metaValue}>{selectedNode.href}</p>
					</div>
				) : null}
			</div>

			<div className={styles.actions}>
				{isDocNode ? (
					<Link className={styles.actionLink} to={selectedNode.href}>
						Open document
					</Link>
				) : (
					<p className={styles.hint}>Select a document node to navigate into the wiki.</p>
				)}
			</div>
		</aside>
	);
}
