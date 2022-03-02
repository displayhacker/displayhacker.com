function mouseClicked() {
  if (++gradientColorIndex > 3)
    gradientColorIndex = 0;
  
  resetGradients();
  t = 0;
}

function initGradients() {
  gradientValues = new Array(gradientResolution);
  gradientColors = new Array(gradientOptionCount);
  gradientColors[0] = [ color('#000000'), color('#FF8000'), color('#FFFF80'), color('#FFFFFF'), color('#0080FF'), color('#000080'), color('#000000') ];
  gradientColors[1] = [ color('#000000'), color('#8000FF'), color('#FF80FF'), color('#FFFFFF'), color('#80FF00'), color('#008000'), color('#000000') ];
  gradientColors[2] = [ color('#FFFFE0'), color('#FDC453'), color('#EBA32B'), color('#302008'), color('#DE8C0E'), color('#F4B242'), color('#FFFFE0') ];
  gradientColors[3] = [ color('#004020'), color('#FFFFFF'), color('#20C080'), color('#000000'), color('#80C020'), color('#FFFFFF'), color('#004020') ];
  resetGradients();
}

function resetGradients() {
  var selectedGradientColors = gradientColors[gradientColorIndex];
  var gradientColorsMax = gradientColorCount - 1;
  var colorcanvasSize = 0;
  var colorcanvasSizeMax = floor(Number(gradientResolution) / Number(gradientColorsMax));
  var colorIndex = 0;
  var previousColorIndex = 0;
  for (var i = 0; i < gradientResolution; ++i) {
    var percent = Number(i) / Number(gradientResolution);
    var colorIndex = floor(percent * gradientColorsMax);
    if (colorIndex > previousColorIndex) {
      previousColorIndex = colorIndex;
      colorcanvasSize = 0;
    }
    var color1 = selectedGradientColors[colorIndex];
    var color2 = selectedGradientColors[colorIndex + 1];
    if (++colorcanvasSize > colorcanvasSizeMax) {
      colorcanvasSize = colorcanvasSizeMax;
    }
    var inter = colorcanvasSize / colorcanvasSizeMax;
    var gradientColor = lerpColor(color1, color2, inter);
    gradientValues[i] = gradientColor;
  }
}

function shapeData(x, y, index, ratio, angle, canvasSize) {
  this.IsRect = false;
  this.Index = index;
  this.Ratio = ratio;
  this.Angle = angle;
  this.canvasSize = canvasSize;
  this.Offset = this.IsRect ? 0 : canvasSize / 2;
  this.X = x + this.Offset - halfCanvasSize;
  this.Y = y + this.Offset - halfCanvasSize;
  this.GetColor = function(hueIncrement) {
    var gradientColorIndex = floor((hueIncrement * this.Angle) % gradientResolution);
    var fillColor = gradientValues[gradientColorIndex];
    return fillColor;
  }
  this.Draw = function(hueIncrement) {
    fill(this.GetColor(hueIncrement));
    if (this.IsRect)
      rect(this.X, this.Y, this.canvasSize, this.canvasSize);
    else
      ellipse(this.X, this.Y, this.canvasSize, this.canvasSize);
  }
}

function setup() {
  createCanvas(512, 512);
  frameRate(30);
  colorMode(RGB, 1);
  noStroke();
  smooth(0);
  initGradients();
}

var PHI = 0.5 + 0.5 * Math.sqrt(5);
var GOLDEN_ANGLE = 2 * Math.PI * PHI;

var minShapeCount = 1024;
var maxShapeCount = 2048;
var shapeCountIncrement = 1;
var shapeCountIncrementSign = -1;
var shapeCount = 2048;
var canvasSize = 512;
var halfCanvasSize = canvasSize * 0.5;
var canvasArea = halfCanvasSize * halfCanvasSize * Math.PI;



var gradientResolution = 4096;
var gradientColorCount = 7;
var gradientOptionCount = 4;

var gradientValues;
var gradientColors;
var gradientColorIndex = 0;
var t = 0;
var tIncrement = 1 / 30;

function draw() {
  background(gradientValues[0]);
  translate(halfCanvasSize, halfCanvasSize);
  rotate(t * -0.1);
  var scaleValue = ((sin(t) + 1) / 2) + 1.1;
  
  shapeCount += (shapeCountIncrement * shapeCountIncrementSign);
  if (shapeCount > maxShapeCount) {
    shapeCount = maxShapeCount;
    shapeCountIncrementSign = -1;
  } else if (shapeCount < minShapeCount) {
    shapeCount = minShapeCount;
    shapeCountIncrementSign = 1;
  }
  
  var cumulativeArea = 0;
  //var deviation = 1;
  //var deviation = (cos(t) + 1) / 2.0;
  var deviation = ((cos(t) + 1) / 2) + 1.1;
  var meanArea = canvasArea / shapeCount;
  var minArea = meanArea * (1 - deviation);
  var maxArea = meanArea * (1 + deviation);
  var diffArea = maxArea - minArea;
  for (var i = 0; i < shapeCount; ++i) {
    var ratio = i / shapeCount;
    var angle = i * GOLDEN_ANGLE;
    var area = minArea + (ratio * diffArea);
    var diameter = 2 * sqrt(area / PI);
    var canvasSize = diameter * scaleValue;
    cumulativeArea += area;
    var radius = sqrt(cumulativeArea / PI);
    var offset = halfCanvasSize - (canvasSize * 0.5);
    var x = (cos(angle) * radius) + offset;
    var y = (sin(angle) * radius) + offset;
    var shape = new shapeData(x, y, i, ratio, angle, canvasSize);
    shape.Draw(t);
  }
  t += tIncrement;
}
