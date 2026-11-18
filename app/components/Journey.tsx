"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Factory,
  Globe,
  MoveHorizontal,
  PackageCheck,
  PencilRuler,
  Ship,
  ShieldCheck,
  Truck,
} from "lucide-react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { buildRealisticStages, type RealisticStageAssets } from "./three";
import { DesignCallouts, type CalloutHandle, type CalloutItem } from "./DesignCallouts";
import { DesignStudioPanel, STUDIO_AUTOPLAY_MS } from "./DesignStudioPanel";
import {
  BOM_ROWS,
  COLORWAYS,
  DESIGN_SERVICES,
  MODE_TAGS,
  TECH_CALLOUTS,
  type DesignMode,
} from "./designStudioData";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

const STAGES = [
  {
    num: "01",
    tag: "DESIGN AND INNOVATION",
    title: "Design and Innovation",
    body: "Every garment is engineered digitally first — tech pack, bill of materials, 3D sampling, development specs and a line-sheet presentation before a single yard is cut.",
  },
  {
    num: "02",
    tag: "SOURCING",
    title: "Global Sourcing",
    body: "DOJO connects you directly with apparel factories and fabric and trim suppliers in Bangladesh and China. We match suppliers to your product category, quality standards, target cost, order volume, and delivery timeline. Before you place an order, we compare quotes, confirm minimum order quantities and lead times, and coordinate material samples. Once you select a factory, we support final costing, sample approvals, and bulk production follow-up.",
  },
  {
    num: "03",
    tag: "FACTORY PRODUCTION",
    title: "Into The Factory",
    body: "DOJO works directly with your factory to keep bulk production aligned with approved samples, specifications, and delivery dates. Before production starts, we confirm material readiness, outstanding approvals, and the production schedule. We then track progress from cutting and sewing through finishing and packing, flag delays or quality issues, and follow up on corrective actions. You receive updates on production status, open issues, and shipment readiness.",
  },
  {
    num: "04",
    tag: "QUALITY ASSURANCE",
    title: "Quality Assurance",
    body: "DOJO is your second set of eyes on the factory floor in Bangladesh. We check garment measurements, workmanship, finishing, and packaging against your requirements, flag defects early, and follow up on factory corrections. We document findings with photos and measurement records and coordinate final pre-shipment inspections using your AQL criteria.",
  },
  {
    num: "05",
    tag: "READY TO SHIP",
    title: "Packed & QC Cleared",
    body: "QC-passed garments are folded, polybagged, strapped onto Euro pallets, barcode-scanned, and stretch-wrapped for export.",
  },
  {
    num: "06",
    tag: "CARGO TRUCK",
    title: "Cargo Truck Dispatch",
    body: "Sealed 40ft container trucks haul your palletized inventory along the highway from the factory loading dock straight to the export terminal.",
  },
  {
    num: "07",
    tag: "About Dojo",
    title: "About Dojo",
    body: "DOJO Design & Sourcing is a Bangladesh-based apparel partner for brands and retailers. We bring design, product development, sourcing, production follow-up, and quality assurance together under one team. From the first sketch to pre-shipment inspection, we work directly with factories and suppliers to keep your specifications, approvals, and timelines on track.",
  },
] as const;

const STAGE_ICONS = [PencilRuler, Globe, Factory, ShieldCheck, PackageCheck, Truck, Ship] as const;

const SOURCING_CALLOUTS: CalloutItem[] = [
  { key: "srcMill", anchor: "srcMill", label: "Fabric Sourcing", kind: "leader" },
  { key: "srcTrims", anchor: "srcTrims", label: "Trims Sourcing", kind: "leader" },
  { key: "srcHub", anchor: "srcHub", label: "Factory Sourcing", kind: "leader" },
  // { key: "srcFabric", anchor: "srcFabric", label: "Bulk Fabric Sourcing", kind: "leader" },
  // { key: "srcTrimCard", anchor: "srcTrimCard", label: "Approved Trims Card", kind: "leader" },
];

const QA_CALLOUTS: CalloutItem[] = [
  { key: "qaBoard", anchor: "qaBoard", label: "Light-board flat-lay inspection", kind: "leader" },
  { key: "qaMagnifier", anchor: "qaMagnifier", label: "Seam & workmanship check", kind: "leader" },
  { key: "qaMeasure", anchor: "qaMeasure", label: "Spec measurement vs. tech pack", kind: "leader" },
  { key: "qaDetector", anchor: "qaDetector", label: "Needle detector · 0 metal", kind: "leader" },
  { key: "qaStamp", anchor: "qaStamp", label: "QC passed · AQL 2.5", kind: "leader" },
  { key: "qaReport", anchor: "qaReport", label: "Final inspection report", kind: "leader" },
];

