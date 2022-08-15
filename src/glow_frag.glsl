@import ./logdepth_pre_frag;

varying vec3 vertex;
varying vec3 vNormal;
varying vec3 eyeVector;

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
  return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

vec3 brightnessToColor(float b) {
  b *= 0.25;
  return (vec3(b, b * b - 0.05, b * b * b * b)/0.25) * 0.6;
}

void main() {

  // float b = Fresnel(eyeVector, vNormal);
  float b = pow(.5+dot(eyeVector, vNormal),5.);
  vec3 color = brightnessToColor(b*2.);
  gl_FragColor = vec4(color, 1.);

  @import ./logdepth_post_frag;
}
