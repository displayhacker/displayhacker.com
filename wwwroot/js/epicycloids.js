// See http://mathworld.wolfram.com/Epicycloid.html for more info
// NOTE: Click anywhere while this is running to cycle between the four available options
"use strict";

// Data structures
function Point(x, y)
{
    this.X = x;
    this.Y = y;
}

// Members
var k = 0; // Increment value
var kIncrement = 0.0005; // Bigger = faster, smaller = slower
var kIncrementSlow = kIncrement / 5; 
var pointTotal = 128; // Number of lines to draw each frame
var circleStartPoints = new Array(pointTotal); // Used to save the inital circle points
var squareStartPoints = new Array(pointTotal); // Used to save the inital square points
var triangleStartPoints = new Array(pointTotal); // Used to save the inital triangle points
var diamondStartPoints = new Array(pointTotal); // Used to save the inital diamond points
var canvasSize = 512; // Edge of the square
var radius = 256; // Radius of the circle
// 0 = circle, circle;      1 = circle, square;    2 = circle, triangle;  3 = circle, diamond;
// 4 = square, square;      5 = square, circle;    6 = square, triangle;  7 = square, diamond;
// 8 = triangle, triangle;  9 = triangle, circle; 10 = triangle, sqaure; 11 = triangle, diamond;
//12 = diamond, diamond;   13 = diamond, circle;  14 = diamond, square;  15 = diamond, triangle;
var optionIndex = 0;
var oneSixth =      1 / 6; // 0.1666
var oneQuarter =    1 / 4; // 0.25
var oneThird =      1 / 3; // 0.3333
var oneHalf =       1 / 2; // 0.5
var twoThirds =     2 / 3; // 0.6666
var threeQuarters = 3 / 4; // 0.75
var fiveSixths =    5 / 6; // 0.8333
var log = true;

// Maths
function getDiamondPoint(sector, scale) {
  var x, y, ratio;
  if (sector < oneQuarter) {
    // Start x: 0
    // Start y: radius
    // End x:   radius
    // End y:   0
    ratio = sector / oneQuarter;
    x = radius * ratio;
    y = radius - (radius * ratio);
    if (log) {
      console.log('0/4 - x:' + x + '; y:' + y + ';\n');
    }
  } else if (sector < oneHalf) {
    // Start x: radius
    // Start y: 0
    // End x:   canvasSize - 1
    // End y:   radius
    ratio = (sector - oneQuarter) / oneQuarter;
    x = radius + (radius * ratio);
    y = radius * ratio;
    if (log) {
      console.log('1/4 - x:' + x + '; y:' + y + ';\n');
    }
  } else if (sector < threeQuarters) {
    // Start x: canvasSize - 1
    // Start y: radius
    // End x:   radius
    // End y:   canvasSize - 1
    ratio = (sector - oneHalf) / oneQuarter;
    x = canvasSize - (radius * ratio);
    y = (radius * ratio) + radius;
    if (log) {
      console.log('2/4 - x:' + x + '; y:' + y + ';\n');
    }
  } else {
    // Start x: radius
    // Start y: canvasSize - 1
    // End x:   0
    // End y:   radius
    ratio = (sector - threeQuarters) / oneQuarter;
    x = radius - (radius * ratio);
    y = canvasSize - (radius * ratio);
    if (log) {
      console.log('3/4 - x:' + x + '; y:' + y + ';\n');
    }
  }
  
  var diamondPoint = new Point(x, y);
  return diamondPoint;
}

function getTrianglePoint(sector, scale) {
  var x, y, ratio;
  if (sector < oneThird) {
    ratio = sector / oneThird;
    x = (canvasSize / 2) * ratio;
    y = canvasSize - (canvasSize * ratio);
  } else if (sector < twoThirds) {
    ratio = (sector - oneThird) / oneThird;
    x = ((canvasSize / 2) * ratio) + (canvasSize / 2);
    y = (canvasSize - 1) * ratio;
  } else {
    x = ((sector - twoThirds) / oneThird) * canvasSize;
    y = canvasSize - 1;
  }
  
  var trianglePoint = new Point(x, y);
  return trianglePoint;
}

function getCirclePoint(radian, scale) {
  // Get an equally-spaced point along the edge of a circle
  var x = scale * cos(radian) + radius;
  var y = scale * sin(radian) + radius;
  
  // Create the point and return it
  var circlePoint = new Point(x, y);
  return circlePoint;
}

