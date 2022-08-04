#ifdef USE_LOGDEPTHBUF
	uniform float logDepthBufFC;
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
	#endif
#endif

varying vec3 vertex;
void main() {
  vertex = position;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  #ifdef USE_LOGDEPTHBUF
    gl_Position.z = log2(max( 0.000001, gl_Position.w + 1.0 )) * logDepthBufFC;
    #ifdef USE_LOGDEPTHBUF_EXT
      vFragDepth = 1.0 + gl_Position.w;
    #else
      gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;
    #endif
  #endif
}
