@import ./logdepth_pre_vert;

varying vec3 vertex;
void main() {
  vertex = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  @import ./logdepth_post_vert;
}
