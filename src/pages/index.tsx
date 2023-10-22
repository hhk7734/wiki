import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React, { useEffect } from 'react';
import styled from 'styled-components';

function Home() {
	const context = useDocusaurusContext();
	const { siteConfig } = context;
	return (
		<Layout
			title={`Hello from ${siteConfig?.title}`}
			description="Description will go into a meta tag in <head />"
		>
			<main>
				<BrowserOnly>{() => <Tree />}</BrowserOnly>
			</main>
		</Layout>
	);
}

export default Home;

const Tree = () => {
	useEffect(() => {}, []);
	return <Container>{null}</Container>;
};

const Container = styled.div`
	position: relative;
	left: 50%;
	transform: translate(-50%, 0%);
	height: 1000px;
	width: 1000px;
	background-color: white;
`;
