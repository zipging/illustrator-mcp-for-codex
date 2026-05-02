var W = 1800, H = 2350;
var doc = app.documents.add(DocumentColorSpace.RGB, W, H);
doc.rulerUnits = RulerUnits.Pixels;
doc.artboards[0].artboardRect = [0, H, W, 0];

function RGB(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
var C = {
  black: RGB(20, 20, 22),
  gray: RGB(145, 145, 150),
  light: RGB(228, 228, 232),
  cyan: RGB(140, 224, 226),
  paleCyan: RGB(198, 242, 242),
  green: RGB(178, 246, 156),
  blue: RGB(132, 190, 241),
  cream: RGB(255, 246, 202),
  magenta: RGB(231, 45, 216),
  royal: RGB(30, 30, 255),
  purple: RGB(176, 120, 210),
  orange: RGB(255, 145, 35),
  red: RGB(235, 30, 38),
  teal: RGB(45, 151, 139)
};

function fontBy(n) { try { return app.textFonts.getByName(n); } catch(e) { return app.textFonts[0]; } }
var F = fontBy("Helvetica"), FB = fontBy("Helvetica-Bold");

function rect(x, y, w, h, fill, stroke, sw) {
  var p = doc.pathItems.rectangle(H - y, x, w, h);
  p.filled = !!fill; if (fill) p.fillColor = fill;
  p.stroked = !!stroke; if (stroke) { p.strokeColor = stroke; p.strokeWidth = sw || 1; }
  return p;
}
function roundRect(x, y, w, h, fill, stroke, sw, r) {
  var p = doc.pathItems.roundedRectangle(H - y, x, w, h, r || 8, r || 8);
  p.filled = !!fill; if (fill) p.fillColor = fill;
  p.stroked = !!stroke; if (stroke) { p.strokeColor = stroke; p.strokeWidth = sw || 1; }
  return p;
}
function ellipse(x, y, w, h, fill, stroke, sw) {
  var p = doc.pathItems.ellipse(H - y, x, w, h);
  p.filled = !!fill; if (fill) p.fillColor = fill;
  p.stroked = !!stroke; if (stroke) { p.strokeColor = stroke; p.strokeWidth = sw || 1; }
  return p;
}
function poly(pts, fill, stroke, sw, closed) {
  var p = doc.pathItems.add(), arr = [];
  for (var i = 0; i < pts.length; i++) arr.push([pts[i][0], H - pts[i][1]]);
  p.setEntirePath(arr); p.closed = (closed !== false);
  p.filled = !!fill; if (fill) p.fillColor = fill;
  p.stroked = !!stroke; if (stroke) { p.strokeColor = stroke; p.strokeWidth = sw || 1; }
  return p;
}
function line(x1, y1, x2, y2, col, sw) {
  var p = doc.pathItems.add();
  p.setEntirePath([[x1, H - y1], [x2, H - y2]]);
  p.filled = false; p.stroked = true; p.strokeColor = col || C.black; p.strokeWidth = sw || 2;
  return p;
}
function arrow(x1, y1, x2, y2, col, sw) {
  line(x1, y1, x2, y2, col || C.black, sw || 2);
  var a = Math.atan2(y2 - y1, x2 - x1), len = 18, wid = 8;
  var bx = x2 - Math.cos(a) * len, by = y2 - Math.sin(a) * len;
  var px = -Math.sin(a) * wid, py = Math.cos(a) * wid;
  poly([[x2, y2], [bx + px, by + py], [bx - px, by - py]], col || C.black, null, 0, true);
}
function label(txt, x, y, w, h, size, col, align, bold) {
  if (txt === undefined || txt === null || txt === "") txt = " ";
  var path = doc.pathItems.rectangle(H - y, x, Math.max(4, w), Math.max(4, h));
  path.stroked = false; path.filled = false;
  var t = doc.textFrames.areaText(path);
  t.contents = txt;
  var tr = t.textRange;
  tr.characterAttributes.textFont = bold ? FB : F;
  tr.characterAttributes.size = size;
  tr.characterAttributes.leading = size * 1.16;
  tr.characterAttributes.fillColor = col || C.black;
  if (align === "center") tr.paragraphAttributes.justification = Justification.CENTER;
  else if (align === "right") tr.paragraphAttributes.justification = Justification.RIGHT;
  else tr.paragraphAttributes.justification = Justification.LEFT;
  return t;
}

var seed = 3;
function srand(s) { seed = s; }
function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

function umapBlob(cx, cy, w, h, s, scale) {
  srand(s);
  var cols = [RGB(143,211,232), RGB(234,155,178), RGB(173,214,121), RGB(255,210,105), RGB(181,150,210), RGB(244,128,86), RGB(111,190,183), RGB(210,210,210), RGB(130,170,225), RGB(241,190,220)];
  scale = scale || 1;
  for (var c = 0; c < 14; c++) {
    var angle = rnd() * Math.PI * 2, rad = rnd() * 0.52;
    var x = cx + Math.cos(angle) * w * rad * 0.5;
    var y = cy + Math.sin(angle) * h * rad * 0.5;
    var col = cols[Math.floor(rnd() * cols.length)];
    var cloud = ellipse(x - 16 * scale, y - 10 * scale, 42 * scale, 28 * scale, col, null, 0);
    cloud.opacity = 18 + rnd() * 18;
    for (var i = 0; i < 8; i++) {
      var ox = (rnd() - 0.5) * 38 * scale, oy = (rnd() - 0.5) * 28 * scale;
      var e = ellipse(x + ox, y + oy, (3 + rnd() * 6) * scale, (3 + rnd() * 6) * scale, col, null, 0);
      e.opacity = 28 + rnd() * 40;
    }
  }
}

function singleCellIcon(x, y) {
  var body = poly([[x+15,y+45],[x+55,y+18],[x+96,y+32],[x+124,y+75],[x+82,y+65],[x+43,y+88]], RGB(151,168,214), null, 0, true);
  body.opacity = 78;
  ellipse(x+52, y+42, 34, 22, RGB(80,92,124), null, 0).opacity = 72;
  ellipse(x+59, y+45, 20, 12, RGB(210,220,236), null, 0).opacity = 80;
}

function wedge(cx, cy, r, a0, a1, fill) {
  var pts = [[cx, cy]];
  var n = Math.max(3, Math.ceil(Math.abs(a1 - a0) / 0.10));
  for (var i = 0; i <= n; i++) {
    var a = a0 + (a1 - a0) * i / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  var p = poly(pts, fill, RGB(255,255,255), 1, true);
  return p;
}

// Panel letters and main separators
label("a", 0, 0, 45, 45, 33, C.black, "left", true);
label("Self-supervised large-scale pretraining", 180, 4, 720, 42, 30, C.black, "center", false);
label("Fine-tuning with limited task-specific data", 980, 4, 780, 42, 30, C.black, "center", false);
line(930, 30, 930, 1030, C.black, 3);

// Panel A: pretraining
label("Genecorpus-30M", 25, 390, 255, 42, 28, C.black, "left", false);
umapBlob(150, 555, 300, 240, 10, 1.0);
label("Self-supervised\npretraining", 300, 470, 225, 72, 26, C.black, "center", false);
arrow(330, 555, 520, 555, C.black, 2.1);
rect(565, 455, 210, 205, null, C.black, 2);
label("Pretrained\nGeneformer", 585, 518, 170, 84, 27, C.black, "center", false);
label("Copy\nweights", 795, 490, 130, 70, 26, C.black, "center", false);
arrow(795, 455, 885, 410, C.black, 2);
arrow(795, 555, 885, 555, C.black, 2);
arrow(795, 660, 875, 710, C.black, 2);
label("Democratize\nfundamental\nunderstanding of\nnetwork dynamics\nto vast array of\ndownstream\napplications", 620, 745, 280, 250, 24, C.black, "center", false);

// Panel A: fine-tuning
umapBlob(1085, 105, 150, 120, 30, 0.55);
label("Limited task-specific\ndata for task 1", 1170, 78, 360, 72, 28, C.black, "left", false);
arrow(1085, 180, 1085, 285, C.black, 2);
label("Fine-tuning", 1108, 205, 190, 38, 26, C.black, "left", false);
rect(985, 305, 210, 205, null, C.black, 2);
label("Model for\nfine-tuning\ntask 1", 1008, 360, 165, 100, 27, C.black, "center", false);
roundRect(1215, 305, 34, 205, null, C.royal, 2, 5);
label("Fine-tuning\nlayer for\ntask 1", 1265, 302, 210, 116, 27, C.black, "left", false);
arrow(1265, 435, 1455, 435, C.black, 2);
label("Task 1\npredictions", 1480, 405, 250, 70, 28, C.black, "left", false);

label("...", 1080, 565, 70, 34, 26, C.black, "center", true);
rect(985, 660, 210, 205, null, C.black, 2);
label("Model for\nfine-tuning\ntask N", 1008, 715, 165, 100, 27, C.black, "center", false);
roundRect(1215, 660, 34, 205, null, C.magenta, 2, 5);
label("Fine-tuning\nlayer for\ntask N", 1265, 660, 210, 116, 27, C.black, "left", false);
arrow(1265, 790, 1455, 790, C.black, 2);
label("Task N\npredictions", 1480, 760, 250, 70, 28, C.black, "left", false);
umapBlob(1085, 965, 150, 120, 31, 0.55);
label("Limited task-specific\ndata for task N", 1170, 930, 390, 72, 27, C.black, "left", false);
arrow(1085, 920, 1085, 865, C.black, 2);
label("Fine-tuning", 1108, 890, 190, 38, 26, C.black, "left", false);

// Panel B
label("b", 0, 1070, 45, 45, 33, C.black, "left", true);
label("Tissue representation of Genecorpus-30M", 610, 1085, 600, 40, 28, C.black, "center", false);
line(90, 1160, 1040, 1160, C.black, 2);
line(1040, 1160, 1085, 1210, C.black, 2);

var col1 = "Placenta\nAdrenal\nUnlabelled\nPancreas\nAirway\nCord blood\nSpleen\nThymus\nLymph node";
var col2 = "Prostate\nSmall intestine\nAdipose\nEndothelial\nBone\nPluripotent\nIntestine, NOS\nYolk sac\nMuscle";
var col3 = "Breast\nLymphatic\nTonsil\nBladder\nStomach\nEmbryo\nNasal\nEar";
var col4 = "Decidua\nBone marrow\nOesophagus\nSkin\nEye\nTestis\nLarge\nintestine";
label(col1, 20, 1190, 230, 320, 27, C.black, "center", false);
label(col2, 270, 1190, 270, 320, 27, C.black, "center", false);
label(col3, 555, 1190, 230, 285, 27, C.black, "center", false);
label(col4, 760, 1230, 245, 270, 22, C.black, "center", false);

var pcx = 1180, pcy = 1360, pr = 215;
var vals = [20,13,10,9,6,5,4,4,4,3,3,3,2,2,2,1.5,1.5,1.2,1,1,1,1,1,1];
var pcols = [RGB(159,203,224), RGB(39,132,190), RGB(177,221,140), RGB(43,164,45), RGB(255,139,139), RGB(235,24,30), RGB(255,190,101), RGB(255,130,20), RGB(198,180,213), RGB(112,63,156), RGB(255,252,128), RGB(188,102,38), RGB(141,207,233), RGB(43,136,188), RGB(86,190,82), RGB(255,112,112), RGB(255,172,28), RGB(120,91,205), RGB(210,95,143), RGB(55,170,175), RGB(236,185,96), RGB(186,98,178), RGB(87,190,198), RGB(245,88,55)];
var total = 0; for (var pv = 0; pv < vals.length; pv++) total += vals[pv];
var ang = -Math.PI/2;
for (var wi = 0; wi < vals.length; wi++) { var next = ang + vals[wi] / total * Math.PI * 2; wedge(pcx, pcy, pr, ang, next, pcols[wi]); ang = next; }
label("Brain", 1325, 1165, 160, 36, 27, C.black, "left", false);
label("Immune", 1385, 1340, 150, 36, 27, C.black, "left", false);
label("Liver", 1315, 1515, 120, 36, 27, C.black, "left", false);
label("Heart", 1115, 1575, 95, 36, 27, C.black, "center", false);
label("Lung", 1005, 1570, 90, 36, 27, C.black, "center", false);
label("Kidney", 910, 1530, 120, 36, 27, C.black, "center", false);

// Panel C
label("c", 0, 1640, 45, 45, 33, C.black, "left", true);
label("Rank value encoding", 295, 1640, 360, 40, 28, C.black, "center", false);
label("Transformer encoder unit", 760, 1660, 470, 40, 28, C.black, "center", false);
singleCellIcon(70, 1810);
label("Single-cell\ntranscriptome", 0, 1910, 200, 72, 26, C.black, "center", false);
arrow(225, 1955, 285, 1955, C.black, 2);
arrow(335, 1835, 335, 1768, C.black, 2);
label("Ranked\ngenes", 286, 1865, 105, 80, 25, C.black, "center", false);
var genes = ["Gene T", "Gene H", "Gene Y", "...", "Gene A", "Gene Z", "Gene L"];
var gy = [1715, 1784, 1853, 1920, 1992, 2061, 2130];
for (var gi = 0; gi < genes.length; gi++) {
  if (genes[gi] === "...") label("...", 383, gy[gi]+8, 70, 30, 28, C.black, "center", true);
  else { roundRect(380, gy[gi], 170, 50, C.cyan, C.black, 2, 5); label(genes[gi], 393, gy[gi]+10, 145, 24, 27, C.black, "center", false); }
}
arrow(560, 1955, 635, 1955, C.black, 2);
roundRect(650, 1715, 585, 370, RGB(255,255,255), C.black, 2, 5);
roundRect(680, 1740, 150, 310, C.green, C.black, 2, 5); label("Self\nattention", 700, 1865, 110, 70, 24, C.black, "center", false);
roundRect(850, 1740, 55, 310, C.cream, C.black, 2, 5); label("Layer\nnorm.", 852, 1870, 51, 58, 15, C.black, "center", false);
arrow(930, 1955, 990, 1955, C.black, 2);
roundRect(990, 1740, 150, 310, C.blue, C.black, 2, 5); label("Feed-\nforward\nneural\nnetwork", 1012, 1825, 105, 135, 21, C.black, "center", false);
roundRect(1160, 1740, 55, 310, C.cream, C.black, 2, 5); label("Layer\nnorm.", 1162, 1870, 51, 58, 15, C.black, "center", false);
label("x6", 920, 2098, 80, 36, 27, C.black, "center", false);
arrow(1265, 1815, 1360, 1765, C.black, 2);
label("Contextual gene\nand cell embeddings", 1380, 1735, 360, 70, 26, C.black, "left", false);
arrow(1265, 1955, 1360, 1955, C.black, 2);
label("Contextual\nattention weights", 1380, 1924, 330, 70, 26, C.black, "left", false);
arrow(1265, 2085, 1350, 2135, C.black, 2);
label("Contextual\npredictions", 1380, 2110, 300, 70, 26, C.black, "left", false);

var outDir = new Folder("/Users/wenlinli/Downloads/Proj/Grant/flowchart_output");
if (!outDir.exists) outDir.create();
var aiFile = new File(outDir.fsName + "/geneformer_recreated.ai");
var saveOpts = new IllustratorSaveOptions();
saveOpts.compatibility = Compatibility.ILLUSTRATOR17;
doc.saveAs(aiFile, saveOpts);
var pngFile = new File(outDir.fsName + "/geneformer_recreated.png");
var ex = new ExportOptionsPNG24();
ex.antiAliasing = true; ex.transparency = false; ex.artBoardClipping = true; ex.horizontalScale = 100; ex.verticalScale = 100;
doc.exportFile(pngFile, ExportType.PNG24, ex);
"Done: " + aiFile.fsName + " | " + pngFile.fsName;
