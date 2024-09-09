// Varyings
varying vec2 vUv;

// Uniforms
uniform float uTime;
uniform float uSpeed;
uniform vec2 uNoiseScale;

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec3 rain(vec2 fragCoord)
{
	fragCoord.x -= mod(fragCoord.x, 1.0 / uNoiseScale.x);
    //fragCoord.y -= mod(fragCoord.y, 16.);
    
    float offset = sin(fragCoord.x * 1005.0);

    float speed = cos(fragCoord.x * 3.0) * 0.3 + 0.7;
   
    float y = fract(vUv.y + uTime * uSpeed + offset);

    return vec3(0.1, 1, 0.35) / (y * 20.0);
}

void main() {
	float time = uTime * uSpeed;

	vec2 uv = vUv;
	uv *= 10.0;

	vec3 r = rain(gl_FragCoord.xy);

	gl_FragColor = vec4(vec3(r.r), 1.0);
}