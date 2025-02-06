'use client';

import Background from "./Background/background";
import style from './page.module.scss';
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function Page(){

    useEffect(()=>{
        if(typeof window === "undefined") return;

        const body = document.querySelector("body");
        const mainContainer = body.querySelector(`#${style.scrollable}`);
        const extraLongContainer = mainContainer.querySelector(`#${style.div_style}`);

        gsap.set(`#${style.scrollable}`, {x: 0, paddingTop: "12.5vw", position: "absolute"})

        gsap.to(`#${style.div_style}`, {
                xPercent: -120,
                x: () => window.innerWidth,
                ease: "none",
                scrollTrigger: {
                pin: `#${style.scrollable}`,
                trigger: `#${style.scrollable}`,
                start: "left left",
                end: () => `+=${extraLongContainer.offsetWidth} top`,
                scrub: true,
            }
        });
    }, []);

    useEffect(()=>{
        const lenis = new Lenis({
            autoRaf: true,
            wheelMultiplier: 1.5,
            lerp: 0.1
        });
    },[]);

    return(<>
        <div id={style.scrollable}>
            <div id={style.div_style}>
                <Background Id={"image_1"} Width={"45vw"} Height={"22vw"} ImgSrc={"./image.0.png"}/>
                <Background Id={"image_2"} Width={"45vw"} Height={"22vw"} ImgSrc={"./image.1.png"}/>
                <Background Id={"image_3"} Width={"45vw"} Height={"22vw"} ImgSrc={"./image.2.png"}/>
                <Background Id={"image_4"} Width={"45vw"} Height={"22vw"} ImgSrc={"./image.3.png"}/>
                <Background Id={"image_5"} Width={"45vw"} Height={"22vw"} ImgSrc={"./image.4.png"}/>
                <Background Id={"image_6"} Width={"45vw"} Height={"22vw"} ImgSrc={"./image.5.png"}/>
                <Background Id={"image_7"} Width={"45vw"} Height={"22vw"} ImgSrc={"./image.6.png"}/>
                <Background Id={"image_8"} Width={"45vw"} Height={"22vw"} ImgSrc={"./image.7.png"}/>
            </div>
        </div>
    </>);
}