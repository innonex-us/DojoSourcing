"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildRealisticStages } from "./three";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STAGES = [
  {
    num: "01",
    tag: "DESIGN A T-SHIRT",
    title: "Start With The Garment",
    subtitle: "Silhouette · Tech Pack · 3D Fit",
    body: "Everything begins on the digital drafting table. We sculpt your T-shirt silhouette, cotton GSM, stitching specs, and colorway before a single yard is cut.",
  },
  {
    num: "02",
    tag: "FACTORY PRODUCTION",
    title: "Into The Factory",
    subtitle: "Rise Of Manufacturing · Cut & Sew",
    body: "Your approved design flies straight into our vetted garment factory — precision cutting, knitting, dyeing, and assembly lines built for scale.",
  },
  {
    num: "03",
    tag: "READY TO SHIP",
    title: "Packed & QC Cleared",
    subtitle: "AQL 2.5 · Export Cartons",
    body: "Finished tees are steamed, folded, polybagged, hang-tagged, and sealed into barcoded export cartons — 100% inspection cleared.",
  },
  {
    num: "04",
    tag: "CARGO TRUCK",
    title: "Cargo Truck Dispatch",
    subtitle: "Factory Floor To Export Port",
    body: "Sealed cargo trucks haul your cartons straight from the factory loading dock through export customs to the container terminal.",
  },
  {
    num: "05",
    tag: "OCEAN SHIP",
    title: "Global Ship Journey",
    subtitle: "Port To Brand Warehouse",
    body: "Loaded onto ocean cargo vessels and tracked across the sea until final delivery at your brand's fulfillment center.",
  },
] as const;

const GROUND_Y = -1.35;