function getSquarePoint(sector, scale) {
  // Get an equally-spaced point along the edge of a square
  // Can this be simplified by max(abs(x), abs(y)) = size, or similar?
  // See http://polymathprogrammer.com/2010/03/01/answered-can-you-describe-a-square-with-1-equation/ for more information
  var x, y;
  if (sector < oneQuarter) {
    x = (sector / oneQuarter) * scale;
    y = 0;
  }
  else if (sector < oneHalf) {
    x = canvasSize - 1;
    y = ((sector - oneQuarter) / oneQuarter) * scale;
  }
  else if (sector < threeQuarters) {
    x = canvasSize - (((sector - oneHalf) / oneQuarter) * scale) - 1;
    y = canvasSize - 1;
  }
  else
  {
    x = 0;
    y = canvasSize - (((sector - threeQuarters) / oneQuarter) * scale) - 1;
  }
  
  // Create the point and return it
  var squarePoint = new Point(x, y);
  return squarePoint;
}

// Setup
function setup() {
  // Size, color, etc.
  createCanvas(512, 512);
  stroke(0x60, 0x20, 0xC0);
  smooth(2);
  
  // Pre-calculate values, for each point in pointTotal...
  for (var i = 0; i < pointTotal; ++i) {
    // Get the values needed to create the start points
    var sector = i / pointTotal;
    var radian = sector * TWO_PI;
    
    // Calculate and save the start points
    circleStartPoints[i] = getCirclePoint(radian, radius);
    squareStartPoints[i] = getSquarePoint(sector, canvasSize);
    triangleStartPoints[i] = getTrianglePoint(sector, canvasSize);
    diamondStartPoints[i] = getDiamondPoint(sector, canvasSize);
  }
}


// Draw
function draw() {
  // Re-draw every frame
  background(0);
  log = false;
  
  // Draw the lines, for each point in pointTotal...
  for (var i = 0; i < pointTotal; ++i) {
    var startPoint;
    var endPoint;
    
    // Get the point to draw the line from
    switch (optionIndex) {
      case 0:
      case 1:
      case 2:
      case 3:
        // Circle start point
        startPoint = circleStartPoints[i];
        break;
      case 4:
      case 5:
      case 6:
      case 7:
        // Square start point
        startPoint = squareStartPoints[i];
        break;
      case 8:
      case 9:
      case 10:
      case 11:
        // Triangle start point
        startPoint = triangleStartPoints[i];
        break;
      case 12:
      case 13:
      case 14:
      case 15:
        // Diamond start point
        startPoint = diamondStartPoints[i];
        break;
    }
    
    // Get the point to draw the line to
    switch (optionIndex) {
      case 0:
      case 5:
      case 9:
      case 13:
        // Circle end point
        var radian = k * i;
        endPoint = getCirclePoint(radian, radius);
        break;
      case 1:
      case 4:
      case 10:
      case 14:
        // Square end point
        var sector = (k * i) % 1;
        endPoint = getSquarePoint(sector, canvasSize);
        break;
      case 2:
      case 6:
      case 8:
      case 15:
        // Triangle end point
        var sector = (k * i) % 1;
        endPoint = getTrianglePoint(sector, canvasSize);
        break;
      case 3:
      case 7:
      case 11:
      case 12:
        // Diamond end point
        var sector = (k * i) % 1;
        endPoint = getDiamondPoint(sector, canvasSize);
        break;
    }
    
    // Draw the line
    line(startPoint.X, startPoint.Y, endPoint.X, endPoint.Y);
  }
  
  // Increment the line position, needs 2 speeds to look right
  switch (optionIndex) {
    case 0:
    case 5:
    case 9:
    case 13:
      k += kIncrement;
      break;
    default:
      k += kIncrementSlow;
      break;
  }
}

function mouseClicked() {
  // Reset the incrementor to zero
  k = 0;
  
  // Increment the option index
  ++optionIndex;
  
  // Reset the option index if it is out of range
  if (optionIndex > 15)
    optionIndex = 0;
  
  // Change the line color
  switch (optionIndex) {
    case 0:
      stroke(0x60, 0x20, 0xC0);
      break;
    case 1:
      stroke(0x60, 0xC0, 0x20);
      break;
    case 2:
      stroke(0x20, 0x60, 0xC0);
      break;
    case 3:
      stroke(0x20, 0xC0, 0x20);
      break;
    case 4:
      stroke(0xC0, 0x20, 0x60);
      break;
    case 5:
      stroke(0xC0, 0x60, 0x20);
      break;
      
    case 6:
      stroke(0xA0, 0xE0, 0x40);
      break;  
    case 7:
      stroke(0xA0, 0x40, 0xE0);
      break;
    case 8:
      stroke(0xE0, 0xA0, 0x40);
      break;
    case 9:
      stroke(0xE0, 0x40, 0xA0);
      break;
    case 10:
      stroke(0x40, 0xA0, 0xE0);
      break;
    case 11:
      stroke(0x40, 0xE0, 0xA0);
      break;
      
    case 12:
      stroke(0x80, 0xC0, 0xE0);
      break;  
    case 13:
      stroke(0xE0, 0xC0, 0x80);
      break;  
    case 14:
      stroke(0xC0, 0xA0, 0x80);
      break;  
    case 15:
      stroke(0xC0, 0x80, 0xA0);
      break;
  }
}