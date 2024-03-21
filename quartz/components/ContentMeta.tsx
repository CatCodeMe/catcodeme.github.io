import {QuartzComponentConstructor, QuartzComponentProps} from "./types"
import readingTime from "reading-time"
import {classNames} from "../util/lang"
import {format as formatDateFn, formatISO} from "date-fns"
import type {JSX} from "preact"

const TimeMeta = ({value}: { value: Date }) => (
    <time dateTime={formatISO(value)} title={formatDateFn(value, "ccc w")}>
        {formatDateFn(value, "yyyy/LL/dd HH:mm")}
    </time>
)

interface ContentMetaOptions {
    /**
     * Whether to display reading time
     */
    showReadingTime: boolean
}

const defaultOptions: ContentMetaOptions = {
    showReadingTime: true,
}

export default ((opts?: Partial<ContentMetaOptions>) => {
    // Merge options with defaults
    const options: ContentMetaOptions = {...defaultOptions, ...opts}

    function ContentMetadata({cfg, fileData, displayClass}: QuartzComponentProps) {
        const text = fileData.text
        const fileRelativePath = fileData.filePath?.replace("content/", "");

        if (fileRelativePath === "index.md") {
            return null
        }

        if (text) {
            const segments: JSX.Element[] = []

            if (fileData.dates) {
                if (fileData.dates.created) {
                    segments.push(
                        <span>
              🌱 <TimeMeta value={fileData.dates.created}/>
            </span>,
                    )
                }
                if (fileData.dates.modified) {
                    segments.push(
                        <span>
              🌴 <TimeMeta value={fileData.dates.modified}/>
            </span>,
                    )
                }
            }

            // Display reading time if enabled
            if (options.showReadingTime) {
                const {minutes, words: _words} = readingTime(text)
                segments.push(<span>⌛️ {Math.ceil(minutes)}min, {_words}words</span>)
            }

            segments.push(
                <a
                    href={`https://github.com/CatCodeMe/blog_from_obsidian/commits/main/${fileRelativePath}`}
                    target="_blank"
                >
                    🗓️ History
                </a>,
            )

            return (
                <p class={classNames(displayClass, "content-meta")}>
                    {segments.map((meta, idx) => (
                        <>
                            {meta}
                            {idx < segments.length - 1 ? <br/> : null}
                        </>
                    ))}
                </p>
            )
        } else {
            return null
        }
    }

    ContentMetadata.css = `
  .content-meta {
    display:flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 10;

    margin-top: 0;
    color: var(--gray);
  }
  `
    return ContentMetadata
}) satisfies QuartzComponentConstructor
