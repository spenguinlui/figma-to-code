/**
 * Figma Design-mode right-panel extractor.
 *
 * Inject into a Figma tab (https://www.figma.com/design/...) where a node
 * is selected. Returns whatever properties are visible in the right panel.
 *
 * Usage from Chrome MCP:
 *   const code = readFileSync("scripts/figma-dom-extract.js", "utf8");
 *   await javascript_tool({tabId, text: code + "\nfigmaExtract()"});
 *
 * Notes / limitations on free Starter plan:
 *  - Fill is shown by name only (e.g. "Dark Gray"); hex requires clicking the
 *    color swatch to expand. Not handled here — caller must hover/click if needed.
 *  - Corner radius "Mixed" means 4 different values; click expand to read each.
 *    Currently returns the literal string "Mixed".
 *  - Auto-layout padding/gap visible only when the selected node uses auto-layout.
 *  - Text properties (font/size/weight/letter-spacing) only shown when a TEXT
 *    node is selected.
 */
function figmaExtract() {
    const result = {
        nodeName: null,
        variant: {},
        position: {},
        layout: {},
        appearance: {},
        fills: [],
        strokes: [],
        effects: [],
        text: {},
        autoLayout: {},
        _allInputs: {},
    }

    // 1. Selected node name (top of right panel) — usually a text node showing layer name
    const titleEl = document.querySelector(
        '.right_panel--inspectPanelContainer h2, .panel_title--panelTitle--zUhAR, [class*="panelTitle"]'
    )
    if (titleEl) result.nodeName = titleEl.textContent.trim()

    // 2. All inputs with values; label = self aria-label OR closest ancestor aria-label
    document.querySelectorAll("input").forEach((inp) => {
        if (!inp.value || inp.value === "on") return
        let label = inp.getAttribute("aria-label")
        if (!label) {
            let n = inp.parentElement
            for (let i = 0; i < 6 && n; i++) {
                const a = n.getAttribute("aria-label")
                if (a) {
                    label = a
                    break
                }
                n = n.parentElement
            }
        }
        if (label) result._allInputs[label] = inp.value
    })

    // 3. Bucket inputs into structured fields
    const get = (k) => result._allInputs[k]
    result.position = {
        x: get("X-position"),
        y: get("Y-position"),
        rotation: get("Rotation"),
    }
    result.layout = {
        width: get("Width"),
        height: get("Height"),
    }
    result.appearance = {
        opacity: get("Opacity"),
        cornerRadius: get("Corner radius"),
    }
    // Variant properties — input aria starting with "Edit property value for"
    Object.entries(result._allInputs).forEach(([k, v]) => {
        const m = k.match(/^Edit property value for (.+)$/)
        if (m) result.variant[m[1]] = v
    })

    // 4. Fill / Stroke — Figma shows the swatch + name. We grab name + the
    //    swatch's background-color (which Figma sets inline on a small div).
    function readPaintRows(sectionLabel) {
        const out = []
        // Find the section header
        const headers = Array.from(
            document.querySelectorAll('h3, h4, [class*="sectionTitle"], [class*="SectionTitle"]')
        ).filter((h) => h.textContent && h.textContent.trim() === sectionLabel)
        for (const h of headers) {
            const section = h.closest('[class*="section"], [class*="Section"]') || h.parentElement
            if (!section) continue
            // Each row likely has a swatch (small div with bg color) + a name
            section.querySelectorAll("div[style]").forEach((swatch) => {
                const bg = swatch.style.backgroundColor || swatch.style.background
                const w = swatch.offsetWidth
                const h2 = swatch.offsetHeight
                if (bg && w > 10 && w < 30 && h2 > 10 && h2 < 30) {
                    // Find adjacent name text
                    let name = null
                    let p = swatch.parentElement
                    for (let i = 0; i < 4 && p; i++) {
                        const t = (p.textContent || "").trim()
                        if (t && t.length < 60) {
                            name = t
                            break
                        }
                        p = p.parentElement
                    }
                    out.push({ swatch: bg, name })
                }
            })
        }
        return out
    }
    result.fills = readPaintRows("Fill")
    result.strokes = readPaintRows("Stroke")
    result.effects = readPaintRows("Effects")

    // 5. Auto-layout: padding + gap. These show when node uses auto-layout.
    //    Inputs are typically labeled "Horizontal padding", "Vertical padding",
    //    "Gap between items", "Padding left/top/right/bottom" (mixed mode).
    const autoFields = [
        "Horizontal padding",
        "Vertical padding",
        "Padding top",
        "Padding bottom",
        "Padding left",
        "Padding right",
        "Gap between items",
        "Horizontal gap between items",
        "Vertical gap between items",
    ]
    autoFields.forEach((k) => {
        const v = get(k)
        if (v != null) result.autoLayout[k] = v
    })

    // 6. Text properties (only when text node selected)
    const textFields = [
        "Font family",
        "Font size",
        "Font weight",
        "Line height",
        "Letter spacing",
        "Text align",
        "Paragraph spacing",
    ]
    textFields.forEach((k) => {
        const v = get(k)
        if (v != null) result.text[k] = v
    })

    return result
}

// Auto-call when injected without explicit invocation
if (typeof window !== "undefined" && !window.__figma_extract_loaded__) {
    window.__figma_extract_loaded__ = true
    window.figmaExtract = figmaExtract
}
