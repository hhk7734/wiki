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
					<div className={styles.intro}>
						<p className={styles.kicker}>Knowledge Atlas</p>
						<h1 className={styles.title}>Explore the wiki through its ontology graph.</h1>
						<p className={styles.subtitle}>
							The homepage now clusters entities, concepts, operations, and specifications into one interactive 3D map.
						</p>
					</div>
					<BrowserOnly>{() => <OntologyGraph3D />}</BrowserOnly>
				</div>
			</main>
		</Layout>
	);
}

export default Home;
