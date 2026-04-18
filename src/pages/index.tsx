import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from "@theme/Layout";
import React from "react";

import OntologyGraph3D from "@site/src/components/OntologyGraph3D";

import styles from "./styles.module.css";

function Home() {
	return (
		<Layout title="Ontology Map" description="3D ontology map for the wiki knowledge graph.">
			<main className={styles.main}>
				<div className={styles.graphFrame}>
					<BrowserOnly>{() => <OntologyGraph3D />}</BrowserOnly>
				</div>
			</main>
		</Layout>
	);
}

export default Home;
