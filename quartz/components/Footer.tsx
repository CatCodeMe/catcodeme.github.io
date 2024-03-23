import {QuartzComponent, QuartzComponentConstructor, QuartzComponentProps} from "./types"
import style from "./styles/footer.scss"
import {version} from "../../package.json"
import {isHomePage} from "../util/path";

interface Options {
    links: Record<string, string>
}

export default ((opts?: Options) => {
    const Footer: QuartzComponent = ({fileData}: QuartzComponentProps) => {
        const year = new Date().getFullYear()
        return (
            <footer>
                {
                    isHomePage(fileData.filePath || "") ? "" :
                        (
                            <div className="note-end">
                                <a href="https://quartz.jzhao.xyz">🖋 Quartz v{version} ©{year}</a>
                            </div>
                        )
                }
                <hr/>
                <ul>
                    <li>
                        <a href="https://obsidian.md" target="_blank" title="obsidian">
                            <iconify-icon icon="skill-icons:obsidian-light" style="font-size: 18px"
                                          height="2em"></iconify-icon>
                        </a>
                    </li>
                    <li>
                        <a href="https://quartz.jzhao.xyz" target="_blank" title="quartz">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="2em" width="2em"
                                 id="Decoration-Crystals--Streamline-Ultimate">
                                <desc>{"Decoration Crystals Streamline Icon: https://streamlinehq.com"}</desc>
                                <path d="m20.25 2.25 3 0" fill="none" stroke="#000000" strokeLinecap="round"
                                      strokeLinejoin="round" strokeWidth={1.5}/>
                                <path d="m21.75 0.75 0 3" fill="none" stroke="#000000" strokeLinecap="round"
                                      strokeLinejoin="round" strokeWidth={1.5}/>
                                <path d="m0.75 8.25 3 0" fill="none" stroke="#000000" strokeLinecap="round"
                                      strokeLinejoin="round" strokeWidth={1.5}/>
                                <path d="m2.25 6.75 0 3" fill="none" stroke="#000000" strokeLinecap="round"
                                      strokeLinejoin="round" strokeWidth={1.5}/>
                                <path d="m17.25 23.25 -3 0 0 -12.75 3 -3 3 3 -3 12.75z" fill="none" stroke="#000000"
                                      strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}/>
                                <path d="M15.464 9.286 15.75 6 12 0.75 8.25 6l0.643 7.394" fill="none" stroke="#000000"
                                      strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}/>
                                <path d="m7.5 23.25 2.25 0 0 -9 -3 -3 -3 3.75 3.75 8.25z" fill="none" stroke="#000000"
                                      strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}/>
                                <path d="m9.75 23.25 4.5 0" fill="none" stroke="#000000" strokeLinecap="round"
                                      strokeLinejoin="round" strokeWidth={1.5}/>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a href="https://catcodeme.github.io/index.xml" target="_blank" title="rss">
                            <iconify-icon icon="mdi:rss-box" style="color: #ff8a05;font-size: 18px"
                                          height="2em"></iconify-icon>
                        </a>
                    </li>

                    <li>
                        <iconify-icon icon="gg:format-slash" style="color: black;font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>

                    <li>
                        <a href="https://github.com/CatCodeMe" target="_blank" title="github">
                            <iconify-icon icon="openmoji:github" style="font-size: 18px"
                                          height="2em"></iconify-icon>
                        </a>
                    </li>

                    <li>
                        <iconify-icon icon="gg:format-slash" style="color: black;font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>

                    <li>
                        <iconify-icon icon="mdi:creative-commons" style="font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>
                    <li>
                        <iconify-icon icon="ri:creative-commons-by-line" style="font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>
                    <li>
                        <iconify-icon icon="tabler:creative-commons-nc" style="font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>
                    <li>
                        <iconify-icon icon="tabler:creative-commons-nd" style="font-size: 18px"
                                      height="2em"></iconify-icon>
                    </li>
                </ul>
                <hr/>
                <div className="giscus"></div>
            </footer>
        )
    }

    Footer.css = style
    return Footer
}) satisfies QuartzComponentConstructor