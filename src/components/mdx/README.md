# Excalidraw Component for MDX

This component renders an interactive Excalidraw view within MDX content. It fetches snapshot data, renders it as an SVG using `@excalidraw/excalidraw`, and provides interactive features like panning, zooming, and a slide mode for navigating specific frames.

## Workflow

1.  **Data Fetching**:
    *   Fetches Excalidraw data from a provided `snapshotUrl`.
    *   Supports both standard JSON and LZString compressed JSON (commonly used by the Obsidian Excalidraw plugin).
    *   Parses the data and normalizes element properties (e.g., remapping font families to ensure consistency).

2.  **Rendering**:
    *   Utilizes the `exportToSvg` function from the `@excalidraw/excalidraw` package to generate a high-fidelity SVG representation of the drawing.
    *   Injects custom font definitions specified in `excalidraw.config.toml` to ensure text renders correctly.
    *   Wraps the SVG in a responsive container that handles layout and sizing.

3.  **Interaction & View Modes**:
    *   **Overview Mode**: The default mode, displaying the entire drawing canvas scaled to fit the container.
    *   **Slide Mode**: Focuses on specific "Frame" elements defined in the Excalidraw drawing. This effectively turns the drawing into a presentation deck.
    *   **Navigation**: When in Slide Mode, users can cycle through frames using next/previous controls.

4.  **Controls**:
    *   **Pan & Zoom**: Users can drag with the mouse to pan the view and use the mouse wheel to zoom in and out. This is achieved by directly manipulating the SVG's `viewBox` attribute.
    *   **Reset**: A button to instantly restore the view to the default state for the current mode (fitting the whole canvas in Overview, or the current frame in Slide Mode).
    *   **View Toggle**: A toggle switch to move between Overview and Slide modes.

## Principles

*   **Client-Side Rendering (CSR)**: The component relies on the `@excalidraw/excalidraw` library, which is a heavy client-side dependency. Therefore, the rendering logic is wrapped in `useEffect` hooks and checks for `isClient` to prevent hydration mismatches and server-side errors.
*   **Performance**: View updates (panning, zooming, transitions) are handled using `requestAnimationFrame` for smooth 60fps animations. Direct DOM manipulation of the SVG `viewBox` is used instead of React state for high-frequency updates during drag/zoom to avoid unnecessary re-renders of the React component tree.
*   **Resilience**: The data loading logic includes fallbacks for different data formats (compressed vs. raw JSON) and error handling to ensure the component doesn't crash the page if the data is malformed.
