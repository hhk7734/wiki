import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import { buildWikiResultGroups } from "@site/src/components/wikiSearch/resultGroups.mjs";
import { searchWikiIndex } from "@site/src/components/wikiSearch/searchEngine.mjs";
import styles from "./styles.module.css";

type SearchRecord = {
	id: string;
	url: string;
	title: string;
	description: string;
	snippet: string;
	keywords: string[];
	headings: string[];
	ontology: {
		role?: string;
		domain: string;
		class: string;
		instance: string;
		aspect?: string;
	};
	search_text: string;
	display: {
		label: string;
		kind: "subject" | "document";
		subtitle?: string;
		document_count?: number;
	};
	subject_title?: string;
	document_refs?: string[];
};

export default function SearchBar(): React.ReactNode {
	const indexUrl = useBaseUrl("/wiki-search-index.json");
	const rootRef = useRef<HTMLDivElement | null>(null);
	const [query, setQuery] = useState("");
	const [records, setRecords] = useState<{ subjects: SearchRecord[]; documents: SearchRecord[] } | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		function handleOutsideClick(event: MouseEvent) {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, []);

	async function ensureLoaded() {
		if (records || loading) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const response = await fetch(indexUrl);
			if (!response.ok) {
				throw new Error(`Failed to load search index: ${response.status}`);
			}

			const json = (await response.json()) as { subjects: SearchRecord[]; documents: SearchRecord[] };
			setRecords(json);
		} catch (nextError) {
			setError(nextError instanceof Error ? nextError.message : "Failed to load search index");
		} finally {
			setLoading(false);
		}
	}

	const results = useMemo(() => {
		if (!records) {
			return { subjects: [], documents: [] };
		}

		return searchWikiIndex(query, records);
	}, [query, records]);
	const resultGroups = useMemo(() => buildWikiResultGroups(results), [results]);

	function renderResult(result: SearchRecord & { score?: number }, kind: "subject" | "document") {
		const subtitle = kind === "subject" ? result.display.subtitle ?? result.ontology.class : result.subject_title ?? result.display.subtitle ?? result.ontology.class;
		const metadata = [
			result.ontology.domain,
			result.ontology.class,
			kind === "document" && result.ontology.aspect ? result.ontology.aspect : null,
		].filter(Boolean);
		const snippet = result.snippet || result.description;

		return (
			<Link key={result.id} to={result.url} className={styles.resultItem} onClick={() => setOpen(false)}>
				<div className={styles.resultHeader}>
					<div className={styles.resultTitleBlock}>
						<strong className={styles.resultTitle}>{result.title}</strong>
						<div className={styles.resultSubtitle}>{subtitle}</div>
					</div>
					<span className={clsx(styles.resultBadge, kind === "subject" ? styles.subjectBadge : styles.documentBadge)}>
						{kind === "subject" ? `${result.display.document_count ?? 0} docs` : result.ontology.role ?? "document"}
					</span>
				</div>
				{snippet ? <div className={styles.resultDescription}>{snippet}</div> : null}
				<div className={styles.resultMeta}>{metadata.join(" · ")}</div>
			</Link>
		);
	}

	return (
		<div ref={rootRef} className={styles.searchRoot}>
			<input
				type="search"
				className={clsx("navbar__search-input", styles.searchInput)}
				placeholder="Search wiki"
				value={query}
				onFocus={() => {
					setOpen(true);
					void ensureLoaded();
				}}
				onChange={(event) => {
					setQuery(event.target.value);
					setOpen(true);
				}}
			/>
			{open ? (
				<div className={styles.searchPanel}>
					{loading ? <div className={styles.searchState}>Loading wiki index...</div> : null}
					{error ? <div className={styles.searchState}>{error}</div> : null}
					{!loading && !error && query.trim() === "" ? (
						<div className={styles.searchState}>Type a natural-language query like `ceph osd 관리 방법`.</div>
					) : null}
					{!loading && !error && query.trim() !== "" && results.subjects.length === 0 && results.documents.length === 0 ? (
						<div className={styles.searchState}>No matching wiki pages</div>
					) : null}
					{resultGroups.map((group) => (
						<section key={group.key} className={styles.resultGroup}>
							<div className={styles.groupHeader}>{group.title}</div>
							{group.items.map((result) => renderResult(result, group.kind))}
						</section>
					))}
				</div>
			) : null}
		</div>
	);
}
