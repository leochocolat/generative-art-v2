// Varyings
varying vec2 vUv;
varying vec3 vNormal;

// Uniforms
uniform float uStrokeWidth;
uniform float uStrokeSmoothness;

void main() {
	// Bottom left
	vec2 bl = step(vec2(uStrokeWidth),vUv);

	// Bottom Right
	vec2 tr = step(vec2(uStrokeWidth),1.0-vUv);
	
	float strokes = 1.0 - bl.x * bl.y * tr.x * tr.y;
	// strokes = smoothstep(1.0, , strokes);

	// gl_FragColor = vec4(vUv.x, vUv.x, vUv.x, 1.0);
	gl_FragColor = vec4(vec3(strokes), 1.0);
}