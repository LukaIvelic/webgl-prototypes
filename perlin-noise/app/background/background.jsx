//# sourceMappingURL=background.min.js.map

"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background() {
    let rendererRef = useRef(null);
    let sceneRef = useRef(null);
    let cameraRef = useRef(null);
    let groundRef = useRef(null);
    let frameIdRef = useRef(null);
    let clockRef = useRef(new THREE.Clock());

    useEffect(() => {
        if (typeof window === "undefined") return;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = "0";
        renderer.domElement.style.left = "0";
        renderer.domElement.style.zIndex = "-1";
        renderer.domElement.style.filter = "blur(20px)";
        renderer.domElement.style.transform = "scale(1.1)";
        document.body.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 200, 0);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        camera.rotateZ(-45 * Math.PI / 180);
        cameraRef.current = camera;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const groundGeometry = new THREE.BoxGeometry(500, 0, 500, 350, 1, 350);
        const groundMaterial = new THREE.ShaderMaterial({
            fragmentShader: fragmentShaderCode,
            vertexShader: vertexShaderCode,
            uniforms: {
                u_time: { value: 0.0 },
                u_mouse_position: { value: new THREE.Vector3(0, 0, 0) }
            }
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        scene.add(ground);
        groundRef.current = ground;

        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            groundMaterial.uniforms.u_time.value = clockRef.current.getElapsedTime() * 7;
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameIdRef.current);
            window.removeEventListener('resize', handleResize);

            if (renderer) {
                document.body.removeChild(renderer.domElement);
                renderer.dispose();
            }

            if (groundGeometry) groundGeometry.dispose();
            if (groundMaterial) groundMaterial.dispose();
            if (ground) scene.remove(ground);
            scene.clear();

            rendererRef = null;
            sceneRef = null;
            cameraRef = null;
            groundRef = null;
            frameIdRef = null;
            clockRef = null;

            if (groundMaterial.uniforms) {
                for (const key in groundMaterial.uniforms) {
                    if (groundMaterial.uniforms[key].value instanceof THREE.Texture) {
                        groundMaterial.uniforms[key].value.dispose();
                    }
                }
            }
        };
    }, []);

    return (<></>);
}

const fragmentShaderCode = `
    precision lowp float;
    #define PI 3.14159265
    uniform float u_time;
    varying vec3 v_final_color;
    void main(){
        gl_FragColor=vec4(v_final_color,1.0);
    }
`;

const vertexShaderCode = `
    precision lowp float;
    #define PI 3.14159265
    uniform float u_time;
    varying vec3 v_final_color;
    float smoothMod(float axis,float amp,float rad){
        float top=cos(PI*(axis/amp))*sin(PI*(axis/amp));
        float bottom=pow(sin(PI*(axis/amp)),2.)+pow(rad,2.);
        float at=atan(top/bottom);
        return amp*(1./2.)-(1./PI)*at;
    }
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
    void main(){
        vec3 modulated_position = position + vec3(0.1, 0.0, 0.1);
        float zoom=1./300.;
        float consistency=.5;
        float noise=mix(
            snoise((modulated_position+u_time)*zoom)*consistency,
            sin(modulated_position.x/10.+u_time/3.),
            0.004
        );
        float density=1.25;
        float v_smooth_pattern=smoothMod(noise*density,.35,.4);
        vec3 black=vec3(0.);
        vec3 blue=vec3(0.051, 0.1882, 0.7922);
        vec3 final_color;
        float gradient=clamp(v_smooth_pattern,0.,0.6);
        gradient=pow(gradient,1.5);
        if(gradient<=.25){
            final_color=mix(blue, black,smoothstep(0.,.25,gradient));
        }
        v_final_color=final_color*3.; 
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
    }
`;