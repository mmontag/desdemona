@import ./logdepth_pre_frag;
@import ./noise;

uniform float time;
uniform float progress;
uniform float distance;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;
float PI = 3.1415926535;

float fbm(vec4 p) {
  float sum = 0.;
  float amp = 0.3;
  float scale = 1.;

  for (int i = 0; i < 8; i++) {
    sum += snoise(p * scale) * amp;
    p.w += 100.;
    amp *= 0.8;
    scale *= 2.0;
  }
  return sum;
}

vec3 brightnessToColor(float b) {
  b *= 0.25;
  return (vec3(b, b * b - 0.05, b * b * b * b)/0.25) * 0.6;
}

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
  return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

void main() {

  vec4 p = vec4(vPosition*3., time*0.005);
  float b = max(fbm(p), 0.);

// Gain intensity as camera moves away
  float dGain = 9e8 / distance;

//   vec4 p1 = vec4(vPosition*3., time*0.01) * 0.1;
//   float spots = max(snoise(p1), 0.);
//   b = max(b - spots, 0.);

  float fres = pow(Fresnel(eyeVector, vNormal), min(0.6,dGain));
  b += fres * .5;

  vec3 color = brightnessToColor(b * 4. + 1.);
//   gl_FragColor = vec4(noisy, noisy, noisy, 1.);
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.;
  @import ./logdepth_post_frag;
}
