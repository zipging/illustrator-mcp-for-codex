# GPT Image to Illustrator Prompt

Use this workflow when you want to first generate a polished raster concept with an image model, then ask Codex to rebuild it as vector artwork.

## Image Model Prompt

```text
Create a high-resolution scientific figure concept suitable for later vector recreation in Adobe Illustrator.

Requirements:
- Clean white background.
- Clear multi-panel layout.
- High contrast, legible labels, and simple shapes.
- Avoid tiny unreadable text.
- Avoid photorealistic textures unless essential.
- Use schematic vector-like icons, plots, arrows, legends, and diagrams.
- Leave enough space around every label and arrow.
- Make the composition publication-ready.
```

## Codex + Illustrator Prompt

```text
Use the attached GPT Image reference as a visual blueprint. Recreate it in Adobe Illustrator with the Illustrator MCP.

Important:
- Treat the image as a reference, not as final artwork.
- Rebuild the figure using editable Illustrator vector objects.
- Replace raster-like assets with clean vector equivalents.
- Search the web for vector-style assets if useful, or draw simplified versions yourself.
- Preserve the intended scientific story and layout.
- Export a `.png` preview. Save an editable Illustrator working file locally only if requested.
- Inspect the PNG preview and fix all text collisions, arrow issues, and clipped labels before delivery.
```
