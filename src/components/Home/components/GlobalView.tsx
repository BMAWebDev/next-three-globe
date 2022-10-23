import { ReactElement, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js';

import cs from 'classnames';
import s from '../style.module.scss';

import DragToRotate from '../assets/dragToRotate.svg';
import { Props } from '../types';
import { Event } from 'three';

export default function GlobalView({ partners }: Props): ReactElement {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const globalViewCanvasRef = useRef(null);
  const globalViewRef = useRef(null);
  const markerLabelRef = useRef(null);
  const logoRef = useRef(null);
  const descriptionRef = useRef(null);

  const dragContainerRef = useRef(null);

  useEffect(() => {
    const handleGlobe = () => {
      // convert to unknown then back to html element because for whatever reason typescript doesnt recognise it
      const canvas =
        globalViewCanvasRef.current as unknown as HTMLCanvasElement;
      const globalView = globalViewRef.current as unknown as HTMLDivElement;
      const markerLabel = markerLabelRef.current as unknown as HTMLDivElement;
      const logo = logoRef.current as unknown as HTMLImageElement;
      const description = descriptionRef.current as unknown as HTMLDivElement;

      const screenWidth = window.innerWidth;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        precision: 'highp',
      });

      const getGlobalViewSizes = () => {
        const headerSize = 50;

        let width = globalView.getBoundingClientRect().width;
        let height = window.innerHeight - headerSize - 0.3 * window.innerHeight;
        height += 0.3 * height;

        if (screenWidth <= 440) {
          height -= 200;
        }

        return { width, height };
      };

      let labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(
        getGlobalViewSizes().width,
        getGlobalViewSizes().height
      );
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0px';
      labelRenderer.domElement.classList.add('labelRenderer');

      globalView.appendChild(labelRenderer.domElement);

      const setRendererSize = () => {
        const sizes = getGlobalViewSizes();

        renderer.setSize(sizes.width, sizes.height);
        labelRenderer?.setSize(sizes.width, sizes.height);
      };
      setRendererSize();
      renderer.setPixelRatio(window.devicePixelRatio);

      globalView.style.margin = '0 auto';

      const camera = new THREE.PerspectiveCamera(
        75,
        getGlobalViewSizes().width / getGlobalViewSizes().height,
        0.1,
        1000
      );

      const scene = new THREE.Scene();

      const geometry = new THREE.SphereGeometry(5, 50, 50);
      const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(
          '/textures/earth-texture-hq.jpg',
          () => {
            setIsLoaded(true);

            animate();
          }
        ),
      });

      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      const controls = new OrbitControls(camera, labelRenderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;

      if (screenWidth <= 440) camera.position.z = 10;
      else if (screenWidth <= 500) camera.position.z = 12;
      else if (screenWidth <= 768) camera.position.z = 11;
      else camera.position.z = 8.5;

      const degreeToRadian = (degree: number) => {
        return degree / 57.29;
      };

      sphere.rotateX(degreeToRadian(40)); // correct degrees to fix on europe
      sphere.rotateY(degreeToRadian(-100)); // correct degrees to fix on europe

      const animate = () => {
        requestAnimationFrame(animate);

        controls.update();

        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
      };

      const onWindowResize = () => {
        camera.aspect =
          getGlobalViewSizes().width / getGlobalViewSizes().height;
        camera.updateProjectionMatrix();

        setRendererSize();
      };
      window.addEventListener('resize', onWindowResize);

      let globalUniforms = {
        time: { value: 0 },
      };
      let rad = 5;

      /**
       * Docs
       *
       * @Vector3 este de fapt un array cu coordonatele x (latime: stanga dreapta), y (inaltime: sus jos), z (adancime: fata spate)
       */

      // <Markers>
      const markerInfo = partners;

      // geometria punctului (cerc in cazul nostru, mai poate fi si cub, con etc)
      let markerGeometry = new THREE.CircleGeometry(0.2);

      // markerMaterial face grafica (cercurile galbene) (nu te atinge de ce mai jos, nu momentan cel putin!)
      let markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xf6ca53,
      });
      markerMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.time = globalUniforms.time;
        shader.vertexShader = `
      attribute float phase;
      varying float vPhase;
      ${shader.vertexShader}
    `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
        vPhase = phase; // de-synch of ripples
      `
        );

        shader.fragmentShader = `
      uniform float time;
      varying float vPhase;
      ${shader.fragmentShader}
    `.replace(
          `vec4 diffuseColor = vec4( diffuse, opacity );`,
          `
      vec2 lUv = (vUv - 0.5) * 2.;
      float val = 0.;
      float lenUv = length(lUv);
      val = max(val, 1. - step(0.25, lenUv)); // central circle

      float tShift = fract(time * 0.5 + vPhase);

      if (val < 0.5) discard;

      vec4 diffuseColor = vec4( diffuse, opacity );`
        );
      };

      markerMaterial.defines = { USE_UV: ' ' }; // needed to be set to be able to work with UVs

      const markerCount = markerInfo.length;

      // puncte
      const markers = new THREE.InstancedMesh(
        markerGeometry,
        markerMaterial,
        markerCount
      );

      // circleObject va fi obiectul nostru de tip cerc pe care il instantiem la fiecare marker adaugat
      let circleObject = new THREE.Object3D();

      // loop prin fiecare element din markerInfo (cu numar maxim de pasi markerCount (adica lungimea arrayului de informatii marker) )
      for (let i = 0; i < markerCount; i++) {
        // setez coordonatele lui circleObject dupa coordonatele obiectului curent din markerInfo (luat dupa index: markerInfo[i])
        circleObject.position.copy(markerInfo[i].coords);

        // seteaza lungimea (pastreaza y si z si modifica doar x-ul)
        circleObject.position.setLength(rad + 0.1);

        // seteaza punctul in care sa se uite obiectul (use case la noi: sa se muleze dupa glob)
        circleObject.lookAt(circleObject.position.clone().setLength(rad + 1));

        // actualizeaza coordonatele (mai intai le setezi, apoi le actualizezi)
        circleObject.updateMatrix();
        markers.setMatrixAt(i, circleObject.matrix);
      }

      // la final adaugam punctele pe glob
      scene.add(markers);
      // </Markers>

      // <Label>
      let label = new CSS2DObject(markerLabel);
      scene.add(label);
      const renderLabel = (
        isRotateEnabled: boolean,
        labelPosition?: THREE.Vector3
      ) => {
        if (!isRotateEnabled) {
          // adauga urmatoarea linie cand misti globul din nou
          markerLabel.classList.add('d-none');

          return null;
        }

        markerLabel.classList.remove('d-none');

        label.position.copy(labelPosition as THREE.Vector3);
      };
      // </Label>

      // <Interaction>
      let pointer = new THREE.Vector2();
      let raycaster = new THREE.Raycaster();
      let intersections: Array<THREE.Intersection>;

      globalView.addEventListener('pointerdown', (event: Event) => {
        const dragContainer =
          dragContainerRef.current as unknown as HTMLDivElement;
        dragContainer.classList.add('d-none');

        const sizes = getGlobalViewSizes();

        const rect = event.target.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        pointer.x = (mouseX / sizes.width) * 2 - 1;
        pointer.y = -(mouseY / sizes.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        intersections = raycaster
          .intersectObject(markers)
          .filter(
            (marker: any) =>
              marker.uv.subScalar(0.5).length() < 0.14 &&
              marker.uv.subScalar(0.5).length() > 0.1
          );

        if (intersections.length === 1) {
          let intersectionID = intersections[0].instanceId as number;
          let markerInfoOBJ = markerInfo[intersectionID];

          logo.src = markerInfoOBJ.image;
          description.textContent = markerInfoOBJ.description;

          renderLabel(true, intersections[0].point);
        } else {
          renderLabel(false);
        }
      });
      // </Interaction>
    };

    // prevent overload bug
    // check if template is loaded so you dont render it multiple times
    if (document.querySelectorAll('.labelRenderer').length < 1)
      if (!isLoaded) handleGlobe();
  }, [partners]);

  return (
    <div id={cs(s.globalView)} ref={globalViewRef}>
      <canvas
        id='globalViewCanvas'
        ref={globalViewCanvasRef}
        style={{ mixBlendMode: 'lighten' }}
      ></canvas>

      <div className={cs(s.dragContainer)} ref={dragContainerRef}>
        {isLoaded && (
          <>
            <Image src={DragToRotate} alt='' />
            <p className='text-white m-auto'>Drag to rotate</p>
          </>
        )}
        {!isLoaded && <h2 className='heading-2 text-white'>Loading...</h2>}
      </div>
      <div id={cs(s.markerLabel)} className='d-none' ref={markerLabelRef}>
        <div className={cs(s.content)}>
          <img src='' alt='' id={cs(s.logo)} ref={logoRef} />
          <p id={cs(s.description)} ref={descriptionRef}></p>
        </div>
      </div>
    </div>
  );
}
