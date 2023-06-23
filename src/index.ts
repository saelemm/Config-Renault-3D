import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    mobileAndTabletCheck,
    BloomPlugin,
    Vector3, GammaCorrectionPlugin, MeshBasicMaterial2, Color, AssetImporter

    // Color, // Import THREE.js internals
    // Texture, // Import THREE.js internals
} from "webgi";
import "./styles.css";

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from '@studio-freight/lenis'

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical', // vertical, horizontal
    gestureDirection: 'vertical', // vertical, horizontal, both
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  })

  lenis.stop()

  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)

  gsap.registerPlugin(ScrollTrigger)


async function setupViewer(){

    // Initialize the viewer
    const viewer = new ViewerApp({
        canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
        //useRgbm: false,
    })

    const isMobile = mobileAndTabletCheck()


    // camera assets
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target
    const exitButton = document.querySelector('.button--exit') as HTMLElement
    const customizerInterface = document.querySelector('.customizer--container') as HTMLElement


    // Add some plugins
    const manager = await viewer.addPlugin(AssetManagerPlugin)
    await viewer.addPlugin(GBufferPlugin)
    await viewer.addPlugin(new ProgressivePlugin(32))
    await viewer.addPlugin(new TonemapPlugin(true))
    await viewer.addPlugin(GammaCorrectionPlugin)
    await viewer.addPlugin(SSRPlugin)
    await viewer.addPlugin(SSAOPlugin)
    await viewer.addPlugin(BloomPlugin)

    // Loader
    const importer = manager.importer as AssetImporter


    importer.addEventListener("onProgress", (ev) => {
        const progressRatio = (ev.loaded / ev.total)
        // console.log(progressRatio)
        document.querySelector('.progress')?.setAttribute('style', `transform: scaleX(${progressRatio})`)
    })

    importer.addEventListener("onLoad", (ev) => {
        gsap.to('.loader', {x: '100%', duration: 0.8, ease: 'power4.inOut', delay: 1, onComplete: () =>{
            document.body.style.overflowY = 'auto'
            lenis.start()
        }})
    })

    viewer.renderer.refreshPipeline()

    // This must be called once after all plugins are added.
    await manager.addFromPath("./assets/car3.glb")

    const carColor = manager.materials!.findMaterialsByName('paint')[0] as MeshBasicMaterial2
    const etrier = manager.materials!.findMaterialsByName('Material.001')[0] as MeshBasicMaterial2
    const jante = manager.materials!.findMaterialsByName('silver')[0] as MeshBasicMaterial2
    const vitres = manager.materials!.findMaterialsByName('window')[0] as MeshBasicMaterial2
    

    viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true // in case its set to false in the glb

    viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})

    // initial position
    position.set(-4.01, -0.21, -0.75)
    target.set(0.34, -0.05, -1.09)
    camera.setCameraOptions({ fov: 25.22 })

    window.scrollTo(0,0)

    function setupScrollanimation(){

        const tl = gsap.timeline()
        
        // FIRST SECTION
        tl
        .to(".section--one--container", { xPercent:'-150' , opacity:0,
        scrollTrigger: {
            trigger: ".second",
            start:"top bottom",
            end: "top 80%", scrub: 1,
            immediateRender: false
    }})
        .to(position, {x: -2.32, y: 5.24, z: 1.68,
            scrollTrigger: {
                trigger: ".second",
                start:"top bottom",
                end: "top top", scrub: true,
                immediateRender: false
        }, onUpdate})
        .to(target, {x: -0.26, y: 0.27 , z: 0.66,
            scrollTrigger: {
                trigger: ".second",
                start:"top bottom",
                end: "top top", scrub: true,
                immediateRender: false
        }, onUpdate})
        .to(".section--two--container", { xPercent:'150' , opacity:0,
        scrollTrigger: {
            trigger: ".third",
            start:"top bottom",
            end: "top 80%", scrub: 1,
            immediateRender: false
    }})
        .to(".section--second--container", { xPercent:'-150' , opacity:0,
            scrollTrigger: {
                trigger: ".second",
                start:"top bottom",
                end: "top 80%", scrub: 1,
                immediateRender: false
        }, onUpdate})


        // third section
        .to(target, {x: -1.11, y: 0.27 , z: 0.11,
            scrollTrigger: {
                trigger: ".third",
                start:"top bottom",
                end: "top top", scrub: true,
                immediateRender: false
        }, onUpdate})
        .to(position, {x: -1.11, y: 7.64, z: 0.17,
            scrollTrigger: {
                trigger: ".third",
                start:"top bottom",
                end: "top top", scrub: true,
                immediateRender: false
        }, onUpdate})


    }

    setupScrollanimation()

    // WEBGI UPDATE
    let needsUpdate = true;

    function onUpdate() {
        needsUpdate = true;
        viewer.renderer.resetShadows()
        viewer.setDirty()
    }

    viewer.addEventListener('preFrame', () =>{
        if(needsUpdate){
            camera.positionTargetUpdated(true)
            needsUpdate = false
        }
    })

            // KNOW MORE EVENT
	document.querySelector('.button--hero')?.addEventListener('click', () => {
		const element = document.querySelector('.second')
		window.scrollTo({ top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth' })
	})

    	// SCROLL TO TOP
	document.querySelectorAll('.button--footer')?.forEach(item => {
		item.addEventListener('click', () => {
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
		})
	})

        // CUSTOMIZE
        const sections = document.querySelector('.container') as HTMLElement
        const mainContainer = document.getElementById('webgi-canvas-container') as HTMLElement
        document.querySelector('.button--customize')?.addEventListener('click', () => {
            sections.style.display = "none"
            mainContainer.style.pointerEvents = "all"
            document.body.style.cursor = "grab"
            lenis.stop()
            gsap.to(position, {x: 4.25, y: 2.17, z: 0.02, duration: 2, ease: "power3.inOut", onUpdate})
            gsap.to(target, {x: -0.53, y: -0.25 , z: 0.07, duration: 2, ease: "power3.inOut", onUpdate, onComplete: enableControlers})
        })

        function enableControlers(){
            exitButton.style.display = "block"
            customizerInterface.style.display = "block"
            viewer.scene.activeCamera.setCameraOptions({controlsEnabled: true})
        }

            // EXIT CUSTOMIZER
	exitButton.addEventListener('click', () => {
        gsap.to(position, {x: -1.11, y: 7.64, z: 0.17, duration: 1, ease: "power3.inOut", onUpdate})
        gsap.to(target, {x: -1.11, y: 0.27 , z: 0.11, duration: 1, ease: "power3.inOut", onUpdate})

        viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})
        sections.style.display = "contents"
        mainContainer.style.pointerEvents = "none"
        document.body.style.cursor = "default"
        exitButton.style.display = "none"
        customizerInterface.style.display = "none"
        lenis.start()

	})

    // change car color
    document.querySelector('.button--colors.carColor.white')?.addEventListener('click', () => {
		changeCarColor(new Color(0xffffff).convertSRGBToLinear())
    })

    document.querySelector('.button--colors.carColor.black')?.addEventListener('click', () => {
		changeCarColor(new Color(0x000000).convertSRGBToLinear())
    })

    document.querySelector('.button--colors.carColor.red')?.addEventListener('click', () => {
		changeCarColor(new Color(0xa2392d).convertSRGBToLinear())
    })

    document.querySelector('.button--colors.carColor.yellow')?.addEventListener('click', () => {
		changeCarColor(new Color(0xdfb517).convertSRGBToLinear())
    })

    document.querySelector('.button--colors.carColor.green')?.addEventListener('click', () => {
		changeCarColor(new Color(0x359a4c).convertSRGBToLinear())
    })

    document.querySelector('.button--colors.carColor.blue')?.addEventListener('click', () => {
		changeCarColor(new Color(0x2d3b92).convertSRGBToLinear())
    })

    function changeCarColor(_colorToBeChanged: Color){
        gsap.to(position, {x: 4.25, y: 2.17, z: 0.02, duration: 2, ease: "power3.inOut", onUpdate})
        gsap.to(target, {x: -0.53, y: -0.25 , z: 0.07, duration: 2, ease: "power3.inOut", onUpdate, onComplete: enableControlers})
        carColor.color = _colorToBeChanged;
        viewer.scene.setDirty()
    }

    // change jante
    document.querySelector('.button--colors.jante.black')?.addEventListener('click', () => {
        changeJante(new Color(0x000000).convertSRGBToLinear())
    })
        
    document.querySelector('.button--colors.jante.white')?.addEventListener('click', () => {
        changeJante(new Color(0xffffff).convertSRGBToLinear())
    })
        
    document.querySelector('.button--colors.jante.yellow')?.addEventListener('click', () => {
        changeJante(new Color(0xdfb517).convertSRGBToLinear())
    })
    
    function changeJante(_colorToBeChanged: Color){

        gsap.to(position, {x: 3.41, y: -0.28, z: 1.00, duration: 1, ease: "power3.inOut", onUpdate})
        gsap.to(target, {x: -1.11, y: -0.03, z: 1.09, duration: 1, ease: "power3.inOut", onUpdate})

        jante.color = _colorToBeChanged;
        viewer.scene.setDirty()
    }

    // change etrier
    document.querySelector('.button--colors.etrier.black')?.addEventListener('click', () => {
        changeEtrier(new Color(0x000000).convertSRGBToLinear())
    })
    
    document.querySelector('.button--colors.etrier.red')?.addEventListener('click', () => {
        changeEtrier(new Color(0xFF0000).convertSRGBToLinear())
    })
    
    document.querySelector('.button--colors.etrier.yellow')?.addEventListener('click', () => {
        changeEtrier(new Color(0xECEC2A).convertSRGBToLinear())
    })

    document.querySelector('.button--colors.etrier.white')?.addEventListener('click', () => {
        changeEtrier(new Color(0xffffff).convertSRGBToLinear())
    })

    function changeEtrier(_colorToBeChanged: Color){
        gsap.to(position, {x: 3.41, y: -0.28, z: 1.00, duration: 1, ease: "power3.inOut", onUpdate})
        gsap.to(target, {x: -1.11, y: -0.03, z: 1.09, duration: 1, ease: "power3.inOut", onUpdate})

        etrier.color = _colorToBeChanged;
        viewer.scene.setDirty()
    }

    // change vitres
    document.querySelector('.button--colors.vitres.white')?.addEventListener('click', () => {
        changeVitres(new Color(0xB3B3B3).convertSRGBToLinear())
    })
        
    document.querySelector('.button--colors.vitres.grey')?.addEventListener('click', () => {
        changeVitres(new Color(0x7A7A7A).convertSRGBToLinear())
    })
        
    document.querySelector('.button--colors.vitres.black')?.addEventListener('click', () => {
        changeVitres(new Color(0x282828).convertSRGBToLinear())
    })
    
    function changeVitres(_colorToBeChanged: Color){
        gsap.to(position, {x: -1.26, y: 0.74, z: 1.62, duration: 1, ease: "power3.inOut", onUpdate})
        gsap.to(target, {x: -0.60, y: 0.35, z: 0.60, duration: 1, ease: "power3.inOut", onUpdate})

        vitres.color = _colorToBeChanged;
        viewer.scene.setDirty()
    }

}

setupViewer()
