import Link from "@docusaurus/Link";
import React, { useEffect, useState } from "react";

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
	const [nodeDetails, setNodeDetails] = useState<any>(null);

	useEffect(() => {
		let active = true;

		if (!selectedNode?.nodeUrl) {
			setNodeDetails(null);
			return () => {
				active = false;
			};
		}

		void fetch(selectedNode.nodeUrl)
			.then((response) => response.json())
			.then((payload) => {
				if (active) {
					setNodeDetails(payload);
				}
			})
			.catch(() => {
				if (active) {
					setNodeDetails(null);
				}
			});

		return () => {
			active = false;
		};
	}, [selectedNode]);

	if (!selectedNode) {
		return null;
	}

	const isSubjectNode = selectedNode.type === "subject" && typeof selectedNode.href === "string";
	const relatedCount = nodeDetails?.relations?.filter((relation: { predicate?: string }) => relation.predicate !== "about_subject").length ?? 0;
	const documentCount = nodeDetails?.documents?.length ?? nodeDetails?.document_refs?.length ?? 0;

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
					(isSubjectNode
						? "Open the canonical subject page to inspect the full wiki entry."
						: "This structural node groups related subjects in the homepage map.")}
			</p>

			<div className={styles.metaList}>
				<div className={styles.metaRow}>
					<p className={styles.metaLabel}>Type</p>
					<p className={styles.metaValue}>{toTypeLabel(selectedNode.type)}</p>
				</div>
				<div className={styles.metaRow}>
					<p className={styles.metaLabel}>Links</p>
					<p className={styles.metaValue}>{selectedNode.childCount}</p>
				</div>
				{selectedNode.ontology ? (
					<div className={styles.metaRow}>
						<p className={styles.metaLabel}>Ontology</p>
						<p className={styles.metaValue}>
							{selectedNode.ontology.domain}/{selectedNode.ontology.class}/{selectedNode.ontology.instance}
						</p>
					</div>
				) : null}
				{isSubjectNode ? (
					<div className={styles.metaRow}>
						<p className={styles.metaLabel}>Documents</p>
						<p className={styles.metaValue}>{documentCount}</p>
					</div>
				) : null}
				{isSubjectNode ? (
					<div className={styles.metaRow}>
						<p className={styles.metaLabel}>Relations</p>
						<p className={styles.metaValue}>{relatedCount}</p>
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
				{isSubjectNode ? (
					<Link className={styles.actionLink} to={selectedNode.href}>
						Open subject page
					</Link>
				) : (
					<p className={styles.hint}>Select a subject node to inspect semantic relations.</p>
				)}
			</div>
		</aside>
	);
}
