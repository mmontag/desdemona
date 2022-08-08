@import ./logdepth_pre_frag;

varying vec3 vertex;
uniform float logDist;
uniform float intensity;
float rand(float n){return fract(sin(n) * 43758.5453123);}
float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float thicknessFactor = 3.7;
float gridIntensity = 0.33;
void main() {
  vec2 coord = vertex.xz;

  // Noisy Sampling - bad attempt at anisotropic filtering
  // coord += rand(coord) * fwidth(coord) * vec2(0.5, 0.5);

  float color = 0.0;
  vec2 grid = vec2(1.0,1.0);
  int levels = 3;
  for (int i = 0; i < levels; i++) {
    float unit = pow(10.0, float(i-1));
    float thickness = 1.0 / (thicknessFactor-float(i));
    grid = abs(fract(coord * unit - 0.5) - 0.5) / fwidth(coord * unit * 0.5) * thickness;
    float line = min(grid.x, grid.y);
    float col = 1.0 - min(line, 1.0);
    // Cheap conditional: same branch for all fragments.
    if (i == levels - 1) {
       // Fade out the smallest grid subdivision.
       col *= pow(fract(1.0-logDist), 2.0);
    }
    color += col;
  }

  // Apply gamma correction
  color = pow(color, 1.0 / 2.2);
  gl_FragColor = vec4(vec3(1.0), color * intensity);

  @import ./logdepth_post_frag;
}
