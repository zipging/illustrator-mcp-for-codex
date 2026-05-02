# Figure Recreation Prompt

Use this prompt when you already have a reference PNG and want Codex to recreate it in Illustrator.

```text
Use the Illustrator MCP to recreate this reference image as a clean, editable Illustrator figure.

Deliverables:
- A `.png` preview exported from Illustrator.
- The generation/recreation script if you used one.
- Save an editable Illustrator working file locally only if the user asks for it.

Visual requirements:
- Recreate the panel layout, visual hierarchy, color palette, and main content.
- Draw vector equivalents for boxes, arrows, plots, heatmaps, icons, legends, and diagrams.
- Do not use the original PNG as the final artwork.
- You may search online for vector-style assets, but simplify or redraw them if that gives a cleaner final figure.

Layout constraints:
- Use fixed text boxes and stable coordinates.
- Text must not collide with text, arrows, borders, icons, plots, or panel frames.
- Arrows must not run through labels or important shapes.
- Arrowheads should clearly point to their target and stop before touching text.
- Keep labels and formulas legible. Add line breaks for long labels.
- Keep consistent margins inside every panel.
- Use a grid for dense multi-panel figures.

Quality-control pass:
- Export a PNG preview.
- Open or inspect the PNG.
- Fix every visible overlap, clipped label, awkward arrow, and text-border collision.
- Only deliver after the preview is clean enough for final handoff.
```
