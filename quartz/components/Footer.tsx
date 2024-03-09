import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
          <hr/>
          <div className="giscus"></div>
          <hr/>
          <ul>
              <li>
                  <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
                      CC BY 4.0 License
                  </a>
              </li>
              <li>
                  Cultivated using <a href="https://obsidian.md/">Obsidian</a> and{" "}
                  <a href="https://quartz.jzhao.xyz/">Quartz v{version} © {year}</a>
              </li>
          </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
