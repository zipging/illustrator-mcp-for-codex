// Example ExtendScript for recoloring selected Illustrator objects.
// Run through the `illustrator_eval_js` MCP tool.

var colors = {
  spatialBlue: [79, 120, 155],
  molecularGreen: [95, 142, 101],
  clinicalOrange: [179, 122, 50],
  atlasOlive: [155, 140, 53],
  softSpatialBlue: [226, 237, 248],
  softMolecularGreen: [231, 239, 229],
  softClinicalOrange: [250, 239, 219],
  softAtlasYellow: [253, 250, 229]
};

function rgb(values) {
  var c = new RGBColor();
  c.red = values[0];
  c.green = values[1];
  c.blue = values[2];
  return c;
}

function setSelectionStroke(values, width) {
  if (app.documents.length === 0) {
    return "No document.";
  }
  var doc = app.activeDocument;
  var c = rgb(values);
  var count = 0;
  for (var i = 0; i < doc.selection.length; i++) {
    try {
      doc.selection[i].stroked = true;
      doc.selection[i].strokeColor = c;
      if (width !== undefined) {
        doc.selection[i].strokeWidth = width;
      }
      count++;
    } catch (e) {}
  }
  return "Updated " + count + " selected item(s).";
}

setSelectionStroke(colors.spatialBlue, 1.2);
