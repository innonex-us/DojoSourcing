"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Factory,
  MoveHorizontal,
  PackageCheck,
  Ship,
  Shirt,
  Truck,
} from "lucide-react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { buildRealisticStages, type RealisticStageAssets } from "./three";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

const STAGES = [
  {
    num: "01",
    tag: "DESIGN A T-SHIRT",
    title: "Start With The Garment",
    subtitle: "Silhouette · Cotton GSM · Live Colorway",
    body: "Everything begins on the digital drafting table. Test fabric GSM and custom colorways live in 3D before a single yard is cut.",
  },
  {
    num: "02",
    tag: "FACTORY PRODUCTION",
    title: "Into The Factory",
    subtitle: "Industrial Cut & Sew · QC Labs",
    body: "Your approved design flies straight into our multi-wing garment plant — precision cutting, knitting, dyeing, and assembly lines built for scale.",
  },
  {
    num: "03",
    tag: "READY TO SHIP",
    title: "Packed & QC Cleared",
    subtitle: "Euro Pallet · Stretch-Wrap · Barcode Scan",
    body: "Finished tees are folded, polybagged, strapped onto Euro pallets, barcode-scanned, and stretch-wrapped — 100% AQL 2.5 inspection cleared.",
  },
  {
    num: "04",
    tag: "CARGO TRUCK",
    title: "Cargo Truck Dispatch",
    subtitle: "Factory Dock To Export Port",
    body: "Sealed 40ft container trucks haul your palletized inventory along the highway from the factory loading dock straight to the export terminal.",
  },
  {
    num: "05",
    tag: "OCEAN SHIP",
    title: "Global Ship Journey",
    subtitle: "Container Vessel To Brand Warehouse",
    body: "Loaded onto ocean cargo vessels and tracked across the sea until final delivery at your brand's fulfillment center.",
  },
] as const;

export const COLORWAYS = [
  { name: "Off-White", hex: "#e2e8f0", gsm: "420 GSM Heavy Jersey" },
  { name: "Corp Navy", hex: "#1e3a8a", gsm: "380 GSM Combed Cotton" },
  { name: "Crimson Red", hex: "#dc2626", gsm: "420 GSM Enzyme Wash" },
  { name: "Slate Blue", hex: "#475569", gsm: "340 GSM Organic Knit" },
] as const;

const STAGE_ICONS = [Shirt, Factory, PackageCheck, Truck, Ship] as const;

const GROUND_Y = -1.35;

