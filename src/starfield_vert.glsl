attribute float alpha;
varying float vAlpha;
// calculate depth for alpha
varying float vDepth;
uniform float farplane;
uniform float size;

void main() {
//    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    // calculate depth for alpha
    vDepth = clamp(pow(farplane / gl_Position.z, 2.0), 0.1, 1.0); // / farplane;
    gl_PointSize = max(1.0, 20.0*size/gl_Position.z);
}
