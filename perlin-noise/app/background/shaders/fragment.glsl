precision highp float;

#define PI 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679

uniform float u_time;
uniform vec3 u_mouse_position;

varying vec3 v_position;
varying float v_pattern;
varying float v_smooth_pattern;
varying vec3 v_final_color;

void main(){
    gl_FragColor=vec4(v_final_color,1.0);
}
