import React, { useState, useEffect, useRef, useCallback } from 'react';

const ExcalidrawIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <circle cx="11" cy="11" r="2"></circle>
  </svg>
);

interface ExcalidrawSlidesProps {
  snapshotUrl: string;
  height?: string | number;
  width?: string | number;
  title?: string;
  subtitle?: string;
}

export function ExcalidrawSlides({ snapshotUrl, title, subtitle, height = 500, width = "100%" }: ExcalidrawSlidesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  const [data, setData] = useState<any>(null);
  const [frames, setFrames] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'slide'>('overview');
  
  // The raw viewBox of the entire exported SVG
  const [rawViewBox, setRawViewBox] = useState<number[] | null>(null);
  const currentViewBoxRef = useRef<number[]>([0, 0, 100, 100]);
  
  const requestRef = useRef<number>();
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
            const json = await res.json();
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
      }
  }, []);

  // 2. Render SVG
  useEffect(() => {
    if (!data || !svgContainerRef.current) return;
    async function renderSvg() {
      try {
        const { exportToSvg } = await import("@excalidraw/excalidraw");
        
        const renderElements = data.elements.map((el: any) => {
            if (el.type === 'frame') {
                return { ...el, strokeColor: '#00000000', backgroundColor: 'transparent', name: '' };
            }
            return el;
        });

        // Calculate JSON Min Bounds
        let minX = Infinity, minY = Infinity;
        renderElements.forEach((el: any) => {
            if (el.x < minX) minX = el.x;
            if (el.y < minY) minY = el.y;
        });
        if (minX === Infinity) { minX = 0; minY = 0; }

        const svg = await exportToSvg({
          elements: renderElements,
          appState: { ...data.appState, exportBackground: true, viewBackgroundColor: "#ffffff" },
          files: data.files || {},
          exportPadding: 10, // Restored padding to look nice, we will account for offset
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
            currentViewBoxRef.current = vb;
            
            // Calculate Offset: SVG ViewBox Origin - JSON Element Origin
            // This accounts for padding or any normalization Excalidraw did.
            setCoordinateOffset({
                x: vb[0] - minX,
                y: vb[1] - minY
            });
        }

        svgContainerRef.current!.innerHTML = '';
        svgContainerRef.current!.appendChild(svg);
        svgRef.current = svg;
        setLoading(false);
    } catch (e) { console.error(e); }
    }
    renderSvg();
  }, [data]);

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
      if (!rawViewBox) return;
      
      let target: number[];
      if (viewMode === 'overview') {
          target = rawViewBox;
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
              target = rawViewBox;
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

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { 
          x: e.clientX, 
          y: e.clientY, 
          vb: [...currentViewBoxRef.current] 
      };
      transitionRef.current = null;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !dragStartRef.current || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      const [vx, vy, vw, vh] = dragStartRef.current.vb;
      
      // Calculate scale. Since we use 'meet', the SVG scale matches the constraining dimension.
      // We use the MAX dimension ratio to approximate the zoom level for panning speed.
      // This ensures 1px of drag ~= 1px of SVG movement regardless of aspect ratio letterboxing.
      const scale = Math.max(vw / rect.width, vh / rect.height);

      const newVB = [
          vx - dx * scale,
          vy - dy * scale,
          vw,
          vh
      ];
      
      setSvgViewBox(newVB);
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
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

  const containerStyle = { height: typeof height === 'number' ? `${height}px` : height, width: typeof width === 'number' ? `${width}px` : width };

  if (!isClient) return <div style={containerStyle} className="bg-gray-50 flex items-center justify-center border-2 border-gray-200 rounded-xl">Initializing...</div>;

  return (
    <div className="flex flex-col w-full my-6 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-2.5 flex items-center justify-between">
          <div className="flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 m-0 leading-tight">{title || "Excalidraw"}</h3>
              {subtitle && <span className="text-[10px] text-gray-400 mt-0.5 font-medium">{subtitle}</span>}
          </div>
          <div className="opacity-60 hover:opacity-100 transition-opacity">
              <ExcalidrawIcon className="w-5 h-5 text-purple-600" />
          </div>
      </div>

      <div 
        ref={containerRef}
        className={`relative bg-white overflow-hidden select-none group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={containerStyle}
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={svgContainerRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {loading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}

        {/* Frame Label (Slide Mode) */}
        {viewMode === 'slide' && (
            <div className="absolute bottom-4 left-4 z-50 pointer-events-none">
                <span className="px-2 py-1 bg-white/90 backdrop-blur text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200 shadow-sm">
                    {frames[currentSlide]?.name || `Slide ${currentSlide + 1}`}
                </span>
            </div>
        )}
      </div>

      <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex items-center justify-between h-10">
          <div className="w-24">
             <button 
                onClick={() => setViewMode(prev => prev === 'overview' ? 'slide' : 'overview')}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors px-2 py-1 rounded ${viewMode === 'overview' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
             >
                 {viewMode === 'overview' ? 'Slides' : 'Overview'}
             </button>
          </div>

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

          <div className="flex items-center gap-1 w-24 justify-end">
              <button 
                  onClick={() => {
                      syncView();
                  }} 
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded transition-colors text-xs" 
                  title="Reset View"
              >
                  🔄
              </button>
              <button onClick={() => setViewMode('overview')} className="w-7 h-7 flex items-center justify-center hover:bg-red-100 rounded transition-colors text-[10px]" title="Overview">⏹️</button>
          </div>
      </div>
    </div>
  );
}