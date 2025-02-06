precision highp float;

#define PI 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679

uniform float u_time;
uniform vec3 u_mouse_position;

varying vec3 v_position;
varying float v_pattern;
varying float v_smooth_pattern;
varying vec3 v_final_color;

/*
* SMOOTH MOD
* - authored by @charstiles -
* based on https://math.stackexchange.com/questions/2491494/does-there-exist-a-smooth-approximation-of-x-bmod-y
* (axis) input axis to modify
* (amp) amplitude of each edge/tip
* (rad) radius of each edge/tip
* returns => smooth edges
*/

float smoothMod(float axis,float amp,float rad){
    float top=cos(PI*(axis/amp))*sin(PI*(axis/amp));
    float bottom=pow(sin(PI*(axis/amp)),2.)+pow(rad,2.);
    float at=atan(top/bottom);
    return amp*(1./2.)-(1./PI)*at;
}

/*
* Simplex 3D Noise
* by Ian McEwan, Stefan Gustavson (https://github.com/stegu/webgl-noise)
*/
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    
    vec3 x1=x0-i1+1.*C.xxx;
    vec3 x2=x0-i2+2.*C.xxx;
    vec3 x3=x0-1.+3.*C.xxx;
    
    i=mod(i,289.);
    vec4 p=permute(permute(permute(
    i.z+vec4(0.,i1.z,i2.z,1.))
    +i.y+vec4(0.,i1.y,i2.y,1.))
    +i.x+vec4(0.,i1.x,i2.x,1.));
    
    vec4 j=p-49.*floor(p*(1./7.)*(1./7.));
    vec4 x_=floor(j*(1./7.));
    vec4 y_=floor(j-7.*x_);
    vec4 x=x_*(1./7.)+(1./14.);
    vec4 y=y_*(1./7.)+(1./14.);
    vec4 h=1.-abs(x)-abs(y);
    
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;
    p1*=norm.y;
    p2*=norm.z;
    p3*=norm.w;
    
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(){

    vec3 modulated_u_mouse_position=vec3(
        0.1,
        0.0,
        0.1
    );
    
    vec3 modulated_position = position + modulated_u_mouse_position;
    
    float zoom=1./350.;
    float consistency=.5;
    float noise=snoise((modulated_position+u_time)*zoom)*consistency;
    v_pattern=noise;
    
    float density=1.35;
    v_smooth_pattern=smoothMod(v_pattern*density,.35,.5);
    
    vec3 black=vec3(0.);
    vec3 blue=vec3(.06,.22,.52);

    float gradient=clamp(v_smooth_pattern,0.,1.);
    gradient=pow(gradient,1.75);
    
    vec3 final_color;
    final_color= mix(black,blue,smoothstep(0.,0.25,gradient));


    vec3 displacement=vec3(
        final_color.x,
        final_color.y,
        final_color.z
    );
    
    v_final_color=displacement*3.; 
    v_position=position+final_color;

    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}