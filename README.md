# wiki.loliot.net

## 설치

```shell
yarn install
```

```shell
yarn start
```

## Redirect

Cloudflare

- /docs/mlops/mlops/monitoring/* -> /docs/mlops/monitoring/${1}

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

## swizzle

```shell
yarn swizzle --list
```

```shell
yarn swizzle @docusaurus/theme-classic DocItem/Content --wrap
```
