@import ./logdepth_pre_vert;

uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;

uniform vec2 pixels;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normal;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  eyeVector = normalize(worldPosition.xyz - cameraPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  @import ./logdepth_post_vert;
}
