varying vec3 vertex;

void main() {
  // Pick a coordinate to visualize in a grid
  vec2 coord = vertex.xz;
  // vec2 coord = localPos.xy; // * vec2(8, 8);

  // Compute anti-aliased world-space grid lines
  // coord.x = coord.x + sin(coord.x) / 10.0;
  vec2 grid1 = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  vec2 grid2 = abs(fract((coord/10.0) - 0.5) - 0.5) / fwidth(coord / 10.0);
  vec2 grid3 = abs(fract((coord/100.0) - 0.5) - 0.5) / fwidth(coord / 100.0);

  float line1 = min(grid1.x, grid1.y) / 0.65;
  float line2 = min(grid2.x, grid2.y) / 1.25;
  float line3 = min(grid3.x, grid3.y) / 2.0;
  float line = min( min(line1, line2), line3);

  // Just visualize the grid lines directly
  float color = 1.0 - min(line, 1.0);

  // Apply gamma correction
  color = pow(color, 1.0 / 2.2);
  gl_FragColor = vec4(vec3(color), 0.5);
}
