uniform vec3 color;
varying float vAlpha;
varying float vDepth;

void main() {
    /*
    float r = 0.0; //, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }*/
//    gl_FragColor = vec4(1, 1, 1, 1.0 );
    gl_FragColor = vec4(1, .65+vDepth*vDepth*.5, .15+vDepth*vDepth*.75, vDepth);
}
