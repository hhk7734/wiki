import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from "@theme/Layout";
import React from "react";
import RadialTree from "@site/src/components/RadialTree";

function Home() {
	return (
		<Layout>
			<main>
				<BrowserOnly>{() => <RadialTree />}</BrowserOnly>
			</main>
		</Layout>
	);
}

export default Home;