export function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const host = canvasHostRef.current;
          const texts = gsap.utils.toArray<HTMLElement>(".journey-copy");
          if (!host) return;

          gsap.set(texts, { autoAlpha: 0, y: 28 });
          if (texts[0]) gsap.set(texts[0], { autoAlpha: 1, y: 0 });

          let renderer: THREE.WebGLRenderer | null = null;
          try {
            renderer = new THREE.WebGLRenderer({
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            });
          } catch {
            return;
          }

          const width = host.clientWidth || window.innerWidth;
          const height = host.clientHeight || window.innerHeight;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.setSize(width, height);
          renderer.localClippingEnabled = true;
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.15;

          host.innerHTML = "";
          host.appendChild(renderer.domElement);

          const scene = new THREE.Scene();
          scene.fog = new THREE.FogExp2(0x120f0e, 0.036);

          // Physically-Based Studio IBL Environment Map for Realistic Reflections
          const pmrem = new THREE.PMREMGenerator(renderer);
          const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
          scene.environment = envRT.texture;
          scene.environmentIntensity = 0.65;

          const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
          camera.position.set(-1.15, 1.1, 8.6);
          camera.lookAt(0.85, -0.15, 0);

          // Studio Key + Fill + Rim Lighting with Real Soft Shadows
          const hemi = new THREE.HemisphereLight(0xfff5ec, 0x1a1513, 0.55);
          scene.add(hemi);

          const keyLight = new THREE.DirectionalLight(0xfffaf4, 2.4);
          keyLight.position.set(5, 9, 6);
          keyLight.castShadow = true;
          keyLight.shadow.mapSize.set(1024, 1024);
          keyLight.shadow.camera.near = 1;
          keyLight.shadow.camera.far = 26;
          keyLight.shadow.camera.left = -6;
          keyLight.shadow.camera.right = 6;
          keyLight.shadow.camera.top = 6;
          keyLight.shadow.camera.bottom = -6;
          keyLight.shadow.bias = -0.0005;
          scene.add(keyLight);

          const rimLight = new THREE.SpotLight(0xfe4101, 18, 22, Math.PI / 3, 0.6);
          rimLight.position.set(-3.5, 4, 4);
          scene.add(rimLight);

          const groundClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y);

          const stageAnchor = new THREE.Group();
          stageAnchor.position.set(1.55, 0, 0);
          scene.add(stageAnchor);

          // Shadow-receiving dark matte stage floor + subtle horizon ring
          const floorGeo = new THREE.CircleGeometry(9, 64);
          const floorMat = new THREE.ShadowMaterial({ opacity: 0.45 });
          const shadowFloor = new THREE.Mesh(floorGeo, floorMat);
          shadowFloor.rotation.x = -Math.PI / 2;
          shadowFloor.position.y = GROUND_Y + 0.005;
          shadowFloor.receiveShadow = true;
          stageAnchor.add(shadowFloor);

          const horizonGrid = new THREE.GridHelper(18, 30, 0xfe4101, 0x241f1d);
          horizonGrid.position.y = GROUND_Y;
          (horizonGrid.material as THREE.Material).transparent = true;
          (horizonGrid.material as THREE.Material).opacity = 0.25;
          stageAnchor.add(horizonGrid);

          const portalRing = new THREE.Mesh(
            new THREE.RingGeometry(2.35, 2.42, 72),
            new THREE.MeshBasicMaterial({
              color: 0xfe4101,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.55,
            }),
          );
          portalRing.rotation.x = -Math.PI / 2;
          portalRing.position.y = GROUND_Y + 0.012;
          stageAnchor.add(portalRing);

          // Build all 5 realistic multi-part 3D models
          const assets = buildRealisticStages(stageAnchor, groundClip);
          const {
            tshirtGroup,
            factoryGroup,
            steamPuffs,
            readyGroup,
            truckGroup,
            wheels,
            shipStageGroup,
            shipHullGroup,
            waveGeo,
          } = assets;

          // Pointer Parallax
          const rotYTo = gsap.quickTo(stageAnchor.rotation, "y", {
            duration: 0.6,
            ease: "power3.out",
          });
          const rotXTo = gsap.quickTo(stageAnchor.rotation, "x", {
            duration: 0.6,
            ease: "power3.out",
          });
          const onPointerMove = (e: PointerEvent) => {
            rotYTo((e.clientX / window.innerWidth - 0.5) * 0.4);
            rotXTo((e.clientY / window.innerHeight - 0.5) * 0.16);
          };
          window.addEventListener("pointermove", onPointerMove, { passive: true });

          // Continuous realistic motion (steam, ocean swell, garment hang sway)
          let rafId = 0;
          const clock = new THREE.Clock();
          const wavePos = waveGeo.attributes.position as THREE.BufferAttribute;

          const renderLoop = () => {
            const t = clock.getElapsedTime();

            tshirtGroup.rotation.y = Math.sin(t * 0.7) * 0.4;
            readyGroup.rotation.y = Math.sin(t * 0.55) * 0.3;

            steamPuffs.forEach((puff) => {
              const phase = (t * 0.45 + (puff.userData.offset as number)) % 1;
              puff.position.y = 1.9 + phase * 1.4;
              puff.position.x =
                (puff.userData.baseX as number) + Math.sin(phase * 4 + t) * 0.12;
              puff.scale.setScalar(0.8 + phase * 1.3);
              (puff.material as THREE.MeshStandardMaterial).opacity =
                0.45 * (1 - phase);
            });

            shipHullGroup.position.y = Math.sin(t * 1.6) * 0.07;
            shipHullGroup.rotation.z = Math.sin(t * 1.1) * 0.025;
            shipHullGroup.rotation.x = Math.cos(t * 1.3) * 0.015;

            for (let i = 0; i < wavePos.count; i++) {
              const vx = wavePos.getX(i);
              const vz = wavePos.getZ(i);
              wavePos.setY(
                i,
                Math.sin(vx * 0.75 + t * 2.0) * 0.11 +
                  Math.cos(vz * 1.05 + t * 1.5) * 0.07,
              );
            }
            wavePos.needsUpdate = true;
            waveGeo.computeVertexNormals();

            renderer?.render(scene, camera);
            rafId = requestAnimationFrame(renderLoop);
          };
          rafId = requestAnimationFrame(renderLoop);

          const onResize = () => {
            if (!host || !renderer) return;
            const w = host.clientWidth || window.innerWidth;
            const h = host.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          };
          window.addEventListener("resize", onResize);

          // =========================================================
          // GSAP SCROLLTRIGGER MASTER TIMELINE:
          // Underground Emergence + Fly-Out Choreography
          // =========================================================
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".journey-stage",
              start: "top top",
              end: "+=4800",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              onUpdate: (self) => {
                const idx = Math.min(
                  STAGES.length - 1,
                  Math.floor(self.progress * STAGES.length),
                );
                setActiveStep(idx);
              },
            },
          });

          tl.to(".journey-rail-fill", { scaleX: 1, ease: "none", duration: 5 }, 0);

          // STAGE 1 -> 2: T-Shirt FLIES OUT, Factory RISES FROM UNDERGROUND
          tl.to(
            tshirtGroup.position,
            { y: 5.5, x: 1.8, z: -2.2, duration: 0.75, ease: "power2.in" },
            0.75,
          )
            .to(
              tshirtGroup.rotation,
              { z: 0.4, x: -0.3, duration: 0.75, ease: "power2.in" },
              0.75,
            )
            .to(texts[0], { autoAlpha: 0, y: -28, duration: 0.35 }, 0.75)
            .to(
              factoryGroup.position,
              { y: 0, duration: 0.85, ease: "power3.out" },
              0.9,
            )
            .to(texts[1], { autoAlpha: 1, y: 0, duration: 0.45 }, 1.15);

          // STAGE 2 -> 3: Factory FLIES OUT, Ready Cartons RISE FROM UNDERGROUND
          tl.to(
            factoryGroup.position,
            { y: 5.8, x: -2.2, duration: 0.75, ease: "power2.in" },
            1.8,
          )
            .to(factoryGroup.rotation, { y: -0.35, duration: 0.75 }, 1.8)
            .to(texts[1], { autoAlpha: 0, y: -28, duration: 0.35 }, 1.8)
            .to(
              readyGroup.position,
              { y: 0, duration: 0.85, ease: "power3.out" },
              1.95,
            )
            .to(texts[2], { autoAlpha: 1, y: 0, duration: 0.45 }, 2.2);

          // STAGE 3 -> 4: Ready Cartons FLY OUT, Cargo Truck RISES FROM UNDERGROUND & Drives
          tl.to(
            readyGroup.position,
            { y: 5.5, x: 2.0, duration: 0.75, ease: "power2.in" },
            2.8,
          )
            .to(readyGroup.rotation, { z: -0.25, duration: 0.75 }, 2.8)
            .to(texts[2], { autoAlpha: 0, y: -28, duration: 0.35 }, 2.8)
            .to(
              truckGroup.position,
              { y: -0.02, duration: 0.75, ease: "power3.out" },
              2.95,
            )
            .fromTo(
              truckGroup.position,
              { x: -1.6 },
              { x: 1.2, duration: 1.0, ease: "power1.inOut" },
              3.1,
            )
            .to(texts[3], { autoAlpha: 1, y: 0, duration: 0.45 }, 3.2);

          wheels.forEach((w) => {
            tl.to(w.rotation, { z: -Math.PI * 6, duration: 1.0, ease: "none" }, 3.1);
          });

          // STAGE 4 -> 5: Cargo Truck DRIVES/FLIES OUT, Ocean Ship RISES FROM UNDERGROUND & Sails
          tl.to(
            truckGroup.position,
            { x: 7.5, y: 2.5, duration: 0.75, ease: "power2.in" },
            3.95,
          )
            .to(texts[3], { autoAlpha: 0, y: -28, duration: 0.35 }, 3.95)
            .to(
              shipStageGroup.position,
              { y: -0.1, duration: 0.85, ease: "power3.out" },
              4.1,
            )
            .fromTo(
              shipStageGroup.position,
              { x: -1.3 },
              { x: 0.75, duration: 0.9, ease: "power1.inOut" },
              4.25,
            )
            .to(texts[4], { autoAlpha: 1, y: 0, duration: 0.45 }, 4.35);

          return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("resize", onResize);
            assets.dispose();
            floorGeo.dispose();
            floorMat.dispose();
            envRT.dispose();
            pmrem.dispose();
            renderer?.dispose();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="journey-section relative border-t border-border bg-background"
      aria-label="3D Clothing Production & Shipment Journey"
    >
      {/* Desktop Full-Bleed Pinned 3D WebGL + GSAP Stage */}
      <div className="journey-stage relative hidden h-svh min-h-[700px] w-full flex-col justify-between overflow-hidden px-8 pt-24 pb-10 md:flex">
        {/* Full-Bleed 3D WebGL Canvas */}
        <div
          ref={canvasHostRef}
          className="pointer-events-none absolute inset-0 z-0"
        />

        {/* Left Atmospheric Gradient so Copy stays Razor-Sharp */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[50%] bg-gradient-to-r from-background via-background/75 to-transparent"
        />

        {/* Top 5-Step Pipeline HUD */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          <div className="flex items-center justify-between gap-2">
            {STAGES.map((stage, idx) => {
              const isActive = idx === activeStep;
              const isDone = idx < activeStep;
              return (
                <div
                  key={stage.num}
                  className={`flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                    isActive
                      ? "text-brand"
                      : isDone
                        ? "text-chrome"
                        : "text-muted/60"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] ${
                      isActive
                        ? "border-brand bg-brand text-white"
                        : isDone
                          ? "border-chrome/50 text-chrome"
                          : "border-border text-muted"
                    }`}
                  >
                    {stage.num}
                  </span>
                  <span className="hidden lg:inline">{stage.tag}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 h-[2px] w-full bg-border">
            <div className="journey-rail-fill h-full w-full origin-left scale-x-0 bg-brand" />
          </div>
        </div>

        {/* Floating Editorial Narrative (Left) */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 items-center">
          <div className="relative h-[340px] w-full max-w-[490px]">
            {STAGES.map((stage, idx) => (
              <div
                key={stage.num}
                className="journey-copy absolute inset-0 flex flex-col justify-center"
                style={{ opacity: idx === 0 ? 1 : 0 }}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-brand">
                  {`STAGE ${stage.num} // ${stage.tag}`}
                </span>
                <h2 className="mt-4 text-4xl font-extrabold uppercase leading-[1.03] tracking-wide text-chrome lg:text-5xl">
                  {stage.title}
                </h2>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-brand/90">
                  {stage.subtitle}
                </p>
                <p className="mt-5 text-base leading-relaxed text-foreground/85">
                  {stage.body}
                </p>
                {idx === STAGES.length - 1 ? (
                  <div className="mt-7">
                    <Link
                      href="/showcase"
                      data-cursor="magnet"
                      className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_rgba(254,65,1,0.35)] transition-transform hover:scale-[1.03]"
                    >
                      <span>Explore Product Showcase</span>
                      <span aria-hidden>↗</span>
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Telemetry Bar */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          <span>Scroll To Erupt Next Stage From Ground</span>
          <Link href="/showcase" className="transition-colors hover:text-brand">
            Product Showcase ↗
          </Link>
        </div>
      </div>

      {/* Mobile / Reduced-Motion Fallback Vertical Timeline */}
      <div className="px-5 py-20 md:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
          • End-To-End Pipeline
        </p>
        <h2 className="mt-3 text-3xl font-bold uppercase tracking-wide text-chrome">
          Design To Shipment
        </h2>
        <div className="mt-10 space-y-6 border-l border-border pl-6">
          {STAGES.map((stage) => (
            <div key={stage.num} className="relative">
              <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                {stage.num}
              </span>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
                {stage.tag} · {stage.subtitle}
              </p>
              <h3 className="mt-1 text-xl font-bold uppercase text-chrome">
                {stage.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {stage.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/showcase"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white"
          >
            <span>Explore Product Showcase</span>
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