export function Journey({
  theme = "dark",
  accent = "red",
  onColorwayChange,
}: {
  theme?: "dark" | "light";
  accent?: "red" | "blue";
  onColorwayChange?: (colorName: string) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const assetsRef = useRef<RealisticStageAssets | null>(null);
  const sceneEnvRef = useRef<{
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    portalMat: THREE.MeshBasicMaterial;
    rimLight: THREE.SpotLight;
  } | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const host = canvasHostRef.current;
          const texts = gsap.utils.toArray<HTMLElement>(".journey-copy");
          if (!host) return;

          gsap.set(texts, { autoAlpha: 0, y: 24 });
          if (texts[0]) gsap.set(texts[0], { autoAlpha: 1, y: 0 });

          let renderer: THREE.WebGLRenderer | null = null;
          try {
            renderer = new THREE.WebGLRenderer({
              antialias: true,
              alpha: false,
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
          renderer.shadowMap.type = THREE.PCFShadowMap;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 0.96;

          const bgHex = theme === "light" ? 0xf4f7fb : 0x091122;
          const accentHex = accent === "blue" ? 0x2563eb : 0xdc2626;
          renderer.setClearColor(bgHex, 1);
          host.innerHTML = "";
          host.appendChild(renderer.domElement);

          const scene = new THREE.Scene();
          scene.background = new THREE.Color(bgHex);
          scene.fog = new THREE.FogExp2(bgHex, 0.036);

          const pmrem = new THREE.PMREMGenerator(renderer);
          const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
          scene.environment = envRT.texture;
          scene.environmentIntensity = 0.48;

          const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
          camera.position.set(-0.9, 1.15, 9.8);
          camera.lookAt(1.05, -0.15, 0);

          // Studio 3-Point Lighting (Red + Corporate Blue accents)
          scene.add(new THREE.HemisphereLight(0xf8fafc, 0x0f1c38, 0.48));

          const keyLight = new THREE.DirectionalLight(0xfffaf4, 1.85);
          keyLight.position.set(5, 9, 6);
          keyLight.castShadow = true;
          keyLight.shadow.mapSize.set(2048, 2048);
          keyLight.shadow.camera.near = 1;
          keyLight.shadow.camera.far = 26;
          keyLight.shadow.camera.left = -6;
          keyLight.shadow.camera.right = 6;
          keyLight.shadow.camera.top = 6;
          keyLight.shadow.camera.bottom = -6;
          keyLight.shadow.bias = -0.0004;
          scene.add(keyLight);

          const rimLight = new THREE.SpotLight(accentHex, 12, 22, Math.PI / 3, 0.65);
          rimLight.position.set(-3.2, 4, 4);
          scene.add(rimLight);

          const groundClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GROUND_Y);

          const stageAnchor = new THREE.Group();
          stageAnchor.position.set(2.05, 0, 0);
          scene.add(stageAnchor);

          // Shadow Floor & Subtle Horizon Ring
          const floorGeo = new THREE.CircleGeometry(10, 64);
          const floorMat = new THREE.ShadowMaterial({ opacity: 0.42 });
          const shadowFloor = new THREE.Mesh(floorGeo, floorMat);
          shadowFloor.rotation.x = -Math.PI / 2;
          shadowFloor.position.y = GROUND_Y + 0.005;
          shadowFloor.receiveShadow = true;
          stageAnchor.add(shadowFloor);

          const horizonGrid = new THREE.GridHelper(18, 30, 0x2563eb, 0x1e3a8a);
          horizonGrid.position.y = GROUND_Y;
          (horizonGrid.material as THREE.Material).transparent = true;
          (horizonGrid.material as THREE.Material).opacity = 0.22;
          stageAnchor.add(horizonGrid);

          const portalMat = new THREE.MeshBasicMaterial({
            color: accentHex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55,
          });
          const portalRing = new THREE.Mesh(
            new THREE.RingGeometry(2.45, 2.51, 96),
            portalMat,
          );
          portalRing.rotation.x = -Math.PI / 2;
          portalRing.position.y = GROUND_Y + 0.012;
          stageAnchor.add(portalRing);

          sceneEnvRef.current = { scene, renderer, portalMat, rimLight };

          // Build 5 Separated Realistic 3D Components
          const assets = buildRealisticStages(stageAnchor, groundClip);
          assetsRef.current = assets;
          const {
            tshirtGroup,
            factoryGroup,
            steamPuffs,
            hvacFans,
            readyGroup,
            laserBeam,
            truckGroup,
            wheels,
            shipStageGroup,
            shipHullGroup,
            radarBar,
            waveGeo,
          } = assets;

          // 360° Drag-Orbit + Pointer Parallax
          let isDragging = false;
          let dragStartX = 0;
          let orbitOffset = 0;
          let baseOrbit = 0;

          const rotYTo = gsap.quickTo(stageAnchor.rotation, "y", {
            duration: 0.55,
            ease: "power3.out",
          });
          const rotXTo = gsap.quickTo(stageAnchor.rotation, "x", {
            duration: 0.55,
            ease: "power3.out",
          });

          const onPointerDown = (e: PointerEvent) => {
            isDragging = true;
            dragStartX = e.clientX;
            baseOrbit = orbitOffset;
          };
          const onPointerUp = () => {
            isDragging = false;
          };
          const onPointerMove = (e: PointerEvent) => {
            if (isDragging) {
              orbitOffset = baseOrbit + (e.clientX - dragStartX) * 0.008;
              rotYTo(orbitOffset);
            } else {
              rotYTo(orbitOffset + (e.clientX / window.innerWidth - 0.5) * 0.35);
              rotXTo((e.clientY / window.innerHeight - 0.5) * 0.12);
            }
          };

          host.addEventListener("pointerdown", onPointerDown);
          window.addEventListener("pointerup", onPointerUp);
          window.addEventListener("pointermove", onPointerMove, { passive: true });

          // Continuous Realistic Micro-Animations using THREE.Timer (non-deprecated)
          let rafId = 0;
          const timer = new THREE.Timer();
          const wavePos = waveGeo.attributes.position as THREE.BufferAttribute;

          const renderLoop = () => {
            timer.update();
            const t = timer.getElapsed();

            tshirtGroup.rotation.y = Math.sin(t * 0.65) * 0.32;
            hvacFans.forEach((fan) => {
              fan.rotation.y = t * 6.5;
            });

            steamPuffs.forEach((puff) => {
              const phase = (t * 0.4 + (puff.userData.offset as number)) % 1;
              puff.position.y = 1.78 + phase * 1.1;
              puff.position.x =
                (puff.userData.baseX as number) + Math.sin(phase * 4 + t) * 0.12;
              puff.scale.set(
                1.2 + phase * 1.1,
                0.5 + phase * 0.35,
                1.2 + phase * 1.1,
              );
              (puff.material as THREE.MeshBasicMaterial).opacity =
                0.15 * (1 - phase);
            });

            readyGroup.rotation.y = Math.sin(t * 0.55) * 0.24;
            laserBeam.rotation.x = Math.sin(t * 4.5) * 0.22;

            shipHullGroup.position.y = Math.sin(t * 1.6) * 0.06;
            shipHullGroup.rotation.z = Math.sin(t * 1.1) * 0.022;
            shipHullGroup.rotation.x = Math.cos(t * 1.3) * 0.012;
            radarBar.rotation.y = t * 3.0;

            for (let i = 0; i < wavePos.count; i++) {
              const vx = wavePos.getX(i);
              const vz = wavePos.getZ(i);
              wavePos.setY(
                i,
                Math.sin(vx * 0.65 + t * 1.9) * 0.09 +
                  Math.cos(vz * 0.95 + t * 1.4) * 0.06,
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

          // GSAP ScrollTrigger Master Timeline with Exact Named Stage Labels
          const tl = gsap.timeline({
            scrollTrigger: {
              id: "journey-pipeline",
              trigger: ".journey-stage",
              start: "top top",
              end: "+=4800",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              onUpdate: (self) => {
                const p = self.progress * 5.2;
                const idx =
                  p < 0.85 ? 0 : p < 2.05 ? 1 : p < 3.25 ? 2 : p < 4.45 ? 3 : 4;
                setActiveStep(idx);
              },
            },
          });

          tl.addLabel("stage0", 0);
          tl.to(".journey-rail-fill", { scaleX: 1, ease: "none", duration: 5.2 }, 0);

          // STAGE 1 -> 2 (0.55..1.25)
          tl.to(
            tshirtGroup.position,
            { y: 8.5, x: 2.2, z: -2.2, duration: 0.55, ease: "power2.in" },
            0.55,
          )
            .to(tshirtGroup.rotation, { z: 0.4, x: -0.3, duration: 0.55 }, 0.55)
            .set(tshirtGroup, { visible: false }, 1.1)
            .to(texts[0], { autoAlpha: 0, y: -24, duration: 0.28 }, 0.55)
            .to(
              factoryGroup.position,
              { y: 0, duration: 0.65, ease: "power3.out" },
              0.65,
            )
            .to(texts[1], { autoAlpha: 1, y: 0, duration: 0.35 }, 0.88)
            .addLabel("stage1", 1.35);

          // STAGE 2 -> 3 (1.75..2.45)
          tl.to(
            factoryGroup.position,
            { y: 8.5, x: -2.5, duration: 0.55, ease: "power2.in" },
            1.75,
          )
            .to(factoryGroup.rotation, { y: -0.35, duration: 0.55 }, 1.75)
            .set(factoryGroup, { visible: false }, 2.3)
            .to(texts[1], { autoAlpha: 0, y: -24, duration: 0.28 }, 1.75)
            .to(
              readyGroup.position,
              { y: 0, duration: 0.65, ease: "power3.out" },
              1.85,
            )
            .to(texts[2], { autoAlpha: 1, y: 0, duration: 0.35 }, 2.08)
            .addLabel("stage2", 2.55);

          // STAGE 3 -> 4 (2.95..3.65)
          tl.to(
            readyGroup.position,
            { y: 8.5, x: 2.2, duration: 0.55, ease: "power2.in" },
            2.95,
          )
            .to(readyGroup.rotation, { z: -0.25, duration: 0.55 }, 2.95)
            .set(readyGroup, { visible: false }, 3.5)
            .to(texts[2], { autoAlpha: 0, y: -24, duration: 0.28 }, 2.95)
            .to(
              truckGroup.position,
              { y: -0.02, duration: 0.55, ease: "power3.out" },
              3.05,
            )
            .fromTo(
              truckGroup.position,
              { x: -1.8 },
              { x: 0.6, duration: 0.65, ease: "power1.inOut" },
              3.08,
            )
            .to(texts[3], { autoAlpha: 1, y: 0, duration: 0.35 }, 3.28)
            .addLabel("stage3", 3.78);

          wheels.forEach((w) => {
            tl.to(w.rotation, { z: -Math.PI * 10, duration: 1.5, ease: "none" }, 3.08);
          });

          // STAGE 4 -> 5 (4.05..5.10): Truck exits 100% BEFORE Ocean Ship rises
          tl.to(
            truckGroup.position,
            { x: 18, y: 2.2, duration: 0.45, ease: "power2.in" },
            4.05,
          )
            .set(truckGroup, { visible: false }, 4.5)
            .to(texts[3], { autoAlpha: 0, y: -24, duration: 0.25 }, 4.05)
            .to(
              horizonGrid.position,
              { y: -4.5, duration: 0.35, ease: "power2.in" },
              4.45,
            )
            .to(
              shipStageGroup.position,
              { y: -0.1, duration: 0.55, ease: "power3.out" },
              4.52,
            )
            .fromTo(
              shipStageGroup.position,
              { x: -0.4 },
              { x: 1.0, duration: 0.55, ease: "power1.inOut" },
              4.52,
            )
            .to(texts[4], { autoAlpha: 1, y: 0, duration: 0.32 }, 4.68)
            .addLabel("stage4", 5.1)
            .to({}, { duration: 0.15 }, 5.1);

          return () => {
            cancelAnimationFrame(rafId);
            host.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("resize", onResize);
            sceneEnvRef.current = null;
            assetsRef.current = null;
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

  // Sync 3D Scene Background, Fog & Accent with Theme Controls
  useGSAP(
    () => {
      const env = sceneEnvRef.current;
      if (!env) return;
      const targetColor = new THREE.Color(theme === "light" ? 0xf4f7fb : 0x091122);
      const accentColor = new THREE.Color(accent === "blue" ? 0x2563eb : 0xdc2626);
      env.scene.background = targetColor;
      if (env.scene.fog instanceof THREE.FogExp2) {
        env.scene.fog.color.copy(targetColor);
      }
      env.renderer.setClearColor(targetColor, 1);
      env.portalMat.color.copy(accentColor);
      env.rimLight.color.copy(accentColor);
    },
    { scope: sectionRef, dependencies: [theme, accent] },
  );

  // Smooth Colorway Tween on Stage 01
  useGSAP(
    () => {
      const assets = assetsRef.current;
      if (!assets) return;
      const chosen = COLORWAYS[selectedColor];
      const nextColor = new THREE.Color(chosen.hex);
      const collarColor = nextColor.clone().multiplyScalar(0.92);

      gsap.to(assets.mats.matTee.color, {
        r: nextColor.r,
        g: nextColor.g,
        b: nextColor.b,
        duration: 0.55,
        ease: "power2.out",
      });
      gsap.to(assets.mats.matTeeCollar.color, {
        r: collarColor.r,
        g: collarColor.g,
        b: collarColor.b,
        duration: 0.55,
        ease: "power2.out",
      });
    },
    { scope: sectionRef, dependencies: [selectedColor] },
  );

  const jumpToStage = contextSafe((idx: number) => {
    const st = ScrollTrigger.getById("journey-pipeline");
    if (!st) return;
    const targetY = st.labelToScroll(`stage${idx}`);
    gsap.to(window, {
      scrollTo: { y: targetY },
      duration: 0.85,
      ease: "power3.inOut",
    });
  });

  function handleSelectColor(idx: number) {
    setSelectedColor(idx);
    const chosen = COLORWAYS[idx];
    onColorwayChange?.(`${chosen.name} (${chosen.gsm})`);
  }

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="journey-section relative border-t border-border bg-background"
      aria-label="3D Clothing Production & Shipment Journey"
    >
      {/* Desktop Full-Bleed Pinned 3D WebGL + GSAP Stage */}
      <div className="journey-stage relative hidden h-svh min-h-[700px] w-full flex-col justify-between overflow-hidden px-8 pt-24 pb-10 md:flex">
        {/* Interactive 360° Drag-Orbit 3D WebGL Canvas */}
        <div
          ref={canvasHostRef}
          className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        />

        {/* Left Atmospheric Gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[44%] bg-gradient-to-r from-background via-background/85 to-transparent"
        />

        {/* Top Clickable 5-Step Pipeline HUD */}
        <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1400px]">
          <div className="pointer-events-auto flex items-center justify-between gap-2">
            {STAGES.map((stage, idx) => {
              const isActive = idx === activeStep;
              const isDone = idx < activeStep;
              const Icon = STAGE_ICONS[idx];
              return (
                <button
                  key={stage.num}
                  type="button"
                  onClick={() => jumpToStage(idx)}
                  data-cursor="magnet"
                  className={`focus-ring flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                    isActive
                      ? "text-brand"
                      : isDone
                        ? "text-chrome"
                        : "text-muted/75 hover:text-chrome"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                      isActive
                        ? "border-brand bg-brand text-white"
                        : isDone
                          ? "border-chrome/50 text-chrome"
                          : "border-border text-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="hidden font-mono text-[10px] text-brand lg:inline">
                    {stage.num}
                  </span>
                  <span className="hidden lg:inline">{stage.tag}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 h-[2px] w-full bg-border">
            <div className="journey-rail-fill h-full w-full origin-left scale-x-0 bg-brand" />
          </div>
        </div>

        {/* Floating Editorial Narrative + Live Colorway Picker (Left) */}
        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 items-center">
          <div className="relative h-[400px] w-full max-w-[460px]">
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

                {/* Live 3D T-Shirt Colorway Customizer on Stage 01 */}
                {idx === 0 ? (
                  <div className="pointer-events-auto mt-6">
                    <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                      Live 3D Fabric Colorway · {COLORWAYS[selectedColor].gsm}
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {COLORWAYS.map((c, ci) => {
                        const on = ci === selectedColor;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => handleSelectColor(ci)}
                            data-cursor="magnet"
                            className={`focus-ring inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
                              on
                                ? "border-brand bg-brand/15 text-chrome"
                                : "border-border bg-surface-deep/75 text-muted hover:border-chrome/40 hover:text-chrome"
                            }`}
                          >
                            <span
                              aria-hidden
                              className="h-3 w-3 rounded-full border border-white/25"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {idx === STAGES.length - 1 ? (
                  <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
                    <a
                      href="#estimator"
                      data-cursor="magnet"
                      className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_rgba(220,38,38,0.35)] transition-transform hover:scale-[1.03]"
                    >
                      <span>Estimate Your Run</span>
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                    </a>
                    <Link
                      href="/showcase"
                      data-cursor="magnet"
                      className="focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-surface-deep/80 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-chrome transition-colors hover:border-brand hover:text-brand"
                    >
                      <span>Product Showcase</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Telemetry Bar */}
        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          <span className="inline-flex items-center gap-2">
            <MoveHorizontal className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span>Drag 3D Stage To Orbit · Scroll Or Click 01–05</span>
          </span>
          <Link
            href="/showcase"
            className="pointer-events-auto inline-flex items-center gap-1.5 transition-colors hover:text-brand"
          >
            <span>Product Showcase</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
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
