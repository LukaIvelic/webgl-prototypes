'use client';

import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { TextureLoader } from "three";

export default function Background({ Id, Width, Height, ImgSrc, Description }) {
    const scrollSpeed = useRef(0.0);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        document.getElementById(Id).appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 7);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const scene = new THREE.Scene();

        let clock = new THREE.Clock();

        let uniforms = {
            u_texture: { value: new TextureLoader().load(ImgSrc) },
            u_time: { value: 0.0 },
            u_scroll_speed: { value: 0.0 },
            u_scroll_interpolated: {value: 0.0},
        };

        const planeGeometry = new THREE.PlaneGeometry(15, 10, 20, 20);
        const planeMaterial = new THREE.ShaderMaterial({
            fragmentShader: fragmentShaderCode,
            vertexShader: vertexShaderCode,
            uniforms: uniforms
        });
        scene.add(new THREE.Mesh(planeGeometry, planeMaterial));

        let scrollDirection = 0.0;

        const handleWheel = (e) => {
            scrollDirection = e.deltaY < 0 ? -1 : 1;
            if (scrollSpeed.current <= 3) {
                scrollSpeed.current = Math.min(scrollSpeed.current + 0.5, 3);
            }
        };

        window.addEventListener("wheel", (e)=>{handleWheel(e)});

        const animate = () => {
            requestAnimationFrame(animate);
            uniforms.u_time.value = clock.getElapsedTime();
            uniforms.u_scroll_speed.value = scrollSpeed.current;

            uniforms.u_scroll_interpolated.value = THREE.MathUtils.lerp(
                uniforms.u_scroll_interpolated.value,
                scrollDirection,
                0.05
            );

            if (scrollSpeed.current > 0) {
                scrollSpeed.current -= 0.02;
            } else {
                scrollSpeed.current = 0;
            }

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            window.removeEventListener("wheel", handleWheel);
            renderer.dispose();
            planeMaterial.dispose();
            planeGeometry.dispose();
            uniforms.u_texture.value.dispose();
        };
    }, [Id, ImgSrc]);

    return (
        <div id={Id} style={{ width: Width, height: Height}}></div>
    );
}

const fragmentShaderCode = `
    precision highp float;
    uniform sampler2D u_texture;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(u_texture, vUv);
    }
`;

const vertexShaderCode = `
    precision highp float;
    uniform float u_time;
    uniform float u_scroll_speed;
    uniform float u_scroll_interpolated;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vec3 modified_position = position;
        modified_position.x += u_scroll_interpolated * cos(position.y / 5.0) * u_scroll_speed;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(modified_position, 1.0);
    }
`;