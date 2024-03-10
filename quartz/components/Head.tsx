import { i18n } from "../i18n"
import { FullSlug, joinSegments, pathToRoot } from "../util/path"
import { JSResourceToScriptElement } from "../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const Head: QuartzComponent = ({ cfg, fileData, externalResources }: QuartzComponentProps) => {
    const title = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
    const description =
      fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description
    const { css, js } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)

    const iconPath = joinSegments(baseDir, "static/favicon.ico");
    const ogImagePath = `https://${cfg.baseUrl}/static/og-image.png`;
    const ogUrl = `${url}${fileData.filePath?.replace("content/","").replace(".md","")}`;

    return (
        <head>
            <title>{title}</title>
            <meta charSet="utf-8"/>
            {cfg.theme.cdnCaching && (
                <>
                    <link rel="preconnect" href="https://fonts.googleapis.com"/>
                    <link rel="preconnect" href="https://fonts.gstatic.com"/>
                </>
            )}
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta property="og:title" content={title}/>
            <meta property="og:type" content="article"/>
            <meta property="og:url" content={ogUrl}/>
            <meta property="og:description" content={description}/>
            {cfg.baseUrl && <meta property="og:image" content={ogImagePath}/>}
            <meta property="og:width" content="1200"/>
            <meta property="og:height" content="675"/>
            <meta name="twitter:card" content="summary"/>
            <meta name="twitter:image" content={ogImagePath}/>
            <meta name="twitter:title" content={title}/>
            <meta name="twitter:description" content={description}/>
            <meta name="twitter:creator" content="@hulj13"/>
            <meta name="twitter:site" content="@catcodeme.github.io"/>

            <meta name="description" content={description}/>
            <meta name="generator" content="Quartz"/>
            <link rel="icon" href={iconPath}/>
            <link rel="canonical" href={ogUrl}/>
            <link rel="stylesheet"
                  href="https://cdn.bootcdn.net/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.min.css" spa-preserve/>
            <link rel="stylesheet"
                  href="https://cdn.jsdelivr.net/npm/firacode@6.2.0/distr/fira_code.css" spa-preserve/>
            {css.map((href) => (
                <link key={href} href={href} rel="stylesheet" type="text/css" spa-preserve/>
            ))}
            {js
                .filter((resource) => resource.loadTime === "beforeDOMReady")
                .map((res) => JSResourceToScriptElement(res, true))}
        </head>
    )
  }

    return Head
}) satisfies QuartzComponentConstructor