const GROUND_Y = -1.35;

/** Half-width (world units) the narrow-screen camera keeps in view — the widest stage. */
const STAGE_HALF_WIDTH = 3.4;
/** Half of the visible height (world units) needed so stages stay above the copy block. */
const STAGE_FIT_HALF_HEIGHT = 4.4;

const WATERMARK_DARK = 0xffffff;
const WATERMARK_LIGHT = 0x1e2a4a;
const WATERMARK_OPACITY = 0.07;

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
    watermarkMat: THREE.MeshBasicMaterial;
    rimLight: THREE.SpotLight;
  } | null>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [studioMode, setStudioMode] = useState<DesignMode>("techpack");
  const [studioAutoplay, setStudioAutoplay] = useState(true);
  const [hoveredBom, setHoveredBom] = useState<number | null>(null);
  const [stagePinned, setStagePinned] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const studioModeRef = useRef<DesignMode>("techpack");
  const calloutsRef = useRef<CalloutHandle>(null);
  const qaCalloutsRef = useRef<CalloutHandle>(null);
  const sourcingCalloutsRef = useRef<CalloutHandle>(null);

  useEffect(() => {
    studioModeRef.current = studioMode;
  }, [studioMode]);

  // Auto-tour the five design services while Stage 01 is on screen, until the user picks one.
  useEffect(() => {
    if (!studioAutoplay || !stagePinned || activeStep !== 0) return;
    const id = window.setTimeout(() => {
      const idx = DESIGN_SERVICES.findIndex((s) => s.mode === studioMode);
      const next = DESIGN_SERVICES[(idx + 1) % DESIGN_SERVICES.length];
      if (next) setStudioMode(next.mode);
    }, STUDIO_AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [studioAutoplay, stagePinned, activeStep, studioMode]);

  const calloutItems = useMemo<CalloutItem[]>(() => {
    if (studioMode === "techpack") {
      return TECH_CALLOUTS.map((c) => ({ key: c.anchor, anchor: c.anchor, label: c.label, kind: "leader" }));
    }
    if (studioMode === "bom") {
      return BOM_ROWS.map((r) => ({
        key: r.anchor,
        anchor: r.anchor,
        label: `${r.no} · ${r.component} — ${r.spec}`,
        kind: "pin",
        index: r.no,
        active: hoveredBom === r.no,
      }));
    }
    return (MODE_TAGS[studioMode] ?? []).map((t) => ({
      key: t.anchor,
      anchor: t.anchor,
      label: t.label,
      kind: t.leader ? "leader" : "tag",
    }));
  }, [studioMode, hoveredBom]);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference)",
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
            setWebglFailed(true);
            return;
          }

          const width = host.clientWidth || window.innerWidth;
          const height = host.clientHeight || window.innerHeight;
          // Phones and small tablets: lighter pixel ratio, shadows and garment mesh.
          const compact = Math.min(window.innerWidth, window.innerHeight) < 700;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 2));
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
          keyLight.shadow.mapSize.set(compact ? 1024 : 2048, compact ? 1024 : 2048);
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

          // Dojo Design & Sourcing crane mark as a faint watermark behind every 3D stage.
          // The navy PNG is turned into a white mask, then tinted per theme.
          const watermarkMat = new THREE.MeshBasicMaterial({
            color: theme === "light" ? WATERMARK_LIGHT : WATERMARK_DARK,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            fog: false,
          });
          const watermarkGeo = new THREE.PlaneGeometry(3.2, 3.2);
          const watermark = new THREE.Mesh(watermarkGeo, watermarkMat);
          watermark.position.set(2.35, 0.35, -5);
          watermark.renderOrder = -1;
          scene.add(watermark);
          let watermarkTex: THREE.CanvasTexture | null = null;
          const logoImg = new Image();
          logoImg.onload = () => {
            const c = document.createElement("canvas");
            c.width = 256;
            c.height = 256;
            const ctx = c.getContext("2d");
            if (!ctx) return;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(logoImg, 0, 0, 256, 256);
            ctx.globalCompositeOperation = "source-in";
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, 256, 256);
            watermarkTex = new THREE.CanvasTexture(c);
            watermarkTex.colorSpace = THREE.SRGBColorSpace;
            watermarkMat.map = watermarkTex;
            watermarkMat.opacity = WATERMARK_OPACITY;
            watermarkMat.needsUpdate = true;
          };
          logoImg.src = "/dojo-crane-mark.png";

          sceneEnvRef.current = { scene, renderer, portalMat, rimLight, watermarkMat };

          // Build 5 Separated Realistic 3D Components
          const assets = buildRealisticStages(stageAnchor, groundClip, {
            detail: compact ? 0.55 : 1,
          });
          assetsRef.current = assets;
          const {
            tshirtGroup,
            factoryGroup,
            steamPuffs,
            hvacFans,
            qaGroup,
            qaStage,
            sourcingGroup,
            sourcingStage,
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
          let running = false;
          const timer = new THREE.Timer();
          const wavePos = waveGeo.attributes.position as THREE.BufferAttribute;

          const { designStudio } = assets;
          const renderLoop = () => {
            timer.update();
            const t = timer.getElapsed();

            designStudio.setMode(studioModeRef.current);
            designStudio.update(t, timer.getDelta());
            tshirtGroup.rotation.y = Math.sin(t * 0.65) * designStudio.getSway();
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

            qaStage.update(t);
            sourcingStage.update(t);
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

            // Studio annotations fade out as the jacket leaves for Stage 02.
            const lift = tshirtGroup.position.y - 0.12;
            const fade = tshirtGroup.visible ? 1 - Math.min(1, Math.max(0, lift / 0.6)) : 0;
            calloutsRef.current?.update(
              camera,
              host.clientWidth,
              host.clientHeight,
              designStudio.anchors,
              fade,
            );
            const sourcingFade = sourcingGroup.visible
              ? 1 - Math.min(1, Math.abs(sourcingGroup.position.y) / 0.6)
              : 0;
            sourcingCalloutsRef.current?.update(
              camera,
              host.clientWidth,
              host.clientHeight,
              sourcingStage.anchors,
              sourcingFade,
            );
            const qaFade = qaGroup.visible
              ? 1 - Math.min(1, Math.abs(qaGroup.position.y) / 0.6)
              : 0;
            qaCalloutsRef.current?.update(
              camera,
              host.clientWidth,
              host.clientHeight,
              qaStage.anchors,
              qaFade,
            );
            if (running) rafId = requestAnimationFrame(renderLoop);
          };
          const startLoop = () => {
            if (running) return;
            running = true;
            timer.reset();
            rafId = requestAnimationFrame(renderLoop);
          };
          const stopLoop = () => {
            running = false;
            cancelAnimationFrame(rafId);
          };
          // Only render while the journey is on screen (saves battery/GPU during the hero etc.).
          const visibilityObserver = new IntersectionObserver(
            ([entry]) => (entry?.isIntersecting ? startLoop() : stopLoop()),
            { rootMargin: "200px 0px" },
          );
          visibilityObserver.observe(host);

          // Wide screens: stage on the right of the copy column. Narrow/portrait: stage centred in
          // the upper part of the screen with the copy below, camera pulled back to fit its width.
          const applyFraming = (w: number, h: number) => {
            const aspect = w / h;
            camera.aspect = aspect;
            const fog = scene.fog instanceof THREE.FogExp2 ? scene.fog : null;
            if (w >= 1280 && aspect >= 1.15) {
              stageAnchor.position.x = 2.05;
              camera.position.set(-0.9, 1.15, 9.8);
              camera.lookAt(1.05, -0.15, 0);
              watermark.position.set(2.35, 0.35, -5);
              if (fog) fog.density = 0.036;
            } else {
              stageAnchor.position.x = 0;
              const vHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
              const hHalf = vHalf * aspect;
              // Fit the widest stage horizontally and keep it inside the upper ~45% vertically.
              // Landscape screens in this layout have little height above the copy: frame smaller/higher.
              const fitHalfHeight = aspect > 1 ? STAGE_FIT_HALF_HEIGHT * 1.3 : STAGE_FIT_HALF_HEIGHT;
              const dist = Math.max(9.8, STAGE_HALF_WIDTH / hHalf + 2.5, fitHalfHeight / vHalf);
              const lookY = -(aspect > 1 ? 0.36 : 0.28) * vHalf * dist;
              camera.position.set(0, lookY + 1.6, dist);
              camera.lookAt(0, lookY, 0);
              watermark.position.set(0, 0.5, -5);
              if (fog) fog.density = (0.036 * 9.8) / dist;
            }
            camera.updateProjectionMatrix();
          };
          applyFraming(width, height);

          const onResize = () => {
            if (!host || !renderer) return;
            const w = host.clientWidth || window.innerWidth;
            const h = host.clientHeight || window.innerHeight;
            applyFraming(w, h);
            renderer.setSize(w, h);
          };
          window.addEventListener("resize", onResize);

          // GSAP ScrollTrigger Master Timeline with Exact Named Stage Labels (7 stages).
          // Each stage holds for ~1.2 timeline units; transitions start 0.4 after a label.
          const STAGE_COUNT = STAGES.length;
          const TIMELINE_LENGTH = 7.6;
          const tl = gsap.timeline({
            scrollTrigger: {
              id: "journey-pipeline",
              trigger: ".journey-stage",
              start: "top top",
              end: "+=6800",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              onToggle: (self) => setStagePinned(self.isActive),
              onUpdate: (self) => {
                const p = self.progress * TIMELINE_LENGTH;
                const idx =
                  p < 0.85 ? 0 : Math.min(STAGE_COUNT - 1, Math.floor((p - 0.85) / 1.2) + 1);
                setActiveStep(idx);
              },
            },
          });

          tl.addLabel("stage0", 0);
          tl.to(
            ".journey-rail-fill",
            { scaleX: 1, ease: "none", duration: TIMELINE_LENGTH },
            0,
          );

          // STAGE 1 -> 2: Design → Sourcing (0.55..1.25)
          tl.to(
            tshirtGroup.position,
            { y: 8.5, x: 2.2, z: -2.2, duration: 0.55, ease: "power2.in" },
            0.55,
          )
            .to(tshirtGroup.rotation, { z: 0.4, x: -0.3, duration: 0.55 }, 0.55)
            .set(tshirtGroup, { visible: false }, 1.1)
            .to(texts[0], { autoAlpha: 0, y: -24, duration: 0.28 }, 0.55)
            .to(
              sourcingGroup.position,
              { y: 0, duration: 0.65, ease: "power3.out" },
              0.65,
            )
            .to(texts[1], { autoAlpha: 1, y: 0, duration: 0.35 }, 0.88)
            .addLabel("stage1", 1.35);

          // STAGE 2 -> 3: Sourcing → Factory (1.75..2.45)
          tl.to(
            sourcingGroup.position,
            { y: 8.5, x: 2.4, duration: 0.55, ease: "power2.in" },
            1.75,
          )
            .to(sourcingGroup.rotation, { y: -0.4, z: -0.15, duration: 0.55 }, 1.75)
            .set(sourcingGroup, { visible: false }, 2.3)
            .to(texts[1], { autoAlpha: 0, y: -24, duration: 0.28 }, 1.75)
            .to(
              factoryGroup.position,
              { y: 0, duration: 0.65, ease: "power3.out" },
              1.85,
            )
            .to(texts[2], { autoAlpha: 1, y: 0, duration: 0.35 }, 2.08)
            .addLabel("stage2", 2.55);

          // STAGE 3 -> 4: Factory → Quality Assurance (2.95..3.65)
          tl.to(
            factoryGroup.position,
            { y: 8.5, x: -2.5, duration: 0.55, ease: "power2.in" },
            2.95,
          )
            .to(factoryGroup.rotation, { y: -0.35, duration: 0.55 }, 2.95)
            .set(factoryGroup, { visible: false }, 3.5)
            .to(texts[2], { autoAlpha: 0, y: -24, duration: 0.28 }, 2.95)
            .to(
              qaGroup.position,
              { y: 0, duration: 0.65, ease: "power3.out" },
              3.05,
            )
            .to(texts[3], { autoAlpha: 1, y: 0, duration: 0.35 }, 3.28)
            .addLabel("stage3", 3.75);

          // STAGE 4 -> 5: Quality Assurance → Ready To Ship (4.15..4.85)
          tl.to(
            qaGroup.position,
            { y: 8.5, x: -2.2, duration: 0.55, ease: "power2.in" },
            4.15,
          )
            .to(qaGroup.rotation, { y: 0.3, z: 0.15, duration: 0.55 }, 4.15)
            .set(qaGroup, { visible: false }, 4.7)
            .to(texts[3], { autoAlpha: 0, y: -24, duration: 0.28 }, 4.15)
            .to(
              readyGroup.position,
              { y: 0, duration: 0.65, ease: "power3.out" },
              4.25,
            )
            .to(texts[4], { autoAlpha: 1, y: 0, duration: 0.35 }, 4.48)
            .addLabel("stage4", 4.95);

          // STAGE 5 -> 6: Ready To Ship → Cargo Truck (5.35..6.05)
          tl.to(
            readyGroup.position,
            { y: 8.5, x: 2.2, duration: 0.55, ease: "power2.in" },
            5.35,
          )
            .to(readyGroup.rotation, { z: -0.25, duration: 0.55 }, 5.35)
            .set(readyGroup, { visible: false }, 5.9)
            .to(texts[4], { autoAlpha: 0, y: -24, duration: 0.28 }, 5.35)
            .to(
              truckGroup.position,
              { y: -0.02, duration: 0.55, ease: "power3.out" },
              5.45,
            )
            .fromTo(
              truckGroup.position,
              { x: -1.8 },
              { x: 0.6, duration: 0.65, ease: "power1.inOut" },
              5.48,
            )
            .to(texts[5], { autoAlpha: 1, y: 0, duration: 0.35 }, 5.68)
            .addLabel("stage5", 6.18);

          // Wheels roll while the truck drives in.
          wheels.forEach((w) => {
            tl.to(w.rotation, { z: -Math.PI * 10, duration: 1.5, ease: "none" }, 5.48);
          });

          // STAGE 6 -> 7: Cargo Truck → Ocean Ship (6.45..7.50)
          tl.to(
            truckGroup.position,
            { x: 18, y: 2.2, duration: 0.45, ease: "power2.in" },
            6.45,
          )
            .set(truckGroup, { visible: false }, 6.9)
            .to(texts[5], { autoAlpha: 0, y: -24, duration: 0.25 }, 6.45)
            .to(
              horizonGrid.position,
              { y: -4.5, duration: 0.35, ease: "power2.in" },
              6.85,
            )
            .to(
              shipStageGroup.position,
              { y: -0.1, duration: 0.55, ease: "power3.out" },
              6.92,
            )
            .fromTo(
              shipStageGroup.position,
              { x: -0.4 },
              { x: 1.0, duration: 0.55, ease: "power1.inOut" },
              6.92,
            )
            .to(texts[6], { autoAlpha: 1, y: 0, duration: 0.32 }, 7.08)
            .addLabel("stage6", 7.5)
            .to({}, { duration: 0.1 }, 7.5);

          return () => {
            stopLoop();
            visibilityObserver.disconnect();
            host.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("resize", onResize);
            sceneEnvRef.current = null;
            assetsRef.current = null;
            assets.dispose();
            floorGeo.dispose();
            floorMat.dispose();
            watermarkGeo.dispose();
            watermarkMat.dispose();
            watermarkTex?.dispose();
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
      env.watermarkMat.color.setHex(theme === "light" ? WATERMARK_LIGHT : WATERMARK_DARK);
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

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="journey-section relative border-t border-border bg-background"
      aria-label="3D Clothing Production & Shipment Journey"
    >
      {/* Desktop Full-Bleed Pinned 3D WebGL + GSAP Stage */}
      <div
        className={`journey-stage relative h-svh min-h-[560px] w-full flex-col justify-between overflow-hidden px-4 pt-20 pb-4 sm:px-6 md:px-8 md:pt-24 md:pb-10 ${
          webglFailed ? "hidden" : "hidden motion-safe:flex"
        }`}
      >
        {/* Interactive 360° Drag-Orbit 3D WebGL Canvas */}
        <div
          ref={canvasHostRef}
          className="absolute inset-0 z-0 cursor-grab touch-pan-y active:cursor-grabbing"
        />

        {/* Stage 01 design-studio annotations projected from the 3D jacket */}
        {/* (Leader-line labels need the wide layout; hidden on narrow screens.) */}
        <div className="hidden xl:contents">
          <DesignCallouts ref={calloutsRef} items={calloutItems} />
          {/* Stage 04 quality-assurance annotations */}
          <DesignCallouts ref={qaCalloutsRef} items={QA_CALLOUTS} />
          {/* Stage 02 sourcing annotations */}
          <DesignCallouts ref={sourcingCalloutsRef} items={SOURCING_CALLOUTS} />
        </div>

        {/* Left Atmospheric Gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[44%] bg-gradient-to-r from-background via-background/85 to-transparent xl:block"
        />
        {/* Bottom gradient behind the copy on narrow screens */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[58%] bg-gradient-to-t from-background via-background/90 to-transparent xl:hidden"
        />

        {/* Top Clickable 5-Step Pipeline HUD */}
        <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1400px]">
          <div className="pointer-events-auto flex items-center justify-between gap-1 sm:gap-2">
            {STAGES.map((stage, idx) => {
              const isActive = idx === activeStep;
              const isDone = idx < activeStep;
              const Icon = STAGE_ICONS[idx];
              return (
                <button
                  key={stage.num}
                  type="button"
                  onClick={() => jumpToStage(idx)}
                  aria-label={`${stage.num} ${stage.title}`}
                  title={stage.title}
                  data-cursor="magnet"
                  className={`focus-ring flex items-center gap-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
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
                  <span className="hidden xl:inline">{stage.tag}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 h-[2px] w-full bg-border sm:mt-4">
            <div className="journey-rail-fill h-full w-full origin-left scale-x-0 bg-brand" />
          </div>
        </div>

        {/* Floating Editorial Narrative + Live Colorway Picker (Left) */}
        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 items-end xl:items-center">
          <div className="relative h-[52svh] max-h-[500px] w-full max-w-[560px] xl:h-[500px] xl:max-w-[460px]">
            {STAGES.map((stage, idx) => (
              <div
                key={stage.num}
                className="journey-copy absolute inset-0 flex flex-col justify-end xl:justify-center"
                style={{ opacity: idx === 0 ? 1 : 0 }}
              >
                <h2 className="text-[1.7rem] font-extrabold uppercase leading-[1.03] tracking-wide text-chrome sm:text-4xl lg:text-5xl">
                  {stage.title}
                </h2>
                {idx === 0 ? (
                  <DesignStudioPanel
                    mode={studioMode}
                    autoplay={studioAutoplay && stagePinned && activeStep === 0}
                    onSelectMode={(m) => {
                      setStudioAutoplay(false);
                      setStudioMode(m);
                    }}
                  />
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:mt-5 sm:text-base">
                    {stage.body}
                  </p>
                )}


                {idx === STAGES.length - 1 ? (
                  <div className="pointer-events-auto mt-4 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
                    <a
                      href="#estimator"
                      data-cursor="magnet"
                      className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[11px] sm:px-6 sm:py-3 font-bold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_rgba(220,38,38,0.35)] transition-transform hover:scale-[1.03]"
                    >
                      <span>Estimate Your Run</span>
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                    </a>
                    <Link
                      href="/showcase"
                      data-cursor="magnet"
                      className="focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-surface-deep/80 px-5 py-2.5 text-[11px] sm:px-6 sm:py-3 font-bold uppercase tracking-[0.2em] text-chrome transition-colors hover:border-brand hover:text-brand"
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
        <div className="pointer-events-none relative z-10 mx-auto mt-3 flex w-full max-w-[1400px] items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[11px] sm:tracking-[0.22em]">
          <span className="inline-flex items-center gap-2">
            <MoveHorizontal className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="hidden sm:inline">Drag 3D Stage To Orbit · Scroll Or Click 01–07</span>
            <span className="sm:hidden">Scroll · Drag to orbit</span>
          </span>
          <Link
            href="/showcase"
            className="pointer-events-auto hidden items-center gap-1.5 transition-colors hover:text-brand sm:inline-flex"
          >
            <span>Product Showcase</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      {/* Mobile / Reduced-Motion Fallback Vertical Timeline */}
      <div className={webglFailed ? "px-5 py-20" : "px-5 py-20 motion-safe:hidden"}>
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
                {stage.tag}
              </p>
              <h3 className="mt-1 text-xl font-bold uppercase text-chrome">
                {stage.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {stage.body}
              </p>
              {stage.num === "01" ? (
                <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
                  {DESIGN_SERVICES.map((svc) => (
                    <li key={svc.mode}>
                      <span className="font-semibold text-chrome">{svc.label}</span> — {svc.blurb}
                    </li>
                  ))}
                </ul>
              ) : null}
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
