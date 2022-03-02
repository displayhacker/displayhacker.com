const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 512;
const T_INCREMENT = 0.003;
const GRADIENT_RESOLUTION = 256;
const GRADIENT_COLOR_COUNT = 7;

var gl;
var programInfo;
var mouseX = 0.5;
var mouseY = 0.5;
var clientMouseX = 0.5;
var clientMouseY = 0.5;
var t = Math.sqrt(2);
var clickToggle = true;
var doc;

$
	(
		() => {
			doc = $(document);
			doc
				.mousemove(
					(event) => {
						if (!clickToggle)
                            return;

						clientMouseX = event.clientX;
                        clientMouseY = event.clientY;
                        mouseX = clientMouseX / doc.width();
						mouseY = clientMouseY / doc.height();
					}
				)
			;
			doc
				.click(
					(event) => {
						clickToggle = !clickToggle;
					}
				)
			;
			initializeWebGL();
		}
	)
;

function tick() {
	var timeoutFunction =
		() => {
            $('#mouse-controls-cell').text(clickToggle ? 'enabled' : 'disabled');
            $('#x-value-cell').text(clientMouseX);
			$('#y-value-cell').text(clientMouseY);
			$('#x-max-cell').text(doc.width());
			$('#y-max-cell').text(doc.height());
			$('#x-percent-cell').text((Math.round(mouseX * 10000) / 100).toString() + '%');
			$('#y-percent-cell').text((Math.round(mouseY * 10000) / 100).toString() + '%');
			
            if (!clickToggle)
                t += T_INCREMENT;

			gl.uniform1f(programInfo.uniformLocations.t, t);
            gl.uniform2f(programInfo.uniformLocations.mouse, mouseX, mouseY);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
			tick();
		}
	;
	setTimeout(timeoutFunction, 1000 / 60);
}

function Color(r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
}

function getGradientColors() {
	const gradientColors =
		[
			new Color(0x00, 0x00, 0x00),
			new Color(0xFF, 0x80, 0x00),
			new Color(0xFF, 0xFF, 0x80),
			new Color(0xFF, 0xFF, 0xFF),
			new Color(0x00, 0x80, 0xFF),
			new Color(0x00, 0x00, 0x80),
			new Color(0x00, 0x00, 0x00)
		]
	;
	var gradientColorsMax = GRADIENT_COLOR_COUNT - 1;
	var colorSize = 0;
	var colorSizeMax = Math.floor(Number(GRADIENT_RESOLUTION) / Number(gradientColorsMax));
	var colorIndex = 0;
	var previousColorIndex = 0;
	var gradientColorArray = new Float32Array(GRADIENT_RESOLUTION * 3);
	for (var i = 0; i < GRADIENT_RESOLUTION; ++i) {
		var percent = Number(i) / Number(GRADIENT_RESOLUTION);
		var colorIndex = Math.floor(percent * gradientColorsMax);
		if (colorIndex > previousColorIndex) {
			previousColorIndex = colorIndex;
			colorSize = 0;
		}
		var color1 = gradientColors[colorIndex];
		var color2 = gradientColors[colorIndex + 1];
		if (++colorSize > colorSizeMax) {
			colorSize = colorSizeMax;
		}
		var inter = colorSize / colorSizeMax;
		var gradientColor = lerpColor(color1.r, color1.g, color1.b, color2.r, color2.g, color2.b, inter);
		var index = i * 3;
		gradientColorArray[index] = gradientColor.r;
		gradientColorArray[index + 1] = gradientColor.g;
		gradientColorArray[index + 2] = gradientColor.b;
	}
	return gradientColorArray;
}

function lerpColor(ar, ag, ab, br, bg, bb, amount) { 
	var r = (ar + amount * (br - ar)) / 0xFF;
	var g = (ag + amount * (bg - ag)) / 0xFF;
	var b = (ab + amount * (bb - ab)) / 0xFF;
	
	return { r: r, g: g, b: b };
}

function initializeWebGL() {
	gl = $('#canvas-element').get(0).getContext('webgl');
	if (!gl) {
		alert('Your browser does not support WebGL, this page cannot do anything.');
		return;
	}
	
	const fragmentShaderSource = $('#fragment-shader-source').text();
	const vertexShaderSource = $('#vertex-shader-source').text();
	const shaderProgram = initShaderProgram(fragmentShaderSource, vertexShaderSource);
	if (shaderProgram == null)
	{
		console.log('shaderProgram is null.');
		return;
	}
	
	programInfo =
		{
			program: shaderProgram,
			attribLocations: {
				position: gl.getAttribLocation(shaderProgram, 'a_position'),
				textureCoordinates: gl.getAttribLocation(shaderProgram, 'a_textureCoordinates')
			},
			uniformLocations: {
				resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
				gradientColors: gl.getUniformLocation(shaderProgram, 'u_gradientColors'),
				t: gl.getUniformLocation(shaderProgram, 'u_t'),
                mouse: gl.getUniformLocation(shaderProgram, 'u_mouse')
			}
		}
	;
	
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	setRectangle(gl, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	const textureCoordinatesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
	setRectangle(gl, 0, 0, 1, 1);
	
	gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(shaderProgram);
	
	gl.enableVertexAttribArray(programInfo.attribLocations.position);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(programInfo.attribLocations.position, 2, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(programInfo.attribLocations.textureCoordinates);
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
	gl.vertexAttribPointer(programInfo.attribLocations.textureCoordinates, 2, gl.FLOAT, false, 0, 0);
	
	gl.uniform2f(programInfo.uniformLocations.resolution, CANVAS_WIDTH, CANVAS_HEIGHT);
	var gradientColors = getGradientColors();
	gl.uniform3fv(programInfo.uniformLocations.gradientColors, gradientColors);
	
	tick();
}
			
function setRectangle(gl, x1, y1, width, height) {
	var x2 = x1 + width;
	var y2 = y1 + height;
	gl
		.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(
				[
					x1, y1,
					x2, y1,
					x1, y2,
					x1, y2,
					x2, y1,
					x2, y2,
				]
			),
			gl.STATIC_DRAW
		)
	;
}

function initShaderProgram(fragmentShaderSource, vertexShaderSource) {
	// Load the shaders
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	
	// Create the shader program; attach and link the shaders
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, fragmentShader);
	gl.attachShader(shaderProgram, vertexShader);
	gl.linkProgram(shaderProgram);
	
	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	
	return shaderProgram;
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	
	// Send the source to the shader object
	gl.shaderSource(shader, source);
	
	// Compile the shader program
	gl.compileShader(shader);
	
	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}