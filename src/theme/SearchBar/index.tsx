import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import { searchGraphifyIndex } from "@site/src/components/graphifySearch/searchEngine.mjs";
import styles from "./styles.module.css";

type SearchRecord = {
	id: string;
	url: string;
	title: string;
	description: string;
	keywords: string[];
	headings: string[];
	ontology: {
		role: string;
		domain: string;
		class: string;
		instance: string;
		aspect: string;
	};
	search_text: string;
	terms: string[];
};

export default function SearchBar(): React.ReactNode {
	const indexUrl = useBaseUrl("/graphify-search-index.json");
	const rootRef = useRef<HTMLDivElement | null>(null);
	const [query, setQuery] = useState("");
	const [records, setRecords] = useState<SearchRecord[] | null>(null);
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

			const json = (await response.json()) as SearchRecord[];
			setRecords(json);
		} catch (nextError) {
			setError(nextError instanceof Error ? nextError.message : "Failed to load search index");
		} finally {
			setLoading(false);
		}
	}

	const results = useMemo(() => {
		if (!records) {
			return [];
		}

		return searchGraphifyIndex(query, records);
	}, [query, records]);

	return (
		<div ref={rootRef} className={styles.searchRoot}>
			<input
				type="search"
				className={clsx("navbar__search-input", styles.searchInput)}
				placeholder="Search docs"
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
					{loading ? <div className={styles.searchState}>Loading graphify index...</div> : null}
					{error ? <div className={styles.searchState}>{error}</div> : null}
					{!loading && !error && query.trim() === "" ? (
						<div className={styles.searchState}>Type a natural-language query like `ceph osd 관리 방법`.</div>
					) : null}
					{!loading && !error && query.trim() !== "" && results.length === 0 ? (
						<div className={styles.searchState}>No matching documents</div>
					) : null}
					{results.map((result) => (
						<Link key={result.id} to={result.url} className={styles.resultItem} onClick={() => setOpen(false)}>
							<div className={styles.resultHeader}>
								<strong>{result.title}</strong>
								<span className={styles.resultBadge}>
									{result.ontology.role} / {result.ontology.instance}
								</span>
							</div>
							{result.description ? <div className={styles.resultDescription}>{result.description}</div> : null}
							<div className={styles.resultMeta}>
								{result.ontology.class} · {result.ontology.aspect}
							</div>
						</Link>
					))}
				</div>
			) : null}
		</div>
	);
}
