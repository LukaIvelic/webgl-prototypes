"use client";

import { useEffect } from 'react';
import * as THREE from 'three';

export default function Background(){

    useEffect(()=>{
        if(typeof window === "undefined") return;

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = "0";
        renderer.domElement.style.left = "0";

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 25, -150);
        camera.lookAt(new THREE.Vector3(0, 15, 0));
        camera.updateProjectionMatrix();

        const scene = new THREE.Scene();

        const clock = new THREE.Clock();

        let shaderUniforms = {
            u_time: {value: 0.0}
        }

        const groundGeometry = new THREE.BoxGeometry(500, 5, 400, 500, 1, 500);
        const groundMaterial = new THREE.ShaderMaterial({
            fragmentShader: fragmentShaderCode,
            vertexShader: vertexShaderCode,
            uniforms: shaderUniforms,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        scene.add(ground)

        function update () {
            shaderUniforms.u_time.value = clock.getElapsedTime() * 20; 
            requestAnimationFrame(update); 
            renderer.render(scene, camera);
        }
        update();

        const skyGeometry = new THREE.PlaneGeometry(500, 300, 500, 500);
        const skyMaterial = new THREE.MeshPhysicalMaterial({color: new THREE.Color().setRGB(0.001, 0.001, 0.001)});
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        sky.material.side = THREE.DoubleSide;
        sky.receiveShadow = true;
        sky.castShadow = true;
        sky.position.setZ(150);
        scene.add(sky);

        const light = new THREE.PointLight(0xffffff, 100000, 0, 2);
        light.position.set(120, 50, -100)
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.bias = -0.001;
        scene.add(new THREE.PointLightHelper(light))
        scene.add(light)

        renderer.render(scene, camera);

        return () => {
            renderer.dispose();
            groundMaterial.dispose();
            skyMaterial.dispose();
            light.dispose();
        }
    }, []);

    return (<></>);
}

const fragmentShaderCode = `
    precision highp float;
    #define PI 3.1415926
    uniform float u_time;
    varying vec3 v_position;
    varying float v_smooth_pattern;
    void main() {
        // Define a gradient of colors for the ocean
        vec3 deep_navy = vec3(0.0, 0.0, 0.2);    // Deep water
        vec3 navy = vec3(0.0, 0.0, 0.5);         // Dark blue
        vec3 blue = vec3(0.0, 0.4, 0.8);         // Mid blue
        vec3 turquoise = vec3(0.0, 0.8, 0.9);    // Shallow blue-green
        vec3 light_cyan = vec3(0.7, 1.0, 1.0);   // Highlights or very shallow water
        // Map v_smooth_pattern to a smoother range
        float gradient = clamp(v_smooth_pattern, 0.0, 1.0);
        vec3 final_color = mix(
            vec3(0.50, 0.15, 0.01), 
            vec3(0.70, 0.35, 0.21), 
            smoothstep(0.0, 1.0, gradient)
        );
        gl_FragColor = vec4(final_color, 1.0);
    }
`;

const vertexShaderCode = `
    precision highp float;
    #define PI 3.1415926
    uniform float u_time;
    varying vec3 v_position;
    varying float v_smooth_pattern;
    vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) { 
        const vec2  C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        vec4 j = p - 49.0 * floor(p * (1.0 / 7.0) * (1.0 / 7.0));
        vec4 x_ = floor(j * (1.0 / 7.0));
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * (1.0 / 7.0) + (1.0 / 14.0);
        vec4 y = y_ * (1.0 / 7.0) + (1.0 / 14.0);
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }
    void main() {
        float density = 1.0 / 70.0;
        float brightness = 1.0;
        float noise = snoise((position + u_time) * density) * brightness;
        v_smooth_pattern = noise;
        float waveX = sin(position.x * 5.0 + u_time) * 0.1; 
        float waveY = cos(position.y * 5.0 + u_time) * 0.1;
        float waveZ = sin(position.z * 5.0 + u_time * 0.5) * 0.1; 
        vec3 displacement = vec3(
            noise * waveX,
            noise * 10.0,
            noise * waveZ
        );
        v_position = position + displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(v_position, 1.0);
    }
`;