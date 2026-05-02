var W = 1900, H = 2650;
var doc = app.documents.add(DocumentColorSpace.RGB, W, H);
doc.rulerUnits = RulerUnits.Pixels;
doc.artboards[0].artboardRect = [0, H, W, 0];

function RGB(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
var C = {
  black: RGB(20,20,22), gray: RGB(130,130,135), mid: RGB(170,170,175), light: RGB(222,222,226),
  blue: RGB(70,126,196), paleBlue: RGB(155,203,236), green: RGB(67,184,120), paleGreen: RGB(183,229,196),
  orange: RGB(242,145,34), red: RGB(229,72,73), pink: RGB(242,147,151), purple: RGB(178,142,202),
  teal: RGB(83,178,171), yellow: RGB(238,205,77), cream: RGB(244,225,194), brown: RGB(151,86,95),
  dash: RGB(205,205,208), arrowBlue: RGB(65,115,196)
};
function fontBy(n) { try { return app.textFonts.getByName(n); } catch(e) { return app.textFonts[0]; } }
var F = fontBy("Helvetica"), FB = fontBy("Helvetica-Bold"), FI = F;

function setDash(p) { try { p.strokeDashes = [8, 5]; } catch(e) {} return p; }
function rect(x,y,w,h,fill,stroke,sw,dashed) {
  var p = doc.pathItems.rectangle(H-y, x, w, h);
  p.filled = !!fill; if (fill) p.fillColor = fill;
  p.stroked = !!stroke; if (stroke) { p.strokeColor = stroke; p.strokeWidth = sw || 1; if (dashed) setDash(p); }
  return p;
}
function rr(x,y,w,h,fill,stroke,sw,r,dashed) {
  var p = doc.pathItems.roundedRectangle(H-y, x, w, h, r||8, r||8);
  p.filled = !!fill; if (fill) p.fillColor = fill;
  p.stroked = !!stroke; if (stroke) { p.strokeColor = stroke; p.strokeWidth = sw || 1; if (dashed) setDash(p); }
  return p;
}
function ell(x,y,w,h,fill,stroke,sw) {
  var p = doc.pathItems.ellipse(H-y, x, w, h);
  p.filled = !!fill; if (fill) p.fillColor = fill;
  p.stroked = !!stroke; if (stroke) { p.strokeColor = stroke; p.strokeWidth = sw || 1; }
  return p;
}
function poly(pts,fill,stroke,sw,closed) {
  var p = doc.pathItems.add(), arr = [];
  for (var i=0;i<pts.length;i++) arr.push([pts[i][0], H-pts[i][1]]);
  p.setEntirePath(arr); p.closed = (closed !== false);
  p.filled = !!fill; if (fill) p.fillColor = fill;
  p.stroked = !!stroke; if (stroke) { p.strokeColor = stroke; p.strokeWidth = sw || 1; }
  return p;
}
function line(x1,y1,x2,y2,col,sw,dashed) {
  var p = doc.pathItems.add();
  p.setEntirePath([[x1,H-y1],[x2,H-y2]]);
  p.filled = false; p.stroked = true; p.strokeColor = col || C.black; p.strokeWidth = sw || 1.5;
  if (dashed) setDash(p);
  return p;
}
function arrow(x1,y1,x2,y2,col,sw) {
  line(x1,y1,x2,y2,col||C.black,sw||1.8,false);
  var a = Math.atan2(y2-y1,x2-x1), len = 18, wid = 8;
  var bx = x2 - Math.cos(a)*len, by = y2 - Math.sin(a)*len;
  var px = -Math.sin(a)*wid, py = Math.cos(a)*wid;
  poly([[x2,y2],[bx+px,by+py],[bx-px,by-py]], col||C.black, null, 0, true);
}
function label(txt,x,y,w,h,size,col,align,bold) {
  if (txt === undefined || txt === null || txt === "") txt = " ";
  var p = doc.pathItems.rectangle(H-y, x, Math.max(4,w), Math.max(4,h));
  p.stroked = false; p.filled = false;
  var t = doc.textFrames.areaText(p);
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
function letter(s,x,y) { label(s,x,y,40,42,33,C.black,"left",true); }

var seed = 7;
function srand(s) { seed = s; }
function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
function lerp(a,b,t) { return a + (b-a)*t; }
function mix(c1,c2,t) { return RGB(lerp(c1.red,c2.red,t), lerp(c1.green,c2.green,t), lerp(c1.blue,c2.blue,t)); }

function heatmap(x,y,w,h,rows,cols,scheme,s,blank) {
  srand(s);
  var gap = 1, cw = (w-gap*(cols-1))/cols, ch = (h-gap*(rows-1))/rows;
  var low, high;
  if (scheme === "red") { low = RGB(255,234,218); high = RGB(255,36,22); }
  else if (scheme === "blue") { low = RGB(226,241,255); high = RGB(45,132,198); }
  else if (scheme === "gray") { low = RGB(230,230,230); high = RGB(20,20,22); }
  else if (scheme === "purple") { low = RGB(242,225,232); high = RGB(145,93,108); }
  else { low = RGB(245,230,205); high = RGB(217,173,110); }
  for (var r=0;r<rows;r++) {
    for (var c=0;c<cols;c++) {
      if (blank && r === 3 && c === 2) { rect(x+c*(cw+gap), y+r*(ch+gap), cw, ch, RGB(255,255,255), null, 0); continue; }
      var v = Math.max(0, Math.min(1, rnd()*0.85 + (r===c%rows ? 0.15 : 0)));
      rect(x+c*(cw+gap), y+r*(ch+gap), cw, ch, mix(low, high, v), null, 0);
    }
  }
}
function tissue(x,y,w,h,col,idx) {
  var pts = [[x+20,y+40],[x+45,y+12],[x+92,y+5],[x+150,y+25],[x+180,y+65],[x+164,y+105],[x+118,y+112],[x+78,y+100],[x+36,y+118],[x+14,y+82]];
  var p = poly(pts, col, null, 0, true); p.opacity = 50;
  for (var i=0;i<10;i++) {
    line(x+30+rnd()*120, y+30+rnd()*75, x+45+rnd()*110, y+35+rnd()*70, col, 3, false).opacity = 38;
  }
  rr(x+w-58, y+32, 34, 34, null, C.black, 2, 0, false).rotate(45);
  ell(x-8, y+8, 32, 32, RGB(255,255,255), C.black, 2);
  label(idx, x-2, y+12, 22, 22, 20, C.black, "center", true);
}
function spatialSlide(x,y,w,h,s) {
  srand(s);
  rect(x,y,w,h,RGB(248,248,248),C.light,1);
  for (var i=0;i<70;i++) ell(x+12+rnd()*(w-24), y+12+rnd()*(h-24), 2, 2, RGB(190,190,190), null, 0);
  ell(x+23,y+20,80,80,null,RGB(122,160,206),4);
  for (var j=0;j<22;j++) ell(x+38+rnd()*48, y+34+rnd()*48, 6, 6, RGB(120,120,120), null, 0);
  line(x+95,y+88,x+128,y+124,RGB(170,196,231),9,false).opacity = 72;
  ell(x+118,y+112,30,30,null,RGB(170,196,231),5);
}
function bracket(x,y,h,side) {
  if (side === "left") { line(x+14,y,x,y,C.black,2); line(x,y,x,y+h,C.black,2); line(x,y+h,x+14,y+h,C.black,2); }
  else { line(x-14,y,x,y,C.black,2); line(x,y,x,y+h,C.black,2); line(x,y+h,x-14,y+h,C.black,2); }
}
function plus(x,y) { label("+",x,y,40,42,34,C.gray,"center",false); }
function eq(x,y) { label("=",x,y,35,36,34,C.gray,"center",false); }
function times(x,y) { label("x",x,y,35,36,34,C.gray,"center",false); }

// Panel a
letter("a", 2, 2);
label("Tissue sections", 70, 25, 210, 34, 25, C.black, "center", false);
label("Gene expr\n(Xr: nr x p)", 575, 22, 160, 62, 24, C.black, "center", true);
label("Bio effects\n(Zr: nr x q)", 775, 22, 160, 62, 24, C.black, "center", true);
label("Spatial dep & batch\neffects\n(Vr: nr x q)", 1010, 10, 230, 78, 22, C.black, "center", true);
label("Loading\n(W: p x q)", 1370, 22, 160, 62, 24, C.black, "center", true);
label("Error term\n(er: nr x q)", 1605, 22, 190, 62, 24, C.black, "center", true);
rect(60, 110, 210, 520, null, C.dash, 2, true);
var tys = [135, 315, 535], cols = [RGB(248,172,85), RGB(129,205,224), RGB(164,55,68)], ids = ["1","2","M"];
for (var tr=0; tr<3; tr++) {
  tissue(80, tys[tr], 180, 120, cols[tr], ids[tr]);
  spatialSlide(350, tys[tr], 135, 135, 50+tr);
  line(235, tys[tr]+50, 350, tys[tr], C.mid, 1);
  line(235, tys[tr]+75, 350, tys[tr]+135, C.mid, 1);
  line(485, tys[tr]+55, 575, tys[tr]+35, C.gray, 1.5, true);
  line(485, tys[tr]+82, 575, tys[tr]+95, C.gray, 1.5, true);
}
label("...", 145, 420, 50, 60, 34, C.black, "center", true);
label("...", 390, 420, 50, 60, 34, C.black, "center", true);

rect(1320, 120, 185, 500, null, C.dash, 2, true);
for (var rrw=0; rrw<3; rrw++) {
  var y0 = tys[rrw];
  heatmap(575, y0, 115, 115, 6, 5, rrw===1 ? "blue" : (rrw===2 ? "purple" : "tan"), 100+rrw, true);
  eq(700, y0+46);
  bracket(758, y0, 115, "left"); heatmap(800, y0, 100, 115, 6, 4, "red", 120+rrw, false);
  plus(940, y0+42);
  heatmap(1060, y0, 100, 115, 6, 4, rrw===1 ? "blue" : (rrw===2 ? "purple" : "tan"), 140+rrw, false); bracket(1215, y0, 115, "right");
  times(1248, y0+42);
  if (rrw === 1) heatmap(1335, y0+12, 150, 75, 3, 5, "red", 155, false);
  plus(1530, y0+42);
  heatmap(1605, y0, 110, 115, 6, 5, "gray", 180+rrw, false);
}
label("...", 620, 420, 50, 60, 34, C.black, "center", true);
label("...", 840, 420, 50, 60, 34, C.black, "center", true);
label("...", 1100, 420, 50, 60, 34, C.black, "center", true);
label("...", 1650, 420, 50, 60, 34, C.black, "center", true);

rect(315, 665, 480, 160, null, C.dash, 2, true);
label("Gaussian mixture model", 330, 680, 270, 30, 24, C.black, "left", false);
label("zri | yri = k ~ N(mk, Sk)", 345, 716, 250, 25, 18, C.black, "left", false);
var gmcols=[C.green,C.red,C.orange,C.blue,C.purple,C.teal];
for (var gi=0;gi<6;gi++) { ell(360+gi*58+(gi%2)*18, 755+(gi%3)*18, 55, 32, gmcols[gi], null, 0).opacity=62; }
label("Potts model", 635, 680, 145, 30, 24, C.black, "center", false);
var nx=705, ny=748; for (var ni=0;ni<7;ni++) ell(nx+Math.cos(ni)*45, ny+Math.sin(ni)*35, 26, 26, RGB(255,255,255), RGB(150,175,200), 1.5);
line(nx+13,ny+13,nx+52,ny+45,RGB(150,175,200),1); line(nx+13,ny+13,nx-25,ny+45,RGB(150,175,200),1); line(nx+13,ny+13,nx+13,ny-35,RGB(150,175,200),1);
label("yri", nx-2, ny+2, 35, 20, 12, C.black, "center", false); label("br", nx+40, ny-20, 32, 18, 12, C.black, "center", false);

rect(900, 685, 190, 140, null, C.dash, 2, true);
label("Coordinates", 915, 705, 160, 35, 24, C.black, "center", false);
heatmap(930, 755, 130, 55, 3, 6, "tan", 201, false);
heatmap(930, 785, 130, 28, 1, 6, "blue", 202, false);
label("...", 980, 768, 40, 35, 24, C.black, "center", true);

rect(1205, 665, 360, 160, null, C.dash, 2, true);
label("Intrinsic CAR model", 1270, 650, 220, 32, 24, C.black, "center", false);
label("vri | v[rn]\\i ~ N(mri, m-1ri Psi r)", 1235, 690, 295, 28, 16, C.black, "center", false);
for (var cp=0;cp<3;cp++) {
  var sx=1265+cp*95; var sy=730;
  rect(sx,sy,75,60,RGB(230,230,40),null,0);
  for (var k=0;k<7;k++) line(sx+5, sy+8+k*7, sx+70, sy+6+k*7, cp===0?C.black:RGB(120,120,40), 2);
}
rect(1300, 795, 110, 15, RGB(30,30,30), null, 0); rect(1410, 795, 110, 15, RGB(240,230,0), null, 0);
label("Low", 1320, 815, 45, 18, 15, C.black, "center", false); label("High", 1485, 815, 55, 18, 15, C.black, "center", false);
line(855, 650, 855, 708, C.arrowBlue, 3.5); arrow(855, 708, 790, 708, C.arrowBlue, 3.5);
line(1115, 650, 1115, 708, C.arrowBlue, 3.5); arrow(1115, 708, 1220, 708, C.arrowBlue, 3.5);
arrow(900, 660, 795, 660, C.green, 3);
arrow(1090, 660, 1205, 660, C.green, 3);

// Panel b
letter("b", 0, 890);
label("Uncorrected", 400, 915, 230, 35, 28, C.black, "center", false);
label("Corrected", 1180, 915, 220, 35, 28, C.black, "center", false);
function clusterPlot(x,y,w,h,corrected,s) {
  srand(s); rect(x,y,w,h,RGB(255,255,255),C.black,1);
  var centers = corrected ? [[95,70],[235,70],[390,100],[120,235],[300,210],[395,170],[470,245]] : [[95,70],[220,62],[415,70],[105,250],[260,205],[370,120],[455,230]];
  var labels = ["Cluster 1","Cluster 2","Cluster 3","Cluster 4","Cluster 5","Cluster 6","Cluster 7"];
  var marks = ["square","circle","star"], cols2=[C.blue,C.orange,C.green,C.pink,C.teal,C.red,RGB(220,220,240)];
  for (var ci=0;ci<centers.length;ci++) {
    var cx=x+centers[ci][0], cy=y+centers[ci][1];
    for (var bg=0;bg<3;bg++) { ell(cx-44-bg*16, cy-36-bg*13, 88+bg*32, 72+bg*26, RGB(235,235,235), null,0).opacity=40-bg*8; }
    label(labels[ci], cx-45, cy-62, 90, 18, 13, C.gray, "center", false);
    for (var pi=0;pi<5;pi++) {
      var px=cx+(rnd()-.5)*(corrected?70:130), py=cy+(rnd()-.5)*(corrected?58:100), col=cols2[ci%cols2.length], m=marks[(pi+ci)%3];
      if (m==="square") rect(px-8,py-8,16,16,col,null,0);
      else if (m==="circle") ell(px-8,py-8,16,16,col,null,0);
      else label("*",px-10,py-13,20,20,24,col,"center",true);
    }
  }
  if (corrected) {
    rect(x+w-68,y,68,h,RGB(250,250,250),C.black,1);
    label("Cell type",x+w-62,y+10,55,18,12,C.black,"center",false);
    for (var lg=0;lg<6;lg++) rect(x+w-45,y+35+lg*24,18,18,cols2[lg],null,0);
    line(x+w-68,y+170,x+w,y+170,C.black,1);
    label("Dataset",x+w-62,y+185,55,18,12,C.black,"center",false);
    ell(x+w-45,y+212,18,18,C.teal,null,0); rect(x+w-45,y+240,18,18,C.teal,null,0); label("*",x+w-48,y+264,22,22,22,C.teal,"center",true);
  }
}
clusterPlot(230, 970, 560, 325, false, 310);
clusterPlot(1030, 970, 610, 325, true, 330);
poly([[795,1110],[980,1110],[980,1065],[1060,1132],[980,1200],[980,1155],[795,1155]], C.paleBlue, RGB(235,240,30), 3, true);
label("PRECAST", 800, 1038, 170, 34, 27, RGB(140,205,120), "center", true);
line(1290,1295,1290,1360,C.arrowBlue,4); line(250,1360,1705,1360,C.arrowBlue,4); arrow(1705,1360,1765,1360,C.arrowBlue,4);
label("Others", 1770, 1345, 120, 34, 25, C.black, "left", false);
var appXs=[70,500,930,1370], appTitles=["Combined cluster analysis","Combined DE analysis","Conditional SVA","Combined Trajectory inference"];
for (var ai=0;ai<4;ai++) {
  arrow(appXs[ai]+180,1360,appXs[ai]+180,1408,C.arrowBlue,4);
  label(appTitles[ai],appXs[ai],1415,360,34,23,C.black,"center",false);
  rect(appXs[ai],1460,360,190,RGB(255,255,255),C.gray,2);
}
function tissueMapBox(x,y,type,s) {
  srand(s);
  for (var m=0;m<3;m++) {
    var bx=x+20+m*105, by=y+35;
    for (var k=0;k<90;k++) {
      var px=bx+rnd()*88, py=by+rnd()*110;
      var col = type===0 ? [C.blue,C.green,C.red,RGB(220,220,230),C.orange][Math.floor(rnd()*5)] :
                type===2 ? mix(C.green,C.red,rnd()) : mix(RGB(240,190,150), RGB(255,92,35), rnd());
      ell(px,py,2.2,2.2,col,null,0);
    }
  }
}
tissueMapBox(70,1460,0,401);
heatmap(510,1470,250,165,24,18,"red",420,false);
rect(770,1490,30,110,RGB(230,0,210),null,0); rect(770,1490,30,25,RGB(230,230,0),null,0); label("Expression\nHigh\n\n\nLow",810,1485,100,110,17,C.black,"left",true);
tissueMapBox(930,1460,2,430); rect(1068,1620,120,20,C.green,null,0); rect(1188,1620,120,20,C.red,null,0); label("Expression",960,1615,100,20,16,C.black,"left",true); label("Low",1080,1640,45,18,13,C.black,"center",false); label("High",1255,1640,50,18,13,C.black,"center",false);
tissueMapBox(1370,1460,3,440); rect(1510,1620,80,20,RGB(230,205,180),null,0); rect(1590,1620,80,20,RGB(255,75,30),null,0); label("Pseudotime",1400,1615,120,20,16,C.black,"left",true); label("0",1520,1640,30,18,13,C.black,"center",false); label("0.5",1584,1640,40,18,13,C.black,"center",false); label("1",1655,1640,30,18,13,C.black,"center",false);

// Panel c
letter("c", 18, 1718);
label("Scenario 1", 320, 1735, 250, 35, 28, C.black, "center", false);
label("Scenario 2", 1000, 1735, 250, 35, 28, C.black, "center", false);
label("Scenario 3", 1560, 1735, 250, 35, 28, C.black, "center", false);
var methodColors=[C.red,C.blue,C.orange,C.green,C.pink,C.teal,RGB(205,205,215),C.yellow,RGB(80,160,215)];
function facet(x,y,w,h,title,yLab,s,highlight) {
  srand(s);
  rect(x,y,w,h,RGB(255,255,255),C.mid,1);
  rect(x,y,w,24,RGB(220,220,220),C.mid,1);
  label(title,x,y+5,w,16,13,C.black,"center",false);
  if (yLab) label(yLab,x-62,y+48,58,70,16,C.black,"center",false);
  for (var gl=1; gl<4; gl++) line(x+gl*w/4,y+28,x+gl*w/4,y+h,C.light,0.8);
  for (var m=0;m<9;m++) {
    var cx=x+18+m*(w-36)/8;
    var base=y+40+rnd()*(h-65);
    var amp=(m===highlight?38:14)*(.75+rnd()*.5);
    var fill=methodColors[m]; var pts=[];
    for (var t=0;t<8;t++) { var yy=y+35+t*(h-55)/7; var wd=Math.sin(Math.PI*t/7)*amp*(0.3+rnd()*0.5); pts.push([cx+wd,yy]); }
    for (var t2=7;t2>=0;t2--) { var yy2=y+35+t2*(h-55)/7; var wd2=Math.sin(Math.PI*t2/7)*amp*(0.3+rnd()*0.5); pts.push([cx-wd2,yy2]); }
    var v=poly(pts,fill,C.gray,0.8,true); v.opacity=78;
    for (var d=0; d<3; d++) ell(cx-2+rnd()*4, base-10+rnd()*20, 3, 3, C.black, null, 0).opacity=65;
  }
}
function scenarioGrid(x,y,w,rowsOnly,s0) {
  var cellW = rowsOnly ? 230 : 210, cellH = 145, gap = 8;
  var cols = rowsOnly ? 1 : 3, titles=["Low","Middle","High"], labs=["F1\nscore","CCor","ARI"];
  for (var r=0;r<3;r++) {
    for (var c=0;c<cols;c++) facet(x+c*(cellW+gap), y+r*(cellH+gap), cellW, cellH, titles[c], c===0?labs[r]:"", s0+r*10+c, r===0?0:0);
  }
}
scenarioGrid(70,1785,660,false,600);
scenarioGrid(810,1785,660,false,700);
scenarioGrid(1510,1785,230,true,800);
label("Method",1510,2250,90,22,14,C.black,"left",true);
var names=["PRECAST","Seurat V3","Harmony","fastMNN","Scanorama","scGen","scVI","MEFISTO","PASTE"];
for (var mi=0; mi<names.length; mi++) { rect(1515,2275+mi*22,14,14,methodColors[mi],C.gray,0.3); label(names[mi],1535,2270+mi*22,120,22,13,C.black,"left",false); }

var outDir = new Folder("/Users/wenlinli/Downloads/Proj/Grant/flowchart_output");
if (!outDir.exists) outDir.create();
var aiFile = new File(outDir.fsName + "/precast_recreated.ai");
var saveOpts = new IllustratorSaveOptions();
saveOpts.compatibility = Compatibility.ILLUSTRATOR17;
doc.saveAs(aiFile, saveOpts);
var pngFile = new File(outDir.fsName + "/precast_recreated.png");
var ex = new ExportOptionsPNG24();
ex.antiAliasing = true; ex.transparency = false; ex.artBoardClipping = true; ex.horizontalScale = 100; ex.verticalScale = 100;
doc.exportFile(pngFile, ExportType.PNG24, ex);
"Done: " + aiFile.fsName + " | " + pngFile.fsName;
