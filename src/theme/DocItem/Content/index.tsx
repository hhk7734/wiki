import React from "react";
import Content from "@theme-original/DocItem/Content";
import type ContentType from "@theme/DocItem/Content";
import type { WrapperProps } from "@docusaurus/types";

import AdSense from "react-adsense";
import Comment from "@site/src/components/Comment";

type Props = WrapperProps<typeof ContentType>;

export default function ContentWrapper(props: Props): JSX.Element {
	return (
		<>
			<div>
				<AdSense.Google
					client="ca-pub-5199357432848758"
					slot="5326538900"
					style={{ display: "block" }}
					format="auto"
					responsive="true"
				/>
			</div>

			<br />

			<Content {...props} />

			<br />

			<div>
				<AdSense.Google
					client="ca-pub-5199357432848758"
					slot="5326538900"
					style={{ display: "block" }}
					format="auto"
					responsive="true"
				/>
			</div>

			<Comment />
		</>
	);
}
