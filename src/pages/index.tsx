import BrowserOnly from "@docusaurus/BrowserOnly";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React from "react";
import styled from "styled-components";
import RadialTree from "../component/RadialTree";

function Home() {
	const context = useDocusaurusContext();
	const { siteConfig } = context;

	return (
		<Layout
			title={`Hello from ${siteConfig?.title}`}
			description="Description will go into a meta tag in <head />"
		>
			<main>
				<BrowserOnly>
					{() => (
						<Container>
							<RadialTree />
						</Container>
					)}
				</BrowserOnly>
			</main>
		</Layout>
	);
}

export default Home;

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	background-color: white;
`;
