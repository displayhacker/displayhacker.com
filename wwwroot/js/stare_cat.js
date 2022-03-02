var rotation = 0;
var rotationIncrement = 0.001;
var canvasSize = 512;
var translateValue = canvasSize / 2;
var scaleMin = Math.round(canvasSize * 1.414);
var scaleMax = Math.round(canvasSize * 2.818);
var pixelCount = canvasSize * canvasSize;
var scaleIncrement = 2;
var scaleSteps;
var scaleIndex = 0;
var scaleSignIsPositive = true;
var stareCatImage;
var scaleValues = new Array();

function setup() {
  createCanvas(512, 512);
  background(0);
  stareCatImage = loadImage("/img/StareCat.png");
  var i = 0;
  for (var scale = scaleMin; scale <= scaleMax; scale += scaleIncrement) {
    scaleValues.push(scale);
    ++i;
  }
  scaleSteps = i - 1;
}

function draw() {
  loadPixels();
  for (var i = 0; i < pixels.length; ++i) {
    var colorValue = pixels[i] - 0x000080;
    if (colorValue >= 0) {
      continue;
    }
    var r = (colorValue & 0xFF0000) >> 16;
    var g = (colorValue & 0x00FF00) >> 8;
    var b = colorValue & 0x0000FF;
    switch ("BRG") {
      case "RGB":
        colorValue = (r << 16) | (g << 8) | b;
        break;
      case "RBG":
        colorValue = (r << 16) | (b << 8) | g;
        break;
      case "BGR":
        colorValue = (b << 16) | (g << 8) | r;
        break;
      case "BRG": // Good
        colorValue = (b << 16) | (r << 8) | g;
        break;
      case "GBR": // Good
        colorValue = (g << 16) | (b << 8) | r;
        break;
      case "GRB":
        colorValue = (g << 16) | (r << 8) | b;
        break;
    }
    pixels[i] = colorValue;
  }
  updatePixels();
  
  //filter(BLUR, 1);
  
  translate(translateValue, translateValue);
  
  rotate(rotation);
  rotation += rotationIncrement;
  
  tint(255, 8);
  var scaleValue = scaleValues[scaleIndex];
  var imageOffset = round(0.5 * (canvasSize - scaleValue)) - translateValue;
  image(stareCatImage, imageOffset, imageOffset, scaleValue, scaleValue);
  
  if (scaleSignIsPositive) {
    scaleIndex += scaleIncrement;
    if (scaleIndex >= scaleSteps) {
      scaleIndex = scaleSteps;
      scaleSignIsPositive = false;
    }
  } else {
    scaleIndex -= scaleIncrement;
    if (scaleIndex <= 0) {
      scaleIndex = 0;
      scaleSignIsPositive = true;
      //println(frameRate);
    }
  }
}
