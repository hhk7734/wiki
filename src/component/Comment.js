import React, { useEffect, useRef } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const utterancesSelector = 'iframe.utterances-frame';

function Comment() {
	const { colorMode, setColorMode } = useColorMode();
	const utterancesTheme = colorMode === 'dark' ? 'github-dark' : 'github-light';
	const containerRef = useRef(null);

	useEffect(() => {
		const utterancesEl = containerRef.current.querySelector(utterancesSelector);

		const createUtterancesEl = () => {
			const script = document.createElement('script');

			script.src = 'https://utteranc.es/client.js';
			script.setAttribute('repo', 'hhk7734/wiki.loliot.net');
			script.setAttribute('issue-term', 'pathname');
			script.setAttribute('label', '💬💬');
			script.setAttribute('theme', utterancesTheme);
			script.crossOrigin = 'anonymous';
			script.async = true;

			containerRef.current.appendChild(script);
		};

		const postThemeMessage = () => {
			const message = {
				type: 'set-theme',
				theme: utterancesTheme
			};

			utterancesEl.contentWindow.postMessage(message, 'https://utteranc.es');
		};

		utterancesEl ? postThemeMessage() : createUtterancesEl();
	}, [utterancesTheme]);

	return <div ref={containerRef} />;
}

export default Comment;
