import React, { useState, useEffect, useRef, useCallback } from 'react';
import LZString from 'lz-string';
import { parse } from 'toml';
import configRaw from './excalidraw.config.toml?raw';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import katexStyles from 'katex/dist/katex.min.css?raw';

const config = parse(configRaw);

const KATEX_FONT_FIX = `
@font-face { font-family: 'KaTeX_Main'; src: url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/KaTeX_Main-Regular.woff2') format('woff2'); }
@font-face { font-family: 'KaTeX_Math'; src: url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/KaTeX_Math-Italic.woff2') format('woff2'); }
@font-face { font-family: 'KaTeX_Size1'; src: url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/KaTeX_Size1-Regular.woff2') format('woff2'); }
@font-face { font-family: 'KaTeX_Size2'; src: url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/KaTeX_Size2-Regular.woff2') format('woff2'); }
@font-face { font-family: 'KaTeX_Size3'; src: url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/KaTeX_Size3-Regular.woff2') format('woff2'); }
@font-face { font-family: 'KaTeX_Size4'; src: url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/fonts/KaTeX_Size4-Regular.woff2') format('woff2'); }
`;

const ResetIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

const OverviewIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
);

const SlidesIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h20" />
        <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
        <path d="m7 21 5-5 5 5" />
    </svg>
);

const ExcalidrawIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" {...props}>
        <path fill="#6965db" d="M29.937 25.078a.19.19 0 0 0-.185-.042c-1.464-2.162-3.325-4.213-5.128-6.193l-.297-.325a.17.17 0 0 0-.042-.105a.2.2 0 0 0-.118-.07l-.06-.063l-.042-.031c-.052-.112-.185-.196-.332-.122c-.551.283-1.047.688-1.536 1.062c-.654.5-1.293 1.02-1.894 1.579a6 6 0 0 0-.688.73c-.098.129-.024.251.095.303q-.64.63-1.286 1.307a.2.2 0 0 0-.056.154a.2.2 0 0 0 .077.143l.755.576s.003.01.01.014c1.08 1.065 2.973 2.543 4.978 4.108q.446.351.897.702q.204.247.392.49a.2.2 0 0 0 .279.038c.045.034.09.073.136.108a.2.2 0 0 0 .28-.035a.2.2 0 0 0 .038-.108c.014 0 .025.01.035.01a.2.2 0 0 0 .147-.063l3.556-3.884a.196.196 0 0 0-.014-.28zm-10.21-1.345q.037.047.073.088c.406.342.839.712 1.279 1.09l-1.789-1.366l-.181-.126a2 2 0 0 1-.108-.084l-.133-.112s.024-.024.035-.038l.122-.123c.6-.607 1.631-1.62 2.162-2.116c-.562.566-1.7 2.225-1.456 2.787zm6.123 4.824l-1.474-1.125a37 37 0 0 0-1.83-1.757c.796.615 1.477 1.135 1.579 1.226c.772.689.737.563 1.268 1.017l.639.464c-.063.056-.126.116-.185.172zm.37.283l-.027-.02l.17-.134l-.139.154zM2.843 6.031l.14.737c.24 1.292.464 2.456.89 3.34l.168.67c.066.255.16.573.248.64c.995.88 2.522 2.193 4.153 3.43a.2.2 0 0 0 .245-.004q.006.01.014.014a.2.2 0 0 0 .132.052a.2.2 0 0 0 .147-.066c2.089-2.323 3.643-4.234 4.75-5.834a.44.44 0 0 0 .102-.293c.07-.084.143-.168.21-.237a.195.195 0 0 0-.035-.3a.2.2 0 0 0-.06-.127a95 95 0 0 0-1.208-1.145a104 104 0 0 1-2.715-2.624L10 4.264a.2.2 0 0 0-.077-.05c-.388-.136-1.184-.272-2.186-.447c-1.475-.251-3.493-.6-5.31-1.142h-.014v-.003s-.007 0-.01.007h-.004l.014-.007s-.108.003-.13.014a.2.2 0 0 0-.065.052c-.018.021-.032.042-.165.07c-.132.028.028 0 .039 0h-.039v.01c.025.12.018.203.056.34c-.007.034.074.356.084.387l.64 2.536zm10.81 2.284l-.013.018l-.224-.248q.114.107.238.23zm-2.476 3.28l-.035.042l-.007-.007q.02-.017.045-.034zm-1.415-7.02c.123.122.608.576.72.688c-.507-.231-1.768-.818-2.354-1.006c.576.1 1.372.23 1.634.317zm-6.7-.968c.294.503.525 2.267.755 3.982c-.13-.552-.24-1.09-.346-1.607c-.181-.894-.349-1.694-.583-2.403q.075.006.171.017q-.002.006.007.01zm-.1-.423q-.122-.012-.217-.017q-.01-.021-.014-.042l.23.063zm-.776.157v-.007zm27.434-.412c.014-.08-.384-.433-.259-.44c.297-.014.3-.471 0-.458c-.394.021-.793.112-1.177.186q-1.036.195-2.068.422a85 85 0 0 0-4.576 1.087c-.475.129-.999.244-1.435.475c-.147.076-.14.234-.06.331a.3.3 0 0 1-.097.032q-.195.035-.388.066a.198.198 0 0 0-.136.3c-.81 1.084-1.733 2.25-2.732 3.476a351 351 0 0 0-3.046 3.543c-3.287 3.863-7.014 8.243-11.143 12.1a.2.2 0 0 0-.01.279a.2.2 0 0 0 .066.045l-.168.154a.18.18 0 0 0-.056.112l-.08.087a.2.2 0 0 0 .01.28a.2.2 0 0 0 .28-.01l.042-.046a.293.293 0 0 1 .426 0l.681.73l-.482-.402a.2.2 0 0 0-.28.024a.2.2 0 0 0 .025.28l5.177 4.342a.2.2 0 0 0 .269-.014l.126-.126a.2.2 0 0 0 .22-.042c7.017-7.049 12.669-12.376 19.142-17.137a.2.2 0 0 0 .08-.178a.2.2 0 0 0 .168-.136c1.194-3.654 1.425-6.889 1.495-8.478l.007-.024q.01-.027.014-.05l.017-.065a.95.95 0 0 0-.052-.751zM17.072 8.647q.471-.54.933-1.055C15.993 10.24 12.66 14.32 7.942 19.168c3.213-3.555 6.451-7.24 9.13-10.52zM5.702 27.094l-.01-.01l.07.014a.2.2 0 0 0-.06 0zm2.41 2.243l-.017-.014l.01-.01c.007 0 .01.006.014.006c0 .007-.007.01-.01.018zm2.92-2.519l.482-.503l.01.018c-.163.16-.328.325-.495.485zm.783-.772l.304-.356q.004-.006.014-.014a201 201 0 0 1 3.555-3.58l.025-.021l.95-.727a520 520 0 0 0-4.848 4.702zm7.562-19.519c-.65.846-1.362 1.942-1.966 2.82c-1.908 2.762-8.048 9.528-8.185 9.657c-.946.916-3.8 3.654-5.62 5.37a1 1 0 0 0-.119.122a.277.277 0 0 1 .01-.395c8.67-8.174 13.93-14.982 16.069-17.947c-.046.115-.084.24-.192.38zm5.767 2.48l-.003.007c0-.007-.007-.024.003-.007m-2.375 1.51c-.79-.458-1.16-1.143-.947-1.834l.067-.23q.041-.1.098-.2c.206-.342.52-.646.88-.824q.026-.01.052-.014a.3.3 0 0 1-.014-.15c.018-.109.088-.203.23-.203c.235 0 .961.216 1.237.454q.127.1.238.22c.105.122.258.321.335.465c.046.02.08.216.133.317q.073.242.063.49c0 .006 0 .006.003.01c-.01.024 0 .13-.014.14c-.035.251-.126.5-.262.716l-.038.056c0 .003-.007.007-.01.014a1.6 1.6 0 0 1-.378.394c-.44.311-.953.406-1.467.276a2 2 0 0 1-.2-.087zm5.683-.57c-.171.716-.38 1.464-.629 2.229c-.01.028-.01.055-.01.08a.2.2 0 0 0-.094.038a106 106 0 0 0-4.535 3.532a250 250 0 0 1 3.923-3.476a2.24 2.24 0 0 0 .737-1.306l.196-1.178l.01-.035c.088-.248.468-.14.409.116z" />
    </svg>
);

interface ExcalidrawProps {
    snapshotUrl: string;
    height?: string | number;
    width?: string | number;
    title?: React.ReactNode;
    "exc-title"?: React.ReactNode;
    subtitle?: string;
    fontFamily?: string;
}

