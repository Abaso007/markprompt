export const fragmentShader = `precision mediump float;
varying vec2 vUv;
varying float uOpacity;
uniform vec3 color1;

void main() {
  vec3 color1 = vec3(56./255., 189./255., 248./255.); // sky-400
  vec3 color2 = vec3(125./255., 211./255., 252./255.); // sky-300
  vec3 color3 = vec3(163./255., 230./255., 53./255.); // lime-400
  vec3 color4 = vec3(190./255., 242./255., 100./255.); // lime-300
  vec3 colorTop = mix(color1, color1, vUv.x);
  vec3 colorBottom = mix(color3, color4, vUv.x);
  vec3 finalColor = mix(colorTop, colorBottom, vUv.y);
  gl_FragColor = vec4(finalColor, uOpacity);
}`;
