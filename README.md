# wiki.loliot.net

## 설치

```shell
mise install
```

```shell
npm install
```

```shell
npm run start
```

## Tab


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

## Admonitions(경고)

```md
:::note
회색
:::


:::tip
초록색
:::


:::info
파란색
:::


:::warning
노란색
:::


:::danger
빨간색
:::


:::::info[Parent]

::::danger[Child]

:::tip[Deep Child]

:::

::::

:::::
```

## Draw.io

```tsx
import useBaseUrl from "@docusaurus/useBaseUrl";
import DrwaIOViewer from "@site/src/components/DrawIOViewer";

<center>
	<figure>
		<DrwaIOViewer src={useBaseUrl("img/<path>/example.drawio")} />
		<figcaption>Example</figcaption>
	</figure>
</center>
```

## Mermaid

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

## swizzle

```shell
npm run swizzle --list
```

```shell
npm run swizzle @docusaurus/theme-classic DocItem/Content --wrap
```