export function Excalidraw({
    snapshotUrl,
    title,
    "exc-title": excTitle,
    height = 500,
    width = "100%",
    fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
}: ExcalidrawProps) {
    const finalTitle = excTitle || title;
    const containerRef = useRef<HTMLDivElement>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    const [data, setData] = useState<any>(null);
    const [frames, setFrames] = useState<any[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [viewMode, setViewMode] = useState<'overview' | 'slide'>('overview');
    const [zoom, setZoom] = useState(100);

    // The raw viewBox of the entire exported SVG
    const [rawViewBox, setRawViewBox] = useState<number[] | null>(null);
    const overviewTargetRef = useRef<number[] | null>(null);
    const currentViewBoxRef = useRef<number[]>([0, 0, 100, 100]);
    // Store raw HTML strings and data URLs for inlining replacement
    const formulaDataRef = useRef<Record<string, {
        html: string,
        dataURL: string,
        x: number,
        y: number,
        width: number,
        height: number,
        angle: number
    }>>({});

    const requestRef = useRef<number | null>(null);
    const transitionRef = useRef<{ start: number[], end: number[], startTime: number, duration: number } | null>(null);

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number, y: number, vb: number[] } | null>(null);

    useEffect(() => { setIsClient(true); }, []);

    const [coordinateOffset, setCoordinateOffset] = useState({ x: 0, y: 0 });

    // 1. Fetch & Sort
    useEffect(() => {
        if (!isClient || !snapshotUrl) return;
        async function loadData() {
            try {
                const res = await fetch(`${snapshotUrl}?t=${Date.now()}`);
                if (!res.ok) throw new Error(`Failed to load: ${res.status}`);

                const textContent = await res.text();
                // Match lines like "hash: $$formula$$" for LaTeX extraction
                const latexMap: Record<string, string> = {};
                const latexLines = textContent.match(/^[a-f0-9]{40}: \$\$.*?\$\$/gm);
                if (latexLines) {
                    latexLines.forEach(line => {
                        const colonIndex = line.indexOf(':');
                        if (colonIndex > 0) {
                            const id = line.slice(0, colonIndex).trim();
                            const formula = line.slice(colonIndex + 1).trim().replace(/^\$\$/, '').replace(/\$\$$/, '');
                            latexMap[id] = formula;
                        }
                    });
                }

                let json;
                // Only support Obsidian-Excalidraw Markdown
                const match = textContent.match(/```compressed-json\s*([\s\S]*?)```/);
                if (!match) return;

                // Remove all whitespace (newlines, spaces) as LZString expects a continuous string
                const compressed = match[1].replace(/\s/g, '');
                const decompressed = LZString.decompressFromBase64(compressed);
                if (!decompressed) return;

                json = JSON.parse(decompressed);

                // Populate json.files with LaTeX renders if we found any
                if (Object.keys(latexMap).length > 0) {
                    json.files = json.files || {};
                    formulaDataRef.current = {}; // Reset map
                    for (const [id, formula] of Object.entries(latexMap)) {
                        // Find corresponding image element to get its intended size
                        const el = json.elements?.find((e: any) => e.fileId === id && !e.isDeleted);
                        if (!el) continue;

                        try {
                            const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });

                            // Use a simple, valid SVG placeholder to ensure Excalidraw's exportToSvg 
                            // produces an <image> tag that we can later find and replace.
                            const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${el.width}" height="${el.height}"><rect width="100%" height="100%" fill="none"/></svg>`;
                            const bytes = new TextEncoder().encode(placeholderSvg);
                            const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
                            const dataURL = `data:image/svg+xml;base64,${btoa(binString)}`;

                            // Save full metadata for absolute positioning
                            formulaDataRef.current[id] = {
                                html,
                                dataURL,
                                x: el.x,
                                y: el.y,
                                width: el.width,
                                height: el.height,
                                angle: el.angle || 0
                            };

                            json.files[id] = {
                                mimeType: "image/svg+xml",
                                id,
                                dataURL,
                                created: Date.now()
                            };

                            // Force status to success so it's rendered by the exporter
                            if (el.type === "image") {
                                el.status = "success";
                            }
                        } catch (err) {
                            console.error("KaTeX rendering failed for ID:", id, err);
                        }
                    }
                }

                const elements = json.elements || [];

                const frameElements = elements.filter((el: any) => el.type === "frame")
                    .sort((a: any, b: any) => {
                        const nameA = a.name || "";
                        const nameB = b.name || "";
                        const numA = parseInt(nameA.match(/^\d+/)?.[0] || "0");
                        const numB = parseInt(nameB.match(/^\d+/)?.[0] || "0");

                        if (numA !== 0 && numB !== 0 && numA !== numB) return numA - numB;
                        if (nameA !== nameB) return nameA.localeCompare(nameB);
                        if (Math.abs(a.y - b.y) > 50) return a.y - b.y;
                        return a.x - b.x;
                    });

                setData(json);
                setFrames(frameElements);
            } catch (e) { console.error(e); setLoading(false); }
        }
        loadData();
    }, [isClient, snapshotUrl]);

    const setSvgViewBox = useCallback((vb: number[]) => {
        if (svgRef.current) {
            svgRef.current.setAttribute('viewBox', vb.join(' '));
            currentViewBoxRef.current = vb;
            if (overviewTargetRef.current) {
                const z = Math.round((overviewTargetRef.current[2] / vb[2]) * 100);
                setZoom(z);
            }
        }
    }, []);

    // 2. Render SVG
    useEffect(() => {
        if (!data || !svgContainerRef.current) return;
        async function renderSvg() {
            try {
                const { exportToSvg } = await import("@excalidraw/excalidraw");

                // 1. Export CLEAN SVG without any hacks
                const activeElements = data.elements
                    .filter((el: any) => !el.isDeleted)
                    .map((el: any) => {
                        if (el.type === "text" && el.fontFamily === 4) {
                            return { ...el, fontFamily: 1 };
                        }
                        // Ensure images have success status for export
                        if (el.type === "image" && el.fileId && formulaDataRef.current[el.fileId]) {
                            return { ...el, status: "success" };
                        }
                        return el;
                    });

                let minX = Infinity, minY = Infinity;
                activeElements.forEach((el: any) => {
                    if (el.x < minX) minX = el.x;
                    if (el.y < minY) minY = el.y;
                });
                if (minX === Infinity) { minX = 0; minY = 0; }

                const svg = await exportToSvg({
                    elements: activeElements,
                    appState: { ...data.appState, exportBackground: true, viewBackgroundColor: "#ffffff", frameRendering: viewMode === 'overview' ? { enabled: true, name: true, outline: true, clip: true } : { enabled: false, name: false, outline: false, clip: true } },
                    files: data.files || {},
                    exportPadding: 10,
                });

                // 2. CSS Style injection (Includes Global KaTeX fonts)
                const style = document.createElementNS("http://www.w3.org/2000/svg", "style");

                // Strip internal @font-face rules from KaTeX CSS to avoid 404s on relative paths
                const cleanKatexStyles = katexStyles.replace(/@font-face\s*{[^}]*}/g, '');

                style.textContent = `
                    @import url('${config.font4.cssUrl}');
                    ${KATEX_FONT_FIX}
                    ${cleanKatexStyles}
                    text { font-family: "${config.font4.name}", ${fontFamily}, sans-serif !important; }
                    
                    /* Custom styles for inlined KaTeX formulas */
                    .katex-inline-host {
                        font-family: KaTeX_Main, "Times New Roman", serif !important;
                        color: #1a1a1a;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .katex-display { margin: 0; }
                    .katex { font-size: 1.15em; line-height: 1.2; }

                    @keyframes exc-flow-base { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
                    
                    path[stroke="#0000ff"][stroke-dasharray] { 
                        animation: exc-flow-base 1.5s linear infinite !important; 
                        stroke-dasharray: 12, 8 !important; 
                    }
                    
                    .exc-magic-ball {
                        fill: #ff1a1a !important;
                        filter: drop-shadow(0 0 10px #ff0000);
                    }
                `;
                svg.prepend(style);

                // 3. NUCLEAR POSITIONING & CLEANUP
                // Excalidraw's SVG export uses these offsets
                const offsetX = minX;
                const offsetY = minY;
                const PADDING = 10;

                // Move through formulas and place them at absolute coordinates in SVG root
                activeElements.forEach((el: any) => {
                    if (el.type === "image" && el.fileId && formulaDataRef.current[el.fileId]) {
                        const matched = formulaDataRef.current[el.fileId];

                        // Calculate position relative to SVG viewBox
                        const targetX = el.x - offsetX + PADDING;
                        const targetY = el.y - offsetY + PADDING;

                        const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
                        fo.setAttribute("x", targetX.toString());
                        fo.setAttribute("y", targetY.toString());
                        fo.setAttribute("width", el.width.toString());
                        fo.setAttribute("height", el.height.toString());
                        fo.setAttribute("overflow", "visible");

                        // Handle rotation if any
                        if (el.angle !== 0) {
                            const deg = (el.angle * 180) / Math.PI;
                            const cx = targetX + el.width / 2;
                            const cy = targetY + el.height / 2;
                            fo.setAttribute("transform", `rotate(${deg} ${cx} ${cy})`);
                        }

                        const div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
                        div.className = "katex-inline-host";
                        (div as any).style.cssText = `
                            width: 100%; height: 100%; 
                            display: flex; align-items: center; justify-content: center; 
                            overflow: visible; color: #1a1a1a; 
                            font-weight: normal;
                        `;
                        div.innerHTML = matched.html;
                        fo.appendChild(div);

                        // Append to end of SVG to be on top of everything
                        svg.appendChild(fo);
                    }
                });

                // Clean up original tags that might be confusing or covering
                svg.querySelectorAll('image').forEach((img: any) => {
                    const href = (img.getAttribute('xlink:href') || img.getAttribute('href') || "").trim();
                    if (Object.values(formulaDataRef.current).some(f => f.dataURL === href)) {
                        img.remove();
                    }
                });

                svg.querySelectorAll('rect').forEach((rect: any) => {
                    const stroke = rect.getAttribute('stroke');
                    // Protect Excalidraw frames: frames usually have fill="none" and a name or specific classes
                    // We only want to remove the specific placeholder boxes that match formula dimensions
                    const isFrame = rect.hasAttribute('aria-label') || rect.classList.contains('excalidraw-frame');

                    if (!isFrame && (stroke === "#bbb" || stroke === "#cccccc")) {
                        // Check if this rect matches any of our formula dimensions to be safe
                        const w = parseFloat(rect.getAttribute('width') || "0");
                        const h = parseFloat(rect.getAttribute('height') || "0");
                        const isMatch = Object.values(formulaDataRef.current).some(f =>
                            Math.abs(f.width - w) < 1 && Math.abs(f.height - h) < 1
                        );
                        if (isMatch) rect.remove();
                    }
                });


                // 4. Post-process: Dynamic Motion Injection (Motion Engine)
                const clusters: { length: number, firstPoint: string }[] = [];
                const allPaths = svg.querySelectorAll('path[stroke="#0000ff"]');

                allPaths.forEach((el: any) => {
                    const isDashed = el.hasAttribute('stroke-dasharray');
                    if (!isDashed) return;

                    try {
                        const length = Math.round(el.getTotalLength());
                        const d = el.getAttribute('d') || "";
                        const firstCoord = d.split(/[ ,]/).slice(0, 4).join(" ");

                        if (length < 20) return;

                        // Feature-based De-duplication (Prevents dots on overdrawn/sloppy segments)
                        const isDuplicate = clusters.some(c =>
                            Math.abs(c.length - length) < 2 && c.firstPoint === firstCoord
                        );

                        if (isDuplicate) return;

                        clusters.push({ length, firstPoint: firstCoord });

                        // Inject specialized SVG Motion Object
                        const ball = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        ball.setAttribute("r", "8");
                        ball.setAttribute("class", "exc-magic-ball");

                        const activeDur = 1.2 + (length / 450);
                        const totalDur = activeDur / 0.8; // 20% of duration is pause
                        const slice = 0.8; // Motion takes 80% of total time

                        const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
                        motion.setAttribute("path", d);
                        motion.setAttribute("dur", `${totalDur.toFixed(1)}s`);
                        motion.setAttribute("repeatCount", "indefinite");
                        motion.setAttribute("rotate", "auto");
                        motion.setAttribute("keyPoints", "0;1;1");
                        motion.setAttribute("keyTimes", `0;${slice};1`);
                        motion.setAttribute("calcMode", "linear");

                        const opacity = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                        opacity.setAttribute("attributeName", "opacity");
                        opacity.setAttribute("values", "1;1;0;0");
                        opacity.setAttribute("keyTimes", `0;${slice - 0.05};${slice};1`);
                        opacity.setAttribute("dur", `${totalDur.toFixed(1)}s`);
                        opacity.setAttribute("repeatCount", "indefinite");

                        ball.appendChild(motion);
                        ball.appendChild(opacity);
                        el.parentNode.insertBefore(ball, el.nextSibling);

                    } catch (e) { /* silent fail for malformed paths */ }
                });

                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.style.width = "100%";
                svg.style.height = "100%";
                svg.style.display = "block";
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                const vb = svg.getAttribute('viewBox')?.split(' ').map(parseFloat);
                if (vb && vb.length === 4) {
                    setRawViewBox(vb);
                    // Use initial overviewTargetRef to keep zoom reference stable
                    if (!overviewTargetRef.current && viewMode === 'overview') {
                        overviewTargetRef.current = vb;
                    }
                    currentViewBoxRef.current = vb;
                    setCoordinateOffset({ x: vb[0] - minX, y: vb[1] - minY });
                }

                svgContainerRef.current!.innerHTML = '';
                svgContainerRef.current!.appendChild(svg);
                svgRef.current = svg;
                setLoading(false);
            } catch (e) {
                console.error("Excalidraw Render Error:", e);
                setLoading(false);
            }
        }
        renderSvg();
    }, [data, viewMode, fontFamily]);

    const animate = useCallback((time: number) => {
        if (!transitionRef.current) return;
        const { start, end, startTime, duration } = transitionRef.current;
        const progress = Math.min((time - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        const newVB = start.map((val, i) => val + (end[i] - val) * ease);
        setSvgViewBox(newVB);

        if (progress < 1) requestRef.current = requestAnimationFrame(animate);
        else transitionRef.current = null;
    }, [setSvgViewBox]);

    const updateCamera = useCallback((targetVB: number[], duration = 600) => {
        transitionRef.current = { start: currentViewBoxRef.current, end: targetVB, startTime: performance.now(), duration };
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(animate);
    }, [animate]);

    // Sync View Logic
    const syncView = useCallback(() => {
        if (!rawViewBox || !overviewTargetRef.current) return;

        let target: number[];
        if (viewMode === 'overview') {
            target = overviewTargetRef.current;
        } else {
            const frame = frames[currentSlide];
            if (frame) {
                const p = Math.max(frame.width, frame.height) * 0.10;
                // Apply coordinate offset to align frame coordinates with SVG coordinates
                target = [
                    frame.x + coordinateOffset.x - p,
                    frame.y + coordinateOffset.y - p,
                    frame.width + p * 2,
                    frame.height + p * 2
                ];
            } else {
                target = overviewTargetRef.current;
            }
        }
        updateCamera(target);
    }, [viewMode, currentSlide, rawViewBox, frames, updateCamera, coordinateOffset]);

    // Trigger Sync on Logic Changes
    useEffect(() => {
        if (!loading && !isDragging) syncView();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSlide, viewMode, loading]);

    const goToSlide = (index: number) => {
        if (index >= 0 && index < frames.length) {
            setCurrentSlide(index);
            setViewMode('slide');
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (viewMode !== 'slide' || frames.length === 0) return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToSlide((currentSlide + 1) % frames.length);
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToSlide((currentSlide - 1 + frames.length) % frames.length);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, currentSlide, frames.length]);

    // Unified Pointer Drag Handlers (Mouse, Touch, Pen)
    const handlePointerDown = (e: React.PointerEvent) => {
        // Only handle primary pointer (usually left click or first touch)
        if (!e.isPrimary) return;

        // Capture pointer so we continue receiving events even if the pointer leaves the container
        e.currentTarget.setPointerCapture(e.pointerId);

        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            vb: [...currentViewBoxRef.current]
        };
        transitionRef.current = null;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !dragStartRef.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        const [vx, vy, vw, vh] = dragStartRef.current.vb;
        const scale = Math.max(vw / rect.width, vh / rect.height);

        const newVB = [
            vx - dx * scale,
            vy - dy * scale,
            vw,
            vh
        ];

        setSvgViewBox(newVB);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        dragStartRef.current = null;
        // Release is automatic but good practice to clear state
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    // Zoom Handler
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onWheelPassive = (e: WheelEvent) => {
            e.preventDefault();
            transitionRef.current = null;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);

            const zoomFactor = e.deltaY > 0 ? 1.05 : 0.95;
            const [vx, vy, vw, vh] = currentViewBoxRef.current;

            const newW = vw * zoomFactor;
            const newH = vh * zoomFactor;
            const newX = vx + (vw - newW) / 2;
            const newY = vy + (vh - newH) / 2;

            setSvgViewBox([newX, newY, newW, newH]);
        };
        el.addEventListener('wheel', onWheelPassive, { passive: false });
        return () => el.removeEventListener('wheel', onWheelPassive);
    }, [loading, setSvgViewBox]);

    const containerStyle = {
        height: typeof height === 'number' ? `${height}px` : height,
        maxHeight: '70vh',
        minHeight: '300px',
        width: typeof width === 'number' ? `${width}px` : width,
        touchAction: 'none' // Prevent native browser gestures (scroll/pinch) from interfering
    };

    if (!isClient) return <div style={containerStyle} className="bg-gray-50 flex items-center justify-center border-2 border-gray-200 rounded-xl">Initializing...</div>;

    const hasFrames = frames.length > 0;

    return (
        <div className="flex flex-col w-full my-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 relative flex items-center justify-center [&_p]:m-0">
                {finalTitle ? (
                    typeof finalTitle === 'string' ? <span className="text-sm font-semibold text-gray-700">{finalTitle}</span> : finalTitle
                ) : (
                    <span className="text-sm font-semibold text-gray-700">Excalidraw</span>
                )}
            </div>

            <div
                ref={containerRef}
                className={`relative bg-white overflow-hidden select-none group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={containerStyle}
                tabIndex={0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <div ref={svgContainerRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                {loading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}

                {/* Frame Label (Slide Mode) */}
                {hasFrames && viewMode === 'slide' && (
                    <div className="absolute bottom-4 left-4 z-50 pointer-events-none">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200 shadow-sm">
                            {frames[currentSlide]?.name || `Slide ${currentSlide + 1}`}
                        </span>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 border-t border-gray-100 pr-4 pl-4 flex items-center justify-between h-10">
                <div className="w-24 flex items-center justify-start">
                    <ExcalidrawIcon className="w-5 h-5 text-purple-600" />
                </div>

                <div className="flex-1 flex justify-center">
                    {hasFrames && (
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-1.5 py-0.5 shadow-sm gap-1">
                            <button onClick={() => goToSlide((currentSlide - 1 + frames.length) % frames.length)} className="p-1 hover:bg-gray-50 rounded text-gray-500 transition-colors"><svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd"></path></svg></button>

                            <div className="flex items-center gap-1 px-1">
                                <input
                                    type="text"
                                    value={currentSlide + 1}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) goToSlide(val - 1);
                                    }}
                                    className="w-6 bg-transparent text-[10px] font-black text-center text-gray-800 border-none outline-none focus:ring-0 p-0"
                                />
                                <span className="text-[10px] font-black text-gray-300">/</span>
                                <span className="text-[10px] font-black text-gray-400 w-6 text-center">{frames.length}</span>
                            </div>

                            <button onClick={() => goToSlide((currentSlide + 1) % frames.length)} className="p-1 hover:bg-gray-50 rounded text-gray-500 transition-colors"><svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M6.1584 3.13523C5.95694 3.32411 5.94673 3.64053 6.1356 3.84199L9.565 7.50003L6.1356 11.1581C5.94673 11.3596 5.95694 11.676 6.1584 11.8648C6.35986 12.0537 6.67628 12.0435 6.86514 11.842L10.6151 7.84201C10.7954 7.64968 10.7954 7.35038 10.6151 7.15805L6.86514 3.15805C6.67628 2.95659 6.35986 2.94638 6.1584 3.13523Z" fill="currentColor" fillRule="evenodd"></path></svg></button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 w-24 justify-end">
                    <span className="text-[10px] font-black text-gray-400 mr-1">{zoom}%</span>
                    <button
                        onClick={() => {
                            syncView();
                        }}
                        className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded transition-colors text-gray-500"
                        title="Reset View"
                    >
                        <ResetIcon />
                    </button>
                    {hasFrames && (
                        <button
                            onClick={() => setViewMode(prev => prev === 'overview' ? 'slide' : 'overview')}
                            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${viewMode === 'overview'
                                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                : 'text-gray-500 hover:bg-gray-200'
                                }`}
                            title={viewMode === 'overview' ? "Back to Slides" : "Overview"}
                        >
                            {viewMode === 'overview' ? <SlidesIcon /> : <OverviewIcon />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}