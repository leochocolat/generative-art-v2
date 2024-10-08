// Varyings
varying vec2 vUv;
varying vec3 vNormal;
varying vec4 vPosition;

void main() {
    vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    pos.xyz /= pos.w;

    vUv = uv;
    vNormal = normal;
    vPosition = pos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}