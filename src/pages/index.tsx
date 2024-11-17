import BrowserOnly from "@docusaurus/BrowserOnly";
import Layout from "@theme/Layout";
import React from "react";
import styled from "styled-components";
import RadialTree from "@site/src/components/RadialTree";

function Home() {
	return (
		<Layout>
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
