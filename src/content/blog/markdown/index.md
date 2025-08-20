---
title: 'Test: Markdown Syntax Support'
publishDate: 2025-07-26 08:00:00
description: 'Markdown is a lightweight markup language.'
tags:
  - test
  - markdown
heroImage: { src: './thumbnail.jpg', color: '#c8d57fff' }
language: 'English'
slug: m2
---

## Basic Syntax

Markdown is a lightweight and easy-to-use syntax for styling your writing.

### Headers

When the content of the article is extensive, you can use headers to segment:

```markdown
# Header 1

## Header 2

## Large Header

### Small Header
```

Header previews would disrupt the structure of the article, so they are not displayed here.

### Bold and Italics

```markdown
_Italic text_ and **Bold text**, together will be **_Bold Italic text_**
```

Preview:

_Italic text_ and **Bold text**, together will be **_Bold Italic text_**

### Links

```markdown
Text link [Link Name](http://link-url)
```

Preview:

Text link [Link Name](http://link-url)

### Inline Code

```markdown
This is an `inline code`
```

Preview:

This is an `inline code`

### Code Blocks

````markdown
```js
// calculate fibonacci
function fibonacci(n) {
  if (n <= 1) return 1
  const result = fibonacci(n - 1) + fibonacci(n - 2) // [\!code --]
  return fibonacci(n - 1) + fibonacci(n - 2) // [\!code ++]
}
```
````

Preview:

```js
// calculate fibonacci
function fibonacci(n) {
  if (n <= 1) return 1
  const result = fibonacci(n - 1) + fibonacci(n - 2) // [!code --]
  return fibonacci(n - 1) + fibonacci(n - 2) // [!code ++]
}
```

Currently using shiki as the code highlighting plugin. For supported languages, refer to [Shiki: Languages](https://shiki.matsu.io/languages.html).

### Inline Formula

```markdown
This is an inline formula $e^{i\pi} + 1 = 0$
```

Preview:

This is an inline formula $e^{i\pi} + 1 = 0$

### Formula Blocks

```markdown
$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x) e^{-2\pi i x \xi} \, dx
$$
```

Preview:

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x) e^{-2\pi i x \xi} \, dx
$$

Currently using KaTeX as the math formula plugin. For supported syntax, refer to [KaTeX Supported Functions](https://katex.org/docs/supported.html).

#### Images

```markdown
![CWorld](https://cravatar.cn/avatar/1ffe42aa45a6b1444a786b1f32dfa8aa?s=200)
```

Preview:

![CWorld](https://cravatar.cn/avatar/1ffe42aa45a6b1444a786b1f32dfa8aa?s=200)

#### Strikethrough

```markdown
~~Strikethrough~~
```

Preview:

~~Strikethrough~~

### Lists

Regular unordered list

```markdown
- 1
- 2
- 3
```

Preview:

- 1
- 2
- 3

Regular ordered list

```markdown
1. GPT-4
2. Claude Opus
3. LLaMa
```

Preview:

1. GPT-4
2. Claude Opus
3. LLaMa

You can continue to nest syntax within lists.

### Blockquotes

```markdown
> Gunshot, thunder, sword rise. A scene of flowers and blood.
```

Preview:

> Gunshot, thunder, sword rise. A scene of flowers and blood.

You can continue to nest syntax within blockquotes.

### Line Breaks

Markdown needs a blank line to separate paragraphs.

```markdown
If you don't leave a blank line
it will be in one paragraph

First paragraph

Second paragraph
```

Preview:

If you don't leave a blank line
it will be in one paragraph

First paragraph

Second paragraph

### Separators

If you have the habit of writing separators, you can start a new line and enter three dashes `---` or asterisks `***`. Leave a blank line before and after when there are paragraphs:

```markdown
---
```

Preview:

---

## Advanced Techniques

### Inline HTML Elements

Currently, only some inline HTML elements are supported, including `<kdb> <b> <i> <em> <sup> <sub> <br>`, such as

#### Key Display

```markdown
Use <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Del</kbd> to reboot the computer
```

Preview:

Use <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Del</kbd> to reboot the computer

#### Bold Italics

```markdown
<b> Markdown also applies here, such as _bold_ </b>
```

Preview:

<b> Markdown also applies here, such as _bold_ </b>

### Other HTML Writing

#### Foldable Blocks超长的标题中文Foldable Blocks超长的标题中文

```markdown
<details><summary>Click to expand</summary>It is hidden</details>
```

Preview:

<details><summary>Click to expand</summary>It is hidden</details>

### Tables

```markdown
| Header1  | Header2  |
| -------- | -------- |
| Content1 | Content2 |
```

Preview:

| Header1  | Header2  |
| -------- | -------- |
| Content1 | Content2 |

### Footnotes

```markdown
Use [^footnote] to add a footnote at the point of reference.

Then, at the end of the document, add the content of the footnote (it will be rendered at the end of the article by default).

[^footnote]: Here is the content of the footnote
```

Preview:

Use [^footnote] to add a footnote at the point of reference.

Then, at the end of the document, add the content of the footnote (it will be rendered at the end of the article by default).

[^footnote]: Here is the content of the footnote

### To-Do Lists

```markdown
- [ ] Incomplete task
- [x] Completed task
```

Preview:

- [ ] Incomplete task
- [x] Completed task

### Symbol Escaping

If you need to use markdown symbols like \_ # \* in your description but don't want them to be escaped, you can add a backslash before these symbols, such as `\_` `\#` `\*` to avoid it.

```markdown
\_Don't want the text here to be italic\_

\*\*Don't want the text here to be bold\*\*
```

Preview:

\_Don't want the text here to be italic\_

\*\*Don't want the text here to be bold\*\*

---

## Embedding Astro Components

See [User Components](/docs/integrations/components) and [Advanced Components](/docs/integrations/advanced) for details.




```mermaid
---
config:
  sankey:
    showValues: false
---
sankey-beta

Agricultural 'waste',Bio-conversion,124.729
Bio-conversion,Liquid,0.597
Bio-conversion,Losses,26.862
Bio-conversion,Solid,280.322
Bio-conversion,Gas,81.144
Biofuel imports,Liquid,35
Biomass imports,Solid,35
Coal imports,Coal,11.606
Coal reserves,Coal,63.965
Coal,Solid,75.571
District heating,Industry,10.639
District heating,Heating and cooling - commercial,22.505
District heating,Heating and cooling - homes,46.184
Electricity grid,Over generation / exports,104.453
Electricity grid,Heating and cooling - homes,113.726
Electricity grid,H2 conversion,27.14
Electricity grid,Industry,342.165
Electricity grid,Road transport,37.797
Electricity grid,Agriculture,4.412
Electricity grid,Heating and cooling - commercial,40.858
Electricity grid,Losses,56.691
Electricity grid,Rail transport,7.863
Electricity grid,Lighting & appliances - commercial,90.008
Electricity grid,Lighting & appliances - homes,93.494
Gas imports,Ngas,40.719
Gas reserves,Ngas,82.233
Gas,Heating and cooling - commercial,0.129
Gas,Losses,1.401
Gas,Thermal generation,151.891
Gas,Agriculture,2.096
Gas,Industry,48.58
Geothermal,Electricity grid,7.013
H2 conversion,H2,20.897
H2 conversion,Losses,6.242
H2,Road transport,20.897
Hydro,Electricity grid,6.995
Liquid,Industry,121.066
Liquid,International shipping,128.69
Liquid,Road transport,135.835
Liquid,Domestic aviation,14.458
Liquid,International aviation,206.267
Liquid,Agriculture,3.64
Liquid,National navigation,33.218
Liquid,Rail transport,4.413
Marine algae,Bio-conversion,4.375
Ngas,Gas,122.952
Nuclear,Thermal generation,839.978
Oil imports,Oil,504.287
Oil reserves,Oil,107.703
Oil,Liquid,611.99
Other waste,Solid,56.587
Other waste,Bio-conversion,77.81
Pumped heat,Heating and cooling - homes,193.026
Pumped heat,Heating and cooling - commercial,70.672
Solar PV,Electricity grid,59.901
Solar Thermal,Heating and cooling - homes,19.263
Solar,Solar Thermal,19.263
Solar,Solar PV,59.901
Solid,Agriculture,0.882
Solid,Thermal generation,400.12
Solid,Industry,46.477
Thermal generation,Electricity grid,525.531
Thermal generation,Losses,787.129
Thermal generation,District heating,79.329
Tidal,Electricity grid,9.452
UK land based bioenergy,Bio-conversion,182.01
Wave,Electricity grid,19.013
Wind,Electricity grid,289.366
```