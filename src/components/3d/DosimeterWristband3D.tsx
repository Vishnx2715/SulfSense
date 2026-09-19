import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sparkles } from 'lucide-react';
import { RawColorData, RiskState } from '../../types';

interface DosimeterWristband3DProps {
  rawColor?: RawColorData;
  deltaE?: number;
  estimatedDose?: number;
  riskState?: RiskState;
  showSensorBeam?: boolean;
}

export const DosimeterWristband3D: React.FC<DosimeterWristband3DProps> = ({
  rawColor = { r: 238, g: 228, b: 195, clear: 660 },
  deltaE = 0,
  estimatedDose = 0,
  riskState = 'NORMAL',
  showSensorBeam = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const stripMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const sensorBeamRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.8, 6.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x2a5eb3, 2.5, 15);
    blueLight.position.set(-4, 2, -3);
    scene.add(blueLight);

    // 5. Build Dosimeter Model Group
    const watchGroup = new THREE.Group();
    groupRef.current = watchGroup;

    // Watch Body (Navy/Dark Polycarbonate)
    const bodyGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.45, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0e224d,
      roughness: 0.35,
      metalness: 0.6,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    watchGroup.add(bodyMesh);

    // Metallic Outer Bezel Ring (Navy Chrome)
    const bezelGeo = new THREE.TorusGeometry(1.82, 0.1, 16, 64);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x4e7dcb,
      roughness: 0.2,
      metalness: 0.85,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.rotation.x = Math.PI / 2;
    bezelMesh.position.y = 0.22;
    watchGroup.add(bezelMesh);

    // Wristband Straps (Top & Bottom Rugged Silicon)
    const strapGeo = new THREE.BoxGeometry(1.3, 0.22, 2.2);
    const strapMat = new THREE.MeshStandardMaterial({
      color: 0x091533,
      roughness: 0.7,
      metalness: 0.1,
    });

    const topStrap = new THREE.Mesh(strapGeo, strapMat);
    topStrap.position.set(0, -0.05, 2.4);
    topStrap.rotation.x = 0.15;
    watchGroup.add(topStrap);

    const botStrap = new THREE.Mesh(strapGeo, strapMat);
    botStrap.position.set(0, -0.05, -2.4);
    botStrap.rotation.x = -0.15;
    watchGroup.add(botStrap);

    // Chemical Strip Cartridge Chamber (Recessed Rectangular Chamber)
    const chamberGeo = new THREE.BoxGeometry(1.4, 0.1, 1.0);
    const chamberMat = new THREE.MeshStandardMaterial({
      color: 0x1a2f50,
      roughness: 0.5,
    });
    const chamberMesh = new THREE.Mesh(chamberGeo, chamberMat);
    chamberMesh.position.set(0, 0.24, -0.3);
    watchGroup.add(chamberMesh);

    // PASSIVE CHEMICAL STRIP MATERIAL (Changes color based on H2S reaction)
    const stripGeo = new THREE.BoxGeometry(1.2, 0.08, 0.8);
    const stripMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(`rgb(${rawColor.r}, ${rawColor.g}, ${rawColor.b})`),
      roughness: 0.8,
      metalness: 0.05,
    });
    stripMaterialRef.current = stripMat;
    const stripMesh = new THREE.Mesh(stripGeo, stripMat);
    stripMesh.position.set(0, 0.26, -0.3);
    watchGroup.add(stripMesh);

    // OLED Miniature Display Surface
    const oledGeo = new THREE.BoxGeometry(1.4, 0.05, 0.65);
    const oledMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      roughness: 0.1,
      metalness: 0.9,
    });
    const oledMesh = new THREE.Mesh(oledGeo, oledMat);
    oledMesh.position.set(0, 0.24, 0.65);
    watchGroup.add(oledMesh);

    // Sensor Optical Light Beam / Emission Cone (TCS34725 / AS7341 ray)
    const beamGeo = new THREE.ConeGeometry(0.5, 0.7, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(0, 0.65, -0.3);
    beamMesh.rotation.x = Math.PI;
    sensorBeamRef.current = beamMesh;
    watchGroup.add(beamMesh);

    // Sensor Indicator Status LED
    const ledGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const ledMat = new THREE.MeshBasicMaterial({
      color: riskState === 'HAZARDOUS' ? 0xdc2626 : riskState === 'WARNING' ? 0xea580c : 0x10b981,
    });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0.65, 0.26, 0.65);
    watchGroup.add(ledMesh);

    // Protective Sapphire Glass Ring Top
    const glassGeo = new THREE.CylinderGeometry(1.68, 1.68, 0.02, 32);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.5,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(0, 0.3, 0);
    watchGroup.add(glassMesh);

    scene.add(watchGroup);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (watchGroup && isRotating) {
        watchGroup.rotation.y += delta * 0.45;
      }

      // Subtle beam pulse animation
      if (beamMesh) {
        beamMesh.scale.set(
          1 + Math.sin(clock.getElapsedTime() * 4) * 0.05,
          1 + Math.sin(clock.getElapsedTime() * 4) * 0.05,
          1 + Math.sin(clock.getElapsedTime() * 4) * 0.05
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Mouse drag interaction for 3D rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsRotating(false);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !watchGroup) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      watchGroup.rotation.y += deltaX * 0.01;
      watchGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 340;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, []);

  // Update chemical strip color dynamically whenever rawColor changes!
  useEffect(() => {
    if (stripMaterialRef.current) {
      stripMaterialRef.current.color.setRGB(rawColor.r / 255, rawColor.g / 255, rawColor.b / 255);
    }
  }, [rawColor]);

  // Update sensor beam visibility
  useEffect(() => {
    if (sensorBeamRef.current) {
      sensorBeamRef.current.visible = showSensorBeam;
    }
  }, [showSensorBeam]);

  return (
    <div className="relative w-full h-[360px] bg-gradient-to-b from-white to-navy-50/60 rounded-2xl border border-navy-100/80 shadow-navy-md overflow-hidden group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Control Badges */}
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-navy-800 border border-navy-100 shadow-sm backdrop-blur-md">
          <Eye className="w-3.5 h-3.5 text-navy-500 animate-pulse" />
          3D Interactive Model
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-navy-900 text-white/90">
          ΔE: {deltaE.toFixed(1)}
        </span>
      </div>

      {/* Strip Color Degradation Status Callout */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/95 rounded-xl border border-navy-100 shadow-sm backdrop-blur-md">
          <div
            className="w-5 h-5 rounded-md border border-gray-300 shadow-inner"
            style={{ backgroundColor: `rgb(${rawColor.r}, ${rawColor.g}, ${rawColor.b})` }}
          />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-navy-900 block">Chemical Strip Surface</span>
            <span className="text-gray-500 font-mono text-[10px]">
              RGB({rawColor.r},{rawColor.g},{rawColor.b})
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-2 rounded-lg border transition-all ${
              isRotating
                ? 'bg-navy-600 text-white border-navy-700 shadow-sm'
                : 'bg-white/90 text-navy-700 border-navy-200 hover:bg-navy-50'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
