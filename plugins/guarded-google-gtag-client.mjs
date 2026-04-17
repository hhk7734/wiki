const guardedGtagClient = {
	onRouteDidUpdate({ location, previousLocation }) {
		if (
			!previousLocation ||
			(location.pathname === previousLocation.pathname &&
				location.search === previousLocation.search &&
				location.hash === previousLocation.hash)
		) {
			return;
		}

		setTimeout(() => {
			if (typeof window.gtag !== "function") {
				return;
			}

			window.gtag("set", "page_path", location.pathname + location.search + location.hash);
			window.gtag("event", "page_view");
		});
	},
};

export default guardedGtagClient;
