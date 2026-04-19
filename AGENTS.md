# wiki.loliot.net - Agent Guidelines

## Repository Layout

- `README.md`: Main README file for the repository. (contains docusaurus MDX features)
- `src/`: Custom components for Docusaurus.
- `static/`: Static files such as images, draw.io diagrams, etc.
- `docs/`: Taxonomy-first documentation tree.
- `docs/AGENTS.md`: Canonical authoring and classification rules for `docs/`.

## Documentation guidelines

For files under `docs/`, follow `docs/AGENTS.md` as the canonical source for:

- taxonomy path model
- semantic frontmatter alignment
- role, domain, and class classification
- validation and link rewrite expectations
- canonical topic/subject path expectations
- `source-path` fallback avoidance

### Metadata

Metadata is located at the top of each MDX file.

```mdx
---
id: <id>
title: <title>
sidebar_label: <sidebarLabel>
description: <description>
keywords:
  - <keyword1>
---
```

- `<id>` must be same as the file name without extension.
- Add any ontology metadata required by `docs/AGENTS.md`.

### Reference block

```mdx
:::info[References]

- [<referenceTitle>](<referenceLink>)

:::
```

- Links to other documentation pages must start with `/docs/` and end with `.mdx`. You may include anchors (`#<anchor>`) if needed.

### Contents

- Use English for the main content of the documentation (`docs/**/*.mdx`).
- Use English for code snippets, commands, and configuration files.
- Use mermaid diagrams for flowcharts, architecture diagrams etc.
- Refer to the contents of the Reference block to improve the quality of the documentation.
- After adding, moving, or splitting docs under `docs/`, rerun `npm run ontology:bootstrap`, `npm run ontology:validate`, and `npm run build`.

## docusaurus MDX Features

### Tab

:::info[References]

- [Docusaurus / Docs / Guides / Markdown Features / Tabs](https://docusaurus.io/docs/markdown-features/tabs)

:::

````mdx
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

<Tabs
    groupId="os"
    defaultValue="arch"
    values={[
        {label: 'Arch Linux', value: 'arch',},
        {label: 'Debian', value: 'debian',}
    ]}
>

<TabItem value="arch">

```shell

```

</TabItem>

<TabItem value="debian">

```shell

```

</TabItem>

</Tabs>
````

### Admonitions

:::info[References]

- [Docusaurus / Docs / Guides / Markdown Features / Admonitions](https://docusaurus.io/docs/markdown-features/admonitions)

:::

```md
:::note
Gray
:::

:::tip
Green
:::

:::info
Blue
:::

:::warning
Yellow
:::

:::danger
Red
:::

:::::info[Parent]

::::danger[Child]

:::tip[Deep Child]

:::

::::

:::::
```

### Draw.io

:::info[References]

- [./src/components/DrawIOViewer.tsx](./src/components/DrawIOViewer.tsx)

:::

```tsx
import useBaseUrl from "@docusaurus/useBaseUrl";
import DrwaIOViewer from "@site/src/components/DrawIOViewer";

<center>
	<figure>
		<DrwaIOViewer src={useBaseUrl("img/<path>/example.drawio")} />
		<figcaption>Example</figcaption>
	</figure>
</center>;
```

### Mermaid

:::info[References]

- [Docusaurus / Docs / Guides / Markdown Features / Diagrams](https://docusaurus.io/docs/markdown-features/diagrams)

:::

````md
```mermaid
flowchart TD
  A[Start] --> B{Is it?}
  B -- Yes --> C[OK]
  C --> D[Rethink]
  D --> B
  B -- No ----> E[End]
```
````

```mermaid
flowchart TD
  A[Start] --> B{Is it?}
  B -- Yes --> C[OK]
  C --> D[Rethink]
  D --> B
  B -- No ----> E[End]
```

````md
```mermaid
---
config:
  layout: elk
---
flowchart TD
  A[Start] --> B{Is it?}
  B -- Yes --> C[OK]
  C --> D[Rethink]
  D --> B
  B -- No ----> E[End]
```
````

```mermaid
---
config:
  layout: elk
---
flowchart TD
  A[Start] --> B{Is it?}
  B -- Yes --> C[OK]
  C --> D[Rethink]
  D --> B
  B -- No ----> E[End]
```
