import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useCubeTexture, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  EffectComposer,
  GPUComputationRenderer,
  MeshSurfaceSampler,
  RenderPass,
  ShaderPass,
  SkeletonUtils,
} from "three-stdlib";
import type { Variable } from "three-stdlib";
import dolphinVertexShader from "./shaders/Dolphin/vertex.glsl";
import dolphinFragmentShader from "./shaders/Dolphin/fragment.glsl";
import sparkleVertexShader from "./shaders/Dolphin/sparkleVertex.glsl";
import sparkleFragmentShader from "./shaders/Dolphin/sparkleFragment.glsl";
import flowFieldVertexShader from "./shaders/FlowField/vertex.glsl";
import flowFieldFragmentShader from "./shaders/FlowField/fragment.glsl";
import seabedVertexShader from "./shaders/Seabed/vertex.glsl";
import seabedFragmentShader from "./shaders/Seabed/fragment.glsl";
import wormholeVertexShader from "./shaders/Wormhole/vertex.glsl";
import wormholeFragmentShader from "./shaders/Wormhole/fragment.glsl";
import wakeParticlesVertexShader from "./shaders/WakeParticles/vertex.glsl";
import wakeParticlesFragmentShader from "./shaders/WakeParticles/fragment.glsl";
import wakeParticlesSimulationShader from "./shaders/WakeParticles/simulation.glsl";
import combinedVertexShader from "./shaders/PostProcessing/combined.vert.glsl";
import combinedFragmentShader from "./shaders/PostProcessing/combined.frag.glsl";

const DEFAULT_DOLPHIN_URL = "/experience/part3/chapter9/models/dolphin_anim.glb";
const DEFAULT_ENV_PATH = "/experience/part3/chapter9/textures/environmentMap/";
const DEFAULT_ENV_FILES = [
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png",
];

const DOLPHIN_TARGET_SIZE = 2.6;
const DOLPHIN_TARGET_OFFSET = new THREE.Vector3(0, 0.5, 0);
const DOLPHIN_FOCUS_TARGET = new THREE.Vector3(0, 0.5, 0);

const CombinedShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGlowIntensity: { value: 0.4 },
    uAberration: { value: 0.003 },
    uMouseInfluence: { value: new THREE.Vector2(0, 0) },
    uGrainIntensity: { value: 0.05 },
    uVignetteStrength: { value: 0.15 },
  },
  vertexShader: combinedVertexShader,
  fragmentShader: combinedFragmentShader,
};

const getPixelRatio = (renderer: THREE.WebGLRenderer) => {
  const ratio = renderer.getPixelRatio?.() ?? (typeof window !== "undefined" ? window.devicePixelRatio : 1);
  return Math.min(ratio, 2);
};

const smoothNoise = (t: number, offset: number) => {
  const x = t + offset;
  return (
    Math.sin(x * 1.0) * 0.5 +
    Math.sin(x * 2.3) * 0.25 +
    Math.sin(x * 4.1) * 0.125 +
    Math.sin(x * 7.9) * 0.0625
  );
};

type SpeedLine = {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  angle: number;
  radius: number;
  speed: number;
  baseOpacity: number;
};

class WormholeSystem {
  private scene: THREE.Scene;
  private root: THREE.Group;
  private config: {
    speedLineCount: number;
    lineSpeed: number;
    innerRadius: number;
    outerRadius: number;
    startZ: number;
    endZ: number;
    speedLineColor1: THREE.Color;
    speedLineColor2: THREE.Color;
    speedLineColor3: THREE.Color;
    tubeRadius: number;
    tubeSegments: number;
    tubeRadialSegments: number;
    tubeLength: number;
    tubeSpeed: number;
    curvePoints: number;
  };
  private speedLines: SpeedLine[] = [];
  private tunnelGroup: THREE.Group;
  private tubeGeometry?: THREE.TubeGeometry;
  private tubeMaterial?: THREE.ShaderMaterial;
  private tubeMesh?: THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>;

  constructor(root: THREE.Group, scene: THREE.Scene) {
    this.scene = scene;
    this.root = root;
    this.config = {
      speedLineCount: 200,
      lineSpeed: 12,
      innerRadius: 20,
      outerRadius: 40,
      startZ: 100,
      endZ: -100,
      speedLineColor1: new THREE.Color(0x00ffff),
      speedLineColor2: new THREE.Color(0x00a1ff),
      speedLineColor3: new THREE.Color(0x91cdff),
      tubeRadius: 50,
      tubeSegments: 70,
      tubeRadialSegments: 30,
      tubeLength: 1000,
      tubeSpeed: 0.02,
      curvePoints: 5,
    };

    this.tunnelGroup = new THREE.Group();
    this.root.add(this.tunnelGroup);

    this.createSpeedLines();
    this.createTube();
  }

  private createTube() {
    const halfLength = this.config.tubeLength / 2;
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i < this.config.curvePoints; i += 1) {
      const t = i / (this.config.curvePoints - 1);
      const z = halfLength - this.config.tubeLength * t;
      curvePoints.push(new THREE.Vector3(0, 0, z));
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    this.tubeGeometry = new THREE.TubeGeometry(
      curve,
      this.config.tubeSegments,
      this.config.tubeRadius,
      this.config.tubeRadialSegments,
      false
    );

    const positions = this.tubeGeometry.attributes.position.array as Float32Array;
    const verticesPerSegment = this.config.tubeRadialSegments + 1;

    for (let i = 0; i < this.config.tubeSegments + 1; i += 1) {
      const u = i / this.config.tubeSegments;
      const radiusScale = 1 - u * 0.8;

      for (let j = 0; j < verticesPerSegment; j += 1) {
        const index = (i * verticesPerSegment + j) * 3;
        const centerPoint = curve.getPointAt(Math.min(u, 1));

        const x = positions[index];
        const y = positions[index + 1];

        const offsetX = x - centerPoint.x;
        const offsetY = y - centerPoint.y;

        positions[index] = centerPoint.x + offsetX * radiusScale;
        positions[index + 1] = centerPoint.y + offsetY * radiusScale;
      }
    }

    this.tubeGeometry.attributes.position.needsUpdate = true;
    this.tubeGeometry.computeVertexNormals();

    this.tubeMaterial = new THREE.ShaderMaterial({
      vertexShader: wormholeVertexShader,
      fragmentShader: wormholeFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0x001a33) },
        uColor2: { value: new THREE.Color(0x0066cc) },
        uColor3: { value: new THREE.Color(0x00ddff) },
        fogColor: {
          value: this.scene.fog ? this.scene.fog.color : new THREE.Color(0x001235),
        },
        fogNear: { value: (this.scene.fog as THREE.Fog)?.near ?? 1 },
        fogFar: { value: (this.scene.fog as THREE.Fog)?.far ?? 100 },
      },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      fog: true,
    });

    this.tubeMesh = new THREE.Mesh(this.tubeGeometry, this.tubeMaterial);
    this.root.add(this.tubeMesh);
  }

  private createSpeedLines() {
    const colors = [
      this.config.speedLineColor1,
      this.config.speedLineColor2,
      this.config.speedLineColor3,
    ];

    const geometries = new Map<string, THREE.BufferGeometry>();
    const materials = new Map<number, THREE.MeshBasicMaterial>();

    for (let i = 0; i < this.config.speedLineCount; i += 1) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const length = 2 + Math.random() * 6;
      const thickness = 0.05 + Math.random() * 0.1;

      const geoKey = `${length.toFixed(2)}_${thickness.toFixed(3)}`;
      let geometry = geometries.get(geoKey);
      if (!geometry) {
        geometry = new THREE.BoxGeometry(thickness, thickness, length);
        geometries.set(geoKey, geometry);
      }

      const matKey = color.getHex();
      let material = materials.get(matKey);
      if (!material) {
        material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.9,
        });
        materials.set(matKey, material);
      }

      const mesh = new THREE.Mesh(geometry, material);

      const angle = Math.random() * Math.PI * 2;
      const radius =
        this.config.innerRadius +
        Math.random() * (this.config.outerRadius - this.config.innerRadius);

      const z =
        this.config.startZ +
        Math.random() * (this.config.endZ - this.config.startZ);

      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, z);

      this.speedLines.push({
        mesh,
        angle,
        radius,
        speed: this.config.lineSpeed * (0.5 + Math.random() * 0.5),
        baseOpacity: 0.6 + Math.random() * 0.4,
      });
      this.tunnelGroup.add(mesh);
    }
  }

  update(delta: number) {
    const zRange = this.config.startZ - this.config.endZ;
    const invZRange = 1 / zRange;

    for (const line of this.speedLines) {
      const cosA = Math.cos(line.angle);
      const sinA = Math.sin(line.angle);

      line.mesh.position.z -= line.speed * delta;

      if (line.mesh.position.z < this.config.endZ) {
        line.mesh.position.z = this.config.startZ;
      }

      const normalizedZ = (line.mesh.position.z - this.config.endZ) * invZRange;
      const radiusScale = 0.2 + normalizedZ * 0.8;
      const currentRadius = line.radius * radiusScale;

      line.mesh.position.x = cosA * currentRadius;
      line.mesh.position.y = sinA * currentRadius;

      let opacity;
      if (normalizedZ > 0.9) {
        opacity = (1 - normalizedZ) * 10;
      } else if (normalizedZ < 0.1) {
        opacity = normalizedZ * 10;
      } else {
        opacity = 1;
      }
      line.mesh.material.opacity = opacity * line.baseOpacity;

      const scaleValue = 0.3 + normalizedZ * 0.7;
      line.mesh.scale.set(scaleValue, scaleValue, 1);
    }

    if (this.tubeMaterial?.uniforms) {
      this.tubeMaterial.uniforms.uTime.value += delta;

      if (this.scene.fog) {
        this.tubeMaterial.uniforms.fogColor.value.copy(this.scene.fog.color);
        this.tubeMaterial.uniforms.fogNear.value = (this.scene.fog as THREE.Fog)?.near ?? 1;
        this.tubeMaterial.uniforms.fogFar.value = (this.scene.fog as THREE.Fog)?.far ?? 100;
      }
    }
  }

  dispose() {
    for (const line of this.speedLines) {
      line.mesh.geometry.dispose();
      line.mesh.material.dispose();
      this.tunnelGroup.remove(line.mesh);
    }

    if (this.tubeMesh && this.tubeGeometry && this.tubeMaterial) {
      this.tubeGeometry.dispose();
      this.tubeMaterial.dispose();
      this.root.remove(this.tubeMesh);
    }

    this.root.remove(this.tunnelGroup);
  }
}

type FlowParticle = {
  offset: number;
  speed: number;
  swirl: number;
};

class FlowFieldSystem {
  private root: THREE.Group;
  private config: {
    particleCount: number;
    bounds: { x: number; y: number; z: number };
    flowSpeed: number;
    noiseScale: number;
    turbulence: number;
  };
  private particles: FlowParticle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  public points: THREE.Points;
  private _noiseCache: { frame: number; data: Record<string, { x: number; y: number; z: number }> } | null = null;
  private _frameCount = 0;

  constructor(root: THREE.Group) {
    this.root = root;
    this.config = {
      particleCount: 1500,
      bounds: { x: 80, y: 50, z: 100 },
      flowSpeed: 0.8,
      noiseScale: 0.08,
      turbulence: 0.3,
    };

    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.config.particleCount * 3);
    const velocities = new Float32Array(this.config.particleCount * 3);
    const sizes = new Float32Array(this.config.particleCount);
    const alphas = new Float32Array(this.config.particleCount);
    const particleTypes = new Float32Array(this.config.particleCount);

    for (let i = 0; i < this.config.particleCount; i += 1) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * this.config.bounds.x;
      positions[i3 + 1] = (Math.random() - 0.5) * this.config.bounds.y;
      positions[i3 + 2] = (Math.random() - 0.5) * this.config.bounds.z;

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      const type = Math.random();
      particleTypes[i] = type;

      const sizeVariation = Math.random();
      let baseSize;
      if (sizeVariation < 0.7) {
        baseSize = 1.0 + Math.random() * 2.0;
      } else {
        baseSize = 3.0 + Math.random() * 3.0;
      }
      sizes[i] = baseSize;

      alphas[i] = 0.3 + Math.random() * 0.5;

      this.particles.push({
        offset: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
        swirl: Math.random() * Math.PI * 2,
      });
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
    this.geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
    this.geometry.setAttribute(
      "particleType",
      new THREE.BufferAttribute(particleTypes, 1)
    );

    this.material = new THREE.ShaderMaterial({
      vertexShader: flowFieldVertexShader,
      fragmentShader: flowFieldFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(0x00ddff) },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.root.add(this.points);
  }

  private noise3D(x: number, y: number, z: number) {
    const n1 = Math.sin(x * 1.5 + z * 0.8) * Math.cos(y * 1.2 + x * 0.5);
    const n2 = Math.sin(y * 1.8 + x * 0.6) * Math.cos(z * 1.4 + y * 0.7);
    const n3 = Math.sin(z * 2.1 + y * 0.9) * Math.cos(x * 1.6 + z * 0.4);

    const detail =
      Math.sin(x * 4.0) * Math.cos(y * 4.0) * Math.sin(z * 4.0) * 0.3;

    return (n1 + n2 + n3) / 3 + detail;
  }

  private getFlowField(
    x: number,
    y: number,
    z: number,
    time: number,
    particle: FlowParticle
  ) {
    const scale = this.config.noiseScale;
    const t = time * 0.3;

    const cacheKey = `${Math.floor(x * 10)}_${Math.floor(y * 10)}_${Math.floor(
      z * 10
    )}_${Math.floor(t * 10)}`;
    if (this._noiseCache && this._noiseCache.data[cacheKey] && this._noiseCache.frame === this._frameCount) {
      return this._noiseCache.data[cacheKey];
    }

    if (!this._noiseCache || this._noiseCache.frame !== this._frameCount) {
      this._noiseCache = { frame: this._frameCount, data: {} };
    }

    const scale2 = scale * 2;
    const t15 = t * 1.5;

    const sx = x * scale;
    const sy = y * scale;
    const sz = z * scale;
    const sx2 = x * scale2;
    const sy2 = y * scale2;
    const sz2 = z * scale2;

    const nx1 = this.noise3D(sx + t, sy, sz);
    const ny1 = this.noise3D(sx, sy + t, sz + 1000);
    const nz1 = this.noise3D(sx, sy, sz + t + 2000);

    const nx2 = this.noise3D(sx2 + t15, sy2, sz2) * 0.5;
    const ny2 = this.noise3D(sx2, sy2 + t15, sz2 + 1000) * 0.5;
    const nz2 = this.noise3D(sx2, sy2, sz2 + t15 + 2000) * 0.5;

    const nx = nx1 + nx2;
    const ny = ny1 + ny2;
    const nz = nz1 + nz2;

    const angle1 = nx * Math.PI * 2;
    const angle2 = ny * Math.PI;
    const cosAngle1 = Math.cos(angle1);
    const cosAngle2 = Math.cos(angle2);
    const sinAngle1 = Math.sin(angle1);
    const sinAngle2 = Math.sin(angle2);

    const swirl = particle.swirl + time * 0.5;
    const turbulence = this.config.turbulence;
    const swirlX = Math.cos(swirl) * turbulence;
    const swirlY = Math.sin(swirl) * turbulence;

    const result = {
      x: cosAngle1 * cosAngle2 + swirlX,
      y: sinAngle2 + swirlY,
      z: sinAngle1 * cosAngle2 + nz * 0.3,
    };

    this._noiseCache.data[cacheKey] = result;

    return result;
  }

  update(delta: number, elapsed: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const velocities = this.geometry.attributes.velocity.array as Float32Array;

    const halfX = this.config.bounds.x / 2;
    const halfY = this.config.bounds.y / 2;
    const halfZ = this.config.bounds.z / 2;
    const margin = 5;
    const minX = -halfX - margin;
    const maxX = halfX + margin;
    const minY = -halfY - margin;
    const maxY = halfY + margin;
    const minZ = -halfZ - margin;
    const maxZ = halfZ + margin;

    const velDamp = 0.95;
    const velBlend = 0.05;
    const flowSpeed = this.config.flowSpeed;

    this._frameCount += 1;

    for (let i = 0; i < this.config.particleCount; i += 1) {
      const i3 = i * 3;
      const particle = this.particles[i];

      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      const flow = this.getFlowField(x, y, z, elapsed + particle.offset, particle);

      const flowX = flow.x;
      const flowY = flow.y + 0.3;
      const flowZ = flow.z + 0.2;

      const speedDelta = flowSpeed * particle.speed * delta;
      velocities[i3] = velocities[i3] * velDamp + flowX * velBlend;
      velocities[i3 + 1] = velocities[i3 + 1] * velDamp + flowY * velBlend;
      velocities[i3 + 2] = velocities[i3 + 2] * velDamp + flowZ * velBlend;

      positions[i3] += velocities[i3] * speedDelta;
      positions[i3 + 1] += velocities[i3 + 1] * speedDelta;
      positions[i3 + 2] += velocities[i3 + 2] * speedDelta;

      if (positions[i3] > maxX) {
        positions[i3] = minX;
      } else if (positions[i3] < minX) {
        positions[i3] = maxX;
      }

      if (positions[i3 + 1] > maxY) {
        positions[i3 + 1] = minY;
      } else if (positions[i3 + 1] < minY) {
        positions[i3 + 1] = maxY;
      }

      if (positions[i3 + 2] > maxZ) {
        positions[i3 + 2] = minZ;
      } else if (positions[i3 + 2] < minZ) {
        positions[i3 + 2] = maxZ;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.velocity.needsUpdate = true;

    this.material.uniforms.uTime.value = elapsed;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.root.remove(this.points);
  }
}

class SeabedSystem {
  private root: THREE.Group;
  private scene: THREE.Scene;
  private config: {
    particleCount: number;
    gridSize: number;
    gridDepth: number;
    depth: number;
    centerZ: number;
    noiseScale: number;
    noiseHeight: number;
    particleSize: number;
    color1: THREE.Color;
    color2: THREE.Color;
    color3: THREE.Color;
    sandColor: THREE.Color;
    rockColor: THREE.Color;
    glowIntensity: number;
    waveSpeed: number;
    waveAmplitude: number;
    scrollSpeed: number;
  };
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private particleSystem: THREE.Points;

  constructor(root: THREE.Group, scene: THREE.Scene) {
    this.root = root;
    this.scene = scene;
    const isLowPower =
      typeof navigator !== "undefined" &&
      (navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 6 : true);
    this.config = {
      particleCount: isLowPower ? 350 * 1000 : 2 * 1000 * 1000,
      gridSize: 300,
      gridDepth: 300,
      depth: -12,
      centerZ: 0,
      noiseScale: 0.065,
      noiseHeight: 6.0,
      particleSize: 300.5,
      color1: new THREE.Color(0x0a4d6e),
      color2: new THREE.Color(0x1a7fa8),
      color3: new THREE.Color(0x2eb8e6),
      sandColor: new THREE.Color(0x246f66),
      rockColor: new THREE.Color(0x53a2d8),
      glowIntensity: 0.4,
      waveSpeed: 0.1,
      waveAmplitude: 1.2,
      scrollSpeed: 3.5,
    };

    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.config.particleCount * 3);
    const randoms = new Float32Array(this.config.particleCount);
    const gridCoords = new Float32Array(this.config.particleCount * 2);

    for (let i = 0; i < this.config.particleCount; i += 1) {
      const x = (Math.random() - 0.5) * this.config.gridSize;
      const z = (Math.random() - 0.5) * this.config.gridDepth + this.config.centerZ;

      positions[i * 3] = x;
      positions[i * 3 + 1] = this.config.depth;
      positions[i * 3 + 2] = z;

      randoms[i] = Math.random();
      gridCoords[i * 2] = x;
      gridCoords[i * 2 + 1] = z;
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    this.geometry.setAttribute("aGridCoord", new THREE.BufferAttribute(gridCoords, 2));

    this.material = new THREE.ShaderMaterial({
      vertexShader: seabedVertexShader,
      fragmentShader: seabedFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2) },
        uSize: { value: this.config.particleSize },
        uNoiseScale: { value: this.config.noiseScale },
        uNoiseHeight: { value: this.config.noiseHeight },
        uColor1: { value: this.config.color1 },
        uColor2: { value: this.config.color2 },
        uColor3: { value: this.config.color3 },
        uSandColor: { value: this.config.sandColor },
        uRockColor: { value: this.config.rockColor },
        uGlowIntensity: { value: this.config.glowIntensity },
        uWaveSpeed: { value: this.config.waveSpeed },
        uWaveAmplitude: { value: this.config.waveAmplitude },
        uFogColor: {
          value: this.scene.fog ? this.scene.fog.color : new THREE.Color(0x121316),
        },
        uFogNear: { value: (this.scene.fog as THREE.Fog)?.near ?? 40 },
        uFogFar: { value: (this.scene.fog as THREE.Fog)?.far ?? 300 },
        uScrollSpeed: { value: this.config.scrollSpeed },
        uScrollOffset: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(this.geometry, this.material);
    this.particleSystem.frustumCulled = false;
    this.root.add(this.particleSystem);
  }

  update(elapsed: number) {
    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uScrollSpeed.value = this.config.scrollSpeed;
    this.material.uniforms.uScrollOffset.value = elapsed * this.config.scrollSpeed;

    if (this.scene.fog) {
      this.material.uniforms.uFogColor.value.copy(this.scene.fog.color);
      this.material.uniforms.uFogNear.value = (this.scene.fog as THREE.Fog)?.near ?? 40;
      this.material.uniforms.uFogFar.value = (this.scene.fog as THREE.Fog)?.far ?? 300;
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.root.remove(this.particleSystem);
  }
}

type DolphinSample = {
  vertexIndex: number;
  offset: THREE.Vector3;
  normal: THREE.Vector3;
  random: number;
  size: number;
};

class DolphinSystem {
  private root: THREE.Group;
  private material: THREE.ShaderMaterial;
  public dolphin: THREE.Group;
  public dolphinMesh: THREE.SkinnedMesh | null = null;
  private animationMixer: THREE.AnimationMixer | null = null;
  private animationAction: THREE.AnimationAction | null = null;
  private sparkleCount = 1500;
  private connectionDistance = 0.15;
  private sampler?: MeshSurfaceSampler;
  private sampledData: DolphinSample[] = [];
  private sparklesGeometry?: THREE.BufferGeometry;
  private sparklesMaterial?: THREE.ShaderMaterial;
  private sparkles?: THREE.Points;
  private linesGeometry?: THREE.BufferGeometry;
  private linesMaterial?: THREE.LineBasicMaterial;
  private lines?: THREE.LineSegments;
  private linePositions?: Float32Array;
  private lineColors?: Float32Array;
  private skinnedPositions: THREE.Vector3[] = [];
  private outset = 0.017;
  private _tmpBasePos = new THREE.Vector3();
  private _tmpSkinned = new THREE.Vector3();
  private _tmpLocalOut = new THREE.Vector3();
  private _tmpNormal = new THREE.Vector3();
  private _skeletonUpdatedThisFrame = false;
  private _matrixWorldUpdatedThisFrame = false;

  private dolphinMaterials: THREE.ShaderMaterial[] = [];

  constructor(
    root: THREE.Group,
    gltf: THREE.Object3D,
    animations: THREE.AnimationClip[],
    pixelRatio: number
  ) {
    this.root = root;
    this.material = new THREE.MeshBasicMaterial({
      color: 0x6fd3fb,
      wireframe: true,
      skinning: true
    }) as any;
    /*
    this.material = new THREE.ShaderMaterial({
      vertexShader: dolphinVertexShader,
      fragmentShader: dolphinFragmentShader,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(0x6fd3fb) },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide, // Ensure backfaces don't cull
    });
    */
    // DEBUG: Use Basic Material to verify geometry existence
    // this.material = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, skinning: true }) as any;
    // this.material.skinning = true; // No longer needed here as we set it per clone

    this.dolphin = SkeletonUtils.clone(gltf) as THREE.Group;

    this.dolphin.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshMaterial = this.material.clone();
        child.material = meshMaterial;
        
        if (child instanceof THREE.SkinnedMesh) {
          meshMaterial.skinning = true;
        } else {
          meshMaterial.skinning = false;
        }
        // Ensure standard properties preventing culling are set
        meshMaterial.side = THREE.DoubleSide; 


        this.dolphinMaterials.push(meshMaterial);

        child.frustumCulled = false;
        child.renderOrder = 2;
      }
    });

    this.normalizeDolphinTransform();
    this.root.add(this.dolphin);

    this.setAnimation(animations);
    this.setupSurfaceSampling(pixelRatio);
  }

  private normalizeDolphinTransform() {
    const bounds = new THREE.Box3().setFromObject(this.dolphin);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? DOLPHIN_TARGET_SIZE / maxDim : 1;

    this.dolphin.scale.setScalar(scale);
    this.dolphin.position.sub(center.multiplyScalar(scale));
    this.dolphin.position.add(DOLPHIN_TARGET_OFFSET);
  }

  private setAnimation(animations: THREE.AnimationClip[]) {
    if (!animations || animations.length === 0) {
      console.warn("DolphinSystem: No animations found!");
      return;
    }
    console.log("DolphinSystem: Setting up animations", animations.length);

    this.animationMixer = new THREE.AnimationMixer(this.dolphin);
    // Clone clip to be safe
    const clip = animations[0].clone();
    this.animationAction = this.animationMixer.clipAction(clip);
    this.animationAction.play();
    console.log("DolphinSystem: Animation playing", clip.name, clip.duration);
  }

  private setupSurfaceSampling(pixelRatio: number) {
    this.dolphinMesh = null;
    this.dolphin.traverse((child) => {
      // Find the skinned mesh again within the clone
      if (child instanceof THREE.SkinnedMesh) {
        this.dolphinMesh = child;
      }
    });

    if (!this.dolphinMesh) {
      console.warn("DolphinSystem: Could not find SkinnedMesh in cloned dolphin for sampling");
      return;
    }

    this.sampler = new MeshSurfaceSampler(this.dolphinMesh)
      .setWeightAttribute(null)
      .build();

    const tempPosition = new THREE.Vector3();
    const tempNormal = new THREE.Vector3();
    const geometry = this.dolphinMesh.geometry;
    const posAttr = geometry.getAttribute("position");

    this.sampledData = [];
    this.skinnedPositions = [];

    for (let i = 0; i < this.sparkleCount; i += 1) {
      this.sampler.sample(tempPosition, tempNormal);

      let closestIndex = 0;
      let closestDist = Infinity;
      const searchVec = new THREE.Vector3();

      for (let v = 0; v < posAttr.count; v += 1) {
        searchVec.fromBufferAttribute(posAttr, v);
        const dist = searchVec.distanceToSquared(tempPosition);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = v;
        }
      }

      this.sampledData.push({
        vertexIndex: closestIndex,
        offset: tempPosition
          .clone()
          .sub(new THREE.Vector3().fromBufferAttribute(posAttr, closestIndex)),
        normal: tempNormal.clone(),
        random: Math.random(),
        size: Math.random() * 0.5 + 0.5,
      });
      this.skinnedPositions.push(new THREE.Vector3());
    }

    const positions = new Float32Array(this.sparkleCount * 3);
    const randoms = new Float32Array(this.sparkleCount);
    const sizes = new Float32Array(this.sparkleCount);

    for (let i = 0; i < this.sparkleCount; i += 1) {
      randoms[i] = this.sampledData[i].random;
      sizes[i] = this.sampledData[i].size;
    }

    this.sparklesGeometry = new THREE.BufferGeometry();
    this.sparklesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.sparklesGeometry.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(randoms, 1)
    );
    this.sparklesGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    this.sparklesMaterial = new THREE.ShaderMaterial({
      vertexShader: sparkleVertexShader,
      fragmentShader: sparkleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 50.0 },
        uColor1: { value: new THREE.Color(0x327fe2) },
        uColor2: { value: new THREE.Color(0x719bf8) },
        uPixelRatio: { value: pixelRatio },
      },
    });

    this.sparkles = new THREE.Points(this.sparklesGeometry, this.sparklesMaterial);
    this.sparkles.frustumCulled = false;
    this.sparkles.renderOrder = 3;

    this.setupConnectionLines();

    this.root.add(this.sparkles);

    this.updateSparklePositions();
  }

  private setupConnectionLines() {
    const maxConnections = this.sparkleCount * 10;
    this.linePositions = new Float32Array(maxConnections * 6);
    this.lineColors = new Float32Array(maxConnections * 6);

    this.linesGeometry = new THREE.BufferGeometry();
    this.linesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.linePositions, 3)
    );
    this.linesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(this.lineColors, 3)
    );
    this.linesGeometry.setDrawRange(0, 0);

    this.linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.lines = new THREE.LineSegments(this.linesGeometry, this.linesMaterial);
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 3;
    this.root.add(this.lines);
  }

  private updateConnectionLines(positions: THREE.Vector3[]) {
    if (!this.linePositions || !this.lineColors || !this.linesGeometry || !this.sparklesMaterial) {
      return;
    }

    let lineIndex = 0;
    const color1 = this.sparklesMaterial.uniforms.uColor1.value as THREE.Color;
    const color2 = this.sparklesMaterial.uniforms.uColor2.value as THREE.Color;
    const connectionDistSq = this.connectionDistance * this.connectionDistance;

    const gridSize = this.connectionDistance * 2;
    const grid = new Map<string, Array<{ index: number; position: THREE.Vector3 }>>();

    for (let i = 0; i < positions.length; i += 1) {
      const pos = positions[i];
      const cellX = Math.floor(pos.x / gridSize);
      const cellY = Math.floor(pos.y / gridSize);
      const cellZ = Math.floor(pos.z / gridSize);
      const cellKey = `${cellX},${cellY},${cellZ}`;

      if (!grid.has(cellKey)) {
        grid.set(cellKey, []);
      }
      grid.get(cellKey)?.push({ index: i, position: pos });
    }

    for (let i = 0; i < positions.length; i += 1) {
      const pos = positions[i];
      const cellX = Math.floor(pos.x / gridSize);
      const cellY = Math.floor(pos.y / gridSize);
      const cellZ = Math.floor(pos.z / gridSize);

      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dz = -1; dz <= 1; dz += 1) {
            const neighborKey = `${cellX + dx},${cellY + dy},${cellZ + dz}`;
            const neighbors = grid.get(neighborKey);

            if (neighbors) {
              for (const neighbor of neighbors) {
                const j = neighbor.index;
                if (j <= i) continue;

                const distSq = pos.distanceToSquared(neighbor.position);

                if (distSq < connectionDistSq) {
                  const alpha = 1.0 - Math.sqrt(distSq) / this.connectionDistance;

                  this.linePositions[lineIndex * 6] = pos.x;
                  this.linePositions[lineIndex * 6 + 1] = pos.y;
                  this.linePositions[lineIndex * 6 + 2] = pos.z;

                  this.linePositions[lineIndex * 6 + 3] = neighbor.position.x;
                  this.linePositions[lineIndex * 6 + 4] = neighbor.position.y;
                  this.linePositions[lineIndex * 6 + 5] = neighbor.position.z;

                  const mixedColor = color1
                    .clone()
                    .lerp(color2, this.sampledData[i].random);

                  this.lineColors[lineIndex * 6] = mixedColor.r * alpha;
                  this.lineColors[lineIndex * 6 + 1] = mixedColor.g * alpha;
                  this.lineColors[lineIndex * 6 + 2] = mixedColor.b * alpha;

                  this.lineColors[lineIndex * 6 + 3] = mixedColor.r * alpha;
                  this.lineColors[lineIndex * 6 + 4] = mixedColor.g * alpha;
                  this.lineColors[lineIndex * 6 + 5] = mixedColor.b * alpha;

                  lineIndex += 1;

                  if (lineIndex >= this.linePositions.length / 6) break;
                }
              }
            }
            if (lineIndex >= this.linePositions.length / 6) break;
          }
          if (lineIndex >= this.linePositions.length / 6) break;
        }
        if (lineIndex >= this.linePositions.length / 6) break;
      }
      if (lineIndex >= this.linePositions.length / 6) break;
    }

    this.linesGeometry.attributes.position.needsUpdate = true;
    this.linesGeometry.attributes.color.needsUpdate = true;
    this.linesGeometry.setDrawRange(0, lineIndex * 2);
  }

  private updateSparklePositions() {
    if (!this.dolphinMesh || !this.sparklesGeometry) return;

    const positionAttribute = this.sparklesGeometry.getAttribute("position") as THREE.BufferAttribute;

    if (this.dolphinMesh.skeleton && !this._skeletonUpdatedThisFrame) {
      this.dolphinMesh.skeleton.update();
      this._skeletonUpdatedThisFrame = true;
    }

    if (!this._matrixWorldUpdatedThisFrame) {
      this.dolphinMesh.updateMatrixWorld(true);
      this._matrixWorldUpdatedThisFrame = true;
    }

    const posAttr = this.dolphinMesh.geometry.getAttribute("position") as THREE.BufferAttribute;

    for (let i = 0; i < this.sparkleCount; i += 1) {
      const data = this.sampledData[i];

      this._tmpBasePos.fromBufferAttribute(posAttr, data.vertexIndex);

      if (data.normal) {
        this._tmpNormal.copy(data.normal).normalize();
        this._tmpLocalOut.copy(this._tmpBasePos).addScaledVector(this._tmpNormal, this.outset);
      } else {
        this._tmpLocalOut.copy(this._tmpBasePos).add(data.offset);
      }

      if ((this.dolphinMesh as any).applyBoneTransform) {
        this._tmpSkinned.copy(this._tmpLocalOut);
        (this.dolphinMesh as any).applyBoneTransform(data.vertexIndex, this._tmpSkinned);
        this._tmpSkinned.applyMatrix4(this.dolphinMesh.matrixWorld);
      } else if ((this.dolphinMesh as any).boneTransform) {
        this._tmpSkinned.copy(this._tmpLocalOut);
        (this.dolphinMesh as any).boneTransform(data.vertexIndex, this._tmpSkinned);
        this._tmpSkinned.applyMatrix4(this.dolphinMesh.matrixWorld);
      } else {
        this._tmpSkinned.copy(this._tmpLocalOut).applyMatrix4(this.dolphinMesh.matrixWorld);
      }

      positionAttribute.array[i * 3] = this._tmpSkinned.x;
      positionAttribute.array[i * 3 + 1] = this._tmpSkinned.y;
      positionAttribute.array[i * 3 + 2] = this._tmpSkinned.z;

      this.skinnedPositions[i].copy(this._tmpSkinned);
    }

    positionAttribute.needsUpdate = true;
    this.updateConnectionLines(this.skinnedPositions);

    this._skeletonUpdatedThisFrame = false;
    this._matrixWorldUpdatedThisFrame = false;
  }

  update(delta: number, elapsed: number) {
    if (this.animationMixer) {
      this.animationMixer.update(delta);
      // console.log("DolphinSystem: Mixer update", delta);
    }

    this.dolphinMaterials.forEach((mat) => {
      if ('uniforms' in mat && mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = elapsed;
      }
    });

    if (this.sparkles && this.dolphinMesh) {
      this.updateSparklePositions();
    }

    if (this.sparklesMaterial?.uniforms.uTime) {
      this.sparklesMaterial.uniforms.uTime.value = elapsed;
    }
  }

  dispose() {
    if (this.sparkles) {
      this.root.remove(this.sparkles);
    }
    if (this.lines) {
      this.root.remove(this.lines);
    }

    this.sparklesGeometry?.dispose();
    this.sparklesMaterial?.dispose();
    this.linesGeometry?.dispose();
    this.linesMaterial?.dispose();
    this.material.dispose();

    this.dolphin.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });

    this.root.remove(this.dolphin);
  }
}

class WakeParticlesSystem {
  private root: THREE.Group;
  private renderer: THREE.WebGLRenderer;
  private dolphinSystem: DolphinSystem;
  private WIDTH = 150;
  private PARTICLES = this.WIDTH * this.WIDTH;
  private config = {
    backwardSpeed: 1.4,
    turbulence: 0.55,
    spread: 0.55,
    curlStrength: 0.2,
    spiralIntensity: 0.25,
    buoyancy: 0.12,
    drag: 0.98,
    particleSize: 15.0,
    color1: new THREE.Color(0x85d5fb),
    color2: new THREE.Color(0x0077dd),
    color3: new THREE.Color(0x335c79),
  };
  private gpuCompute: GPUComputationRenderer;
  private positionVariable: Variable;
  private spawnTexture: THREE.DataTexture;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private particleSystem: THREE.Points;
  private sampler?: MeshSurfaceSampler;
  private sampledData: Array<{ position: THREE.Vector3; normal: THREE.Vector3; vertexIndex: number; offset: THREE.Vector3 }> = [];
  private dolphinMesh: THREE.SkinnedMesh | null = null;
  private _tmpPosition = new THREE.Vector3();
  private _tmpNormal = new THREE.Vector3();
  private _tmpSkinned = new THREE.Vector3();
  private _lastDolphinPosition = new THREE.Vector3();
  private _lastDolphinRotation = new THREE.Quaternion();
  private _positionChangeThreshold = 0.05;
  private _updateFrameSkip = 0;
  private _updateFrameSkipMax = 1;

  constructor(root: THREE.Group, renderer: THREE.WebGLRenderer, dolphinSystem: DolphinSystem) {
    this.root = root;
    this.renderer = renderer;
    this.dolphinSystem = dolphinSystem;

    this.setupSurfaceSampling();
    this.gpuCompute = new GPUComputationRenderer(this.WIDTH, this.WIDTH, this.renderer);
    this.spawnTexture = this.gpuCompute.createTexture();
    const dtPosition = this.gpuCompute.createTexture();

    this.fillSpawnTexture(this.spawnTexture);
    this.fillInitialPositions(dtPosition);

    this.positionVariable = this.gpuCompute.addVariable(
      "uParticles",
      wakeParticlesSimulationShader,
      dtPosition
    );

    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable]);

    const uniforms = this.positionVariable.material.uniforms;
    uniforms.uTime = { value: 0 };
    uniforms.uDeltaTime = { value: 0 };
    uniforms.uSpawnPoints = { value: this.spawnTexture };
    uniforms.uBackwardSpeed = { value: this.config.backwardSpeed };
    uniforms.uTurbulence = { value: this.config.turbulence };
    uniforms.uSpread = { value: this.config.spread };
    uniforms.uCurlStrength = { value: this.config.curlStrength };
    uniforms.uSpiralIntensity = { value: this.config.spiralIntensity };
    uniforms.uBuoyancy = { value: this.config.buoyancy };
    uniforms.uDrag = { value: this.config.drag };
    uniforms.uDolphinPosition = { value: new THREE.Vector3(0, 0, 0) };

    const error = this.gpuCompute.init();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("GPGPU init error:", error);
    }

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.PARTICLES * 3);
    const uvs = new Float32Array(this.PARTICLES * 2);

    for (let i = 0; i < this.PARTICLES; i += 1) {
      uvs[i * 2] = (i % this.WIDTH) / this.WIDTH;
      uvs[i * 2 + 1] = Math.floor(i / this.WIDTH) / this.WIDTH;
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    this.material = new THREE.ShaderMaterial({
      vertexShader: wakeParticlesVertexShader,
      fragmentShader: wakeParticlesFragmentShader,
      uniforms: {
        uPositions: { value: null },
        uPixelRatio: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2) },
        uSize: { value: this.config.particleSize },
        uTime: { value: 0 },
        uColor1: { value: this.config.color1 },
        uColor2: { value: this.config.color2 },
        uColor3: { value: this.config.color3 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(this.geometry, this.material);
    this.particleSystem.frustumCulled = false;
    this.root.add(this.particleSystem);
  }

  private setupSurfaceSampling() {
    this.dolphinMesh = this.dolphinSystem.dolphinMesh;
    if (!this.dolphinMesh) {
      return;
    }

    const geometry = this.dolphinMesh.geometry;
    const posAttr = geometry.getAttribute("position");

    const weights = new Float32Array(posAttr.count);
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i < posAttr.count; i += 1) {
      const z = posAttr.getZ(i);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }

    for (let i = 0; i < posAttr.count; i += 1) {
      const z = posAttr.getZ(i);
      const normalizedZ = (z - minZ) / (maxZ - minZ);
      weights[i] = Math.pow(1.0 - normalizedZ, 2.0) + 0.1;
    }

    geometry.setAttribute("weight", new THREE.BufferAttribute(weights, 1));

    this.sampler = new MeshSurfaceSampler(this.dolphinMesh)
      .setWeightAttribute("weight")
      .build();

    const tempPosition = new THREE.Vector3();
    const tempNormal = new THREE.Vector3();

    this.sampledData = [];

    for (let i = 0; i < this.PARTICLES; i += 1) {
      this.sampler.sample(tempPosition, tempNormal);

      let closestIndex = 0;
      let closestDist = Infinity;
      const searchVec = new THREE.Vector3();

      for (let v = 0; v < posAttr.count; v += 1) {
        searchVec.fromBufferAttribute(posAttr, v);
        const dist = searchVec.distanceToSquared(tempPosition);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = v;
        }
      }

      this.sampledData.push({
        position: tempPosition.clone(),
        normal: tempNormal.clone(),
        vertexIndex: closestIndex,
        offset: tempPosition
          .clone()
          .sub(new THREE.Vector3().fromBufferAttribute(posAttr, closestIndex)),
      });
    }
  }

  private fillSpawnTexture(texture: THREE.DataTexture) {
    const data = texture.image.data as unknown as Float32Array;

    if (!this.sampledData || this.sampledData.length === 0) {
      for (let i = 0; i < data.length; i += 4) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 1.0;
        data[i] = Math.cos(angle) * r;
        data[i + 1] = (Math.random() - 0.5) * 0.8;
        data[i + 2] = -Math.random() * 0.5;
        data[i + 3] = 1.0;
      }
      return;
    }

    for (let i = 0; i < this.PARTICLES; i += 1) {
      const idx = i * 4;
      const sample = this.sampledData[i];

      data[idx] = sample.position.x;
      data[idx + 1] = sample.position.y;
      data[idx + 2] = sample.position.z;
      data[idx + 3] = sample.vertexIndex;
    }
  }

  private fillInitialPositions(texture: THREE.DataTexture) {
    const data = texture.image.data as unknown as Float32Array;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = (Math.random() - 0.5) * 3.0;
      data[i + 1] = (Math.random() - 0.5) * 2.0;
      data[i + 2] = -Math.random() * 10.0 - 2.0;
      data[i + 3] = Math.random();
    }
  }

  update(delta: number, elapsed: number) {
    const uniforms = this.positionVariable.material.uniforms;

    uniforms.uTime.value = elapsed;
    uniforms.uDeltaTime.value = delta;

    if (this.dolphinSystem.dolphin) {
      uniforms.uDolphinPosition.value.copy(this.dolphinSystem.dolphin.position);
    }

    this.updateSpawnPoints();

    this.gpuCompute.compute();

    this.material.uniforms.uPositions.value =
      this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
    this.material.uniforms.uTime.value = elapsed;
  }

  private updateSpawnPoints() {
    if (!this.dolphinMesh || !this.spawnTexture || !this.sampledData) return;

    this._updateFrameSkip += 1;
    if (this._updateFrameSkip < this._updateFrameSkipMax) {
      return;
    }
    this._updateFrameSkip = 0;

    if (this.dolphinMesh.skeleton) {
      this.dolphinMesh.skeleton.update();
    }
    this.dolphinMesh.updateMatrixWorld(true);

    const data = this.spawnTexture.image.data as unknown as Float32Array;
    const posAttr = this.dolphinMesh.geometry.getAttribute("position") as THREE.BufferAttribute;

    for (let i = 0; i < this.PARTICLES; i += 1) {
      const idx = i * 4;
      const sample = this.sampledData[i];

      this._tmpPosition.fromBufferAttribute(posAttr, sample.vertexIndex);

      this._tmpPosition.add(sample.offset);
      this._tmpPosition.addScaledVector(sample.normal, 0.02);

      if ((this.dolphinMesh as any).applyBoneTransform) {
        this._tmpSkinned.copy(this._tmpPosition);
        (this.dolphinMesh as any).applyBoneTransform(sample.vertexIndex, this._tmpSkinned);
        this._tmpSkinned.applyMatrix4(this.dolphinMesh.matrixWorld);
      } else if ((this.dolphinMesh as any).boneTransform) {
        this._tmpSkinned.copy(this._tmpPosition);
        (this.dolphinMesh as any).boneTransform(sample.vertexIndex, this._tmpSkinned);
        this._tmpSkinned.applyMatrix4(this.dolphinMesh.matrixWorld);
      } else {
        this._tmpSkinned.copy(this._tmpPosition).applyMatrix4(this.dolphinMesh.matrixWorld);
      }

      data[idx] = this._tmpSkinned.x;
      data[idx + 1] = this._tmpSkinned.y;
      data[idx + 2] = this._tmpSkinned.z;
    }

    this.spawnTexture.needsUpdate = true;
    this.positionVariable.material.uniforms.uSpawnPoints.value = this.spawnTexture;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.root.remove(this.particleSystem);
    this.gpuCompute.dispose();
  }
}

class PostProcessingSystem {
  private composer: EffectComposer;
  private combinedPass: ShaderPass;
  private baseRGBShift = 0.003;
  private baseVignetteStrength = 0.15;
  private baseGlowIntensity = 0.4;
  private maxRGBShift = 0.1;
  private maxVignetteStrength = 0.5;
  private maxGlowIntensity = 1.0;
  private currentRGBShift = this.baseRGBShift;
  private currentVignetteStrength = this.baseVignetteStrength;
  private currentGlowIntensity = this.baseGlowIntensity;
  private easeK = 8.0;

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.composer = new EffectComposer(renderer);
    this.composer.renderToScreen = true;
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    this.combinedPass = new ShaderPass(CombinedShader);
    this.combinedPass.renderToScreen = true;
    this.composer.addPass(this.combinedPass);
  }

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  update(
    elapsedTime: number,
    deltaTime: number,
    mouseVelocity: THREE.Vector2,
    isDragging: boolean
  ) {
    this.combinedPass.uniforms.uTime.value = elapsedTime;
    this.combinedPass.uniforms.uMouseInfluence.value.copy(mouseVelocity);

    const targetRGBShift = isDragging ? this.maxRGBShift : this.baseRGBShift;
    const targetVignette = isDragging ? this.maxVignetteStrength : this.baseVignetteStrength;
    const targetGlow = isDragging ? this.maxGlowIntensity : this.baseGlowIntensity;

    const lerpFactor = Math.min(deltaTime * this.easeK, 1.0);

    this.currentRGBShift = this.lerp(this.currentRGBShift, targetRGBShift, lerpFactor);
    this.currentVignetteStrength = this.lerp(
      this.currentVignetteStrength,
      targetVignette,
      lerpFactor
    );
    this.currentGlowIntensity = this.lerp(
      this.currentGlowIntensity,
      targetGlow,
      lerpFactor
    );

    this.combinedPass.uniforms.uAberration.value = this.currentRGBShift;
    this.combinedPass.uniforms.uVignetteStrength.value = this.currentVignetteStrength;
    this.combinedPass.uniforms.uGlowIntensity.value = this.currentGlowIntensity;
  }

  render() {
    this.composer.render();
  }

  resize(width: number, height: number) {
    this.composer.setSize(width, height);
  }

  dispose() {
    this.composer.dispose();
  }
}

type CyberOceanProps = {
  isActive?: boolean;
  dolphinUrl?: string;
  envMapPath?: string;
  envMapFiles?: string[];
  allowControls?: boolean;
};

type CyberOceanSystems = {
  wormhole: WormholeSystem;
  flowField: FlowFieldSystem;
  seabed: SeabedSystem;
  dolphin: DolphinSystem;
  wakeParticles: WakeParticlesSystem | null;
};

export default function CyberOcean({
  isActive = true,
  dolphinUrl,
  envMapPath,
  envMapFiles,
  allowControls = false,
}: CyberOceanProps) {
  const { scene, camera, gl, size } = useThree();
  const rootRef = useRef<THREE.Group>(null);
  const systemsRef = useRef<CyberOceanSystems | null>(null);
  const postProcessingRef = useRef<PostProcessingSystem | null>(null);
  const deltaRef = useRef(0);
  const dragRef = useRef(false);
  const mouseRef = useRef({
    target: new THREE.Vector2(0, 0),
    smooth: new THREE.Vector2(0, 0),
    prev: new THREE.Vector2(0, 0),
    velocity: new THREE.Vector2(0, 0),
    smoothingFactor: 5,
  });
  const cameraGroupRef = useRef<THREE.Group | null>(null);
  const cameraRestoreRef = useRef<{
    parent: THREE.Object3D | null;
    position: THREE.Vector3;
    rotation: THREE.Euler;
  } | null>(null);
  const cameraMotionRef = useRef({
    floatTime: 0,
    floatAmplitude: { x: 0.02, y: 0.035, z: 0.04 },
    floatFrequency: { x: 0.3, y: 0.5, z: 0.6 },
    rotationAmplitude: { x: 0.005, y: 0.003, z: 0.006 },
    rotationFrequency: { x: 0.4, y: 0.25, z: 0.35 },
    randomness: { enabled: true, intensity: 0.35, speed: 0.8 },
    noiseOffsets: {
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      z: Math.random() * 1000,
      rotX: Math.random() * 1000,
      rotY: Math.random() * 1000,
      rotZ: Math.random() * 1000,
    },
    cachedNoise: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
    noiseFrameSkip: 0,
    parallaxAmplitude: 0.12,
    parallaxEasingSpeed: 10,
    offset: new THREE.Vector3(),
  });

  const resolvedDolphinUrl = dolphinUrl ?? DEFAULT_DOLPHIN_URL;
  const gltf = useGLTF(resolvedDolphinUrl, "/draco/");
  const environmentMap = useCubeTexture(envMapFiles ?? DEFAULT_ENV_FILES, {
    path: envMapPath ?? DEFAULT_ENV_PATH,
  });

  const baseCameraPosition = useMemo(() => {
    const initialCameraPosition = new THREE.Vector3(4.0, 0.8, 3.4);
    const idealRatio = 16 / 9;
    const currentRatio = size.width / size.height || idealRatio;
    const ratioOverflow = Math.max(1, idealRatio / currentRatio) - 1;
    const baseDistance = initialCameraPosition.length();
    const additionalDistance = baseDistance * ratioOverflow * 0.27;
    const direction = initialCameraPosition.clone().normalize();
    return direction.multiplyScalar(baseDistance + additionalDistance);
  }, [size.width, size.height]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      mouseRef.current.target.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.target.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouseRef.current.target.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.target.y = (touch.clientY / window.innerHeight) * 2 - 1;
      }
    };

    const handlePointerDown = () => {
      dragRef.current = true;
    };

    const handlePointerUp = () => {
      dragRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const previousFog = scene.fog;
    const previousBackground = scene.background;

    scene.fog = new THREE.Fog(0x121316, 60, 180);
    scene.background = new THREE.Color(0x001235);

    return () => {
      scene.fog = previousFog;
      scene.background = previousBackground;
    };
  }, [isActive, scene]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const previousEnvironment = scene.environment;
    environmentMap.colorSpace = THREE.SRGBColorSpace;
    scene.environment = environmentMap;

    rootRef.current?.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.envMap = environmentMap;
        child.material.envMapIntensity = 2.0;
        child.material.needsUpdate = true;
      }
    });

    return () => {
      scene.environment = previousEnvironment;
    };
  }, [environmentMap, isActive, scene]);

  useEffect(() => {
    /*
    if (!isActive) {
      return;
    }

    const previousParent = camera.parent ?? scene;
    cameraRestoreRef.current = {
      parent: previousParent,
      position: camera.position.clone(),
      rotation: camera.rotation.clone(),
    };

    if (allowControls) {
      camera.position.copy(baseCameraPosition);
      camera.lookAt(DOLPHIN_FOCUS_TARGET);

      return () => {
        if (cameraRestoreRef.current) {
          camera.position.copy(cameraRestoreRef.current.position);
          camera.rotation.copy(cameraRestoreRef.current.rotation);
        }
      };
    }

    const cameraGroup = new THREE.Group();
    previousParent.remove(camera);
    cameraGroup.add(camera);
    scene.add(cameraGroup);
    cameraGroupRef.current = cameraGroup;

    camera.position.copy(baseCameraPosition);

    return () => {
      cameraGroup.remove(camera);
      scene.remove(cameraGroup);
      previousParent.add(camera);

      if (cameraRestoreRef.current) {
        camera.position.copy(cameraRestoreRef.current.position);
        camera.rotation.copy(cameraRestoreRef.current.rotation);
      }
      cameraGroupRef.current = null;
    };
    */
  }, [allowControls, baseCameraPosition, camera, isActive, scene]);

  useEffect(() => {
    /*
    if (!isActive) {
      return;
    }

    camera.position.copy(baseCameraPosition);
    */
  }, [baseCameraPosition, camera, isActive]);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const root = rootRef.current;
    const pixelRatio = getPixelRatio(gl);
    const gltfScene = (gltf as { scene: THREE.Object3D }).scene;
    const gltfAnimations = (gltf as { animations: THREE.AnimationClip[] }).animations ?? [];

    const dolphin = new DolphinSystem(root, gltfScene, gltfAnimations, pixelRatio);
    const systems: CyberOceanSystems = {
      wormhole: new WormholeSystem(root, scene),
      flowField: new FlowFieldSystem(root),
      seabed: new SeabedSystem(root, scene),
      dolphin,
      wakeParticles: null,
    };

    try {
      systems.wakeParticles = new WakeParticlesSystem(root, gl, dolphin);
    } catch (error) {
      systems.wakeParticles = null;
    }

    systemsRef.current = systems;

    return () => {
      systems.wakeParticles?.dispose();
      systems.dolphin.dispose();
      systems.flowField.dispose();
      systems.wormhole.dispose();
      systems.seabed.dispose();
      systemsRef.current = null;
    };
  }, [gltf, gl, scene]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const prevToneMapping = gl.toneMapping;
    const prevColorSpace = gl.outputColorSpace;
    const prevSortObjects = gl.sortObjects;
    const prevClearColor = gl.getClearColor(new THREE.Color());
    const prevClearAlpha = gl.getClearAlpha();

    gl.toneMapping = THREE.NoToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.sortObjects = false;
    gl.setClearColor(0x001235, 1);

    /*
    const postProcessing = new PostProcessingSystem(scene, camera, gl);
    postProcessing.resize(size.width, size.height);
    postProcessingRef.current = postProcessing;
    */

    const previousAutoClear = gl.autoClear;
    gl.autoClear = true;

    return () => {
      gl.autoClear = previousAutoClear;
      gl.toneMapping = prevToneMapping;
      // ...
    };
      gl.outputColorSpace = prevColorSpace;
      gl.sortObjects = prevSortObjects;
      gl.setClearColor(prevClearColor, prevClearAlpha);
      postProcessing.dispose();
      postProcessingRef.current = null;
    };
  }, [camera, gl, isActive, scene]);

  useEffect(() => {
    postProcessingRef.current?.resize(size.width, size.height);
  }, [size.width, size.height]);

  useFrame((state) => {
    // Use the delta provided by useFrame (safe) instead of clock.getDelta() (unsafe)
    const delta = state.delta;
    deltaRef.current = delta;

    if (!isActive) {
      return;
    }

    const elapsed = state.clock.elapsedTime;

    const mouse = mouseRef.current;
    mouse.prev.copy(mouse.smooth);
    mouse.smooth.x += (mouse.target.x - mouse.smooth.x) * mouse.smoothingFactor * delta;
    mouse.smooth.y += (mouse.target.y - mouse.smooth.y) * mouse.smoothingFactor * delta;
    mouse.velocity.subVectors(mouse.smooth, mouse.prev);

    const cameraGroup = cameraGroupRef.current;
    if (cameraGroup) {
      const motion = cameraMotionRef.current;
      motion.floatTime += delta;

      motion.noiseFrameSkip += 1;
      if (motion.randomness.enabled && motion.noiseFrameSkip >= 3) {
        motion.noiseFrameSkip = 0;
        const noiseTime = motion.floatTime * motion.randomness.speed;
        const intensity = motion.randomness.intensity;

        motion.cachedNoise = {
          x: smoothNoise(noiseTime, motion.noiseOffsets.x) * motion.floatAmplitude.x * intensity,
          y: smoothNoise(noiseTime, motion.noiseOffsets.y) * motion.floatAmplitude.y * intensity,
          z: smoothNoise(noiseTime, motion.noiseOffsets.z) * motion.floatAmplitude.z * intensity,
          rotX:
            smoothNoise(noiseTime * 0.7, motion.noiseOffsets.rotX) *
            motion.rotationAmplitude.x *
            intensity,
          rotY:
            smoothNoise(noiseTime * 0.6, motion.noiseOffsets.rotY) *
            motion.rotationAmplitude.y *
            intensity,
          rotZ:
            smoothNoise(noiseTime * 0.8, motion.noiseOffsets.rotZ) *
            motion.rotationAmplitude.z *
            intensity,
        };
      }

      const noise = motion.cachedNoise;

      const floatX =
        Math.sin(motion.floatTime * motion.floatFrequency.x * Math.PI * 2) *
          motion.floatAmplitude.x +
        Math.sin(motion.floatTime * motion.floatFrequency.x * 1.7 * Math.PI * 2) *
          motion.floatAmplitude.x *
          0.3 +
        noise.x;

      const floatY =
        Math.sin(motion.floatTime * motion.floatFrequency.y * Math.PI * 2) *
          motion.floatAmplitude.y +
        Math.sin(motion.floatTime * motion.floatFrequency.y * 0.6 * Math.PI * 2) *
          motion.floatAmplitude.y *
          0.5 +
        noise.y;

      const floatZ =
        Math.sin(motion.floatTime * motion.floatFrequency.z * Math.PI * 2) *
          motion.floatAmplitude.z +
        noise.z;

      const rotX =
        Math.sin(motion.floatTime * motion.rotationFrequency.x * Math.PI * 2) *
          motion.rotationAmplitude.x +
        noise.rotX;
      const rotY =
        Math.sin(motion.floatTime * motion.rotationFrequency.y * Math.PI * 2) *
          motion.rotationAmplitude.y +
        noise.rotY;
      const rotZ =
        Math.sin(motion.floatTime * motion.rotationFrequency.z * Math.PI * 2) *
          motion.rotationAmplitude.z +
        noise.rotZ;

      const parallaxX = mouse.smooth.x * motion.parallaxAmplitude;
      const parallaxY = -mouse.smooth.y * motion.parallaxAmplitude;

      const targetX = parallaxX + floatX;
      const targetY = parallaxY + floatY;
      const targetZ = floatZ;

      motion.offset.x += (targetX - motion.offset.x) * motion.parallaxEasingSpeed * delta;
      motion.offset.y += (targetY - motion.offset.y) * motion.parallaxEasingSpeed * delta;
      motion.offset.z += (targetZ - motion.offset.z) * motion.parallaxEasingSpeed * delta;

      cameraGroup.position.copy(motion.offset);
      cameraGroup.rotation.set(rotX, rotY, rotZ);
      cameraGroup.updateMatrixWorld(true);
    }

    if (!allowControls) {
      // camera.lookAt(DOLPHIN_FOCUS_TARGET);
    }

    const systems = systemsRef.current;
    if (systems) {
      // console.log("CyberOcean: Update Dolphin");
      systems.seabed.update(elapsed);
      systems.wormhole.update(delta);

      if (systems.flowField.points) {
        const frustum = new THREE.Frustum();
        const cameraMatrix = new THREE.Matrix4();
        camera.updateMatrixWorld();
        cameraMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(cameraMatrix);

        if (frustum.intersectsObject(systems.flowField.points)) {
          systems.flowField.update(delta, elapsed);
        }
      }

      systems.dolphin.update(delta, elapsed);
      systems.wakeParticles?.update(delta, elapsed);
    }
  });

  useFrame((state) => {
    /*
    if (!isActive) {
      return;
    }

    try {
      state.gl.render(state.scene, state.camera);
       } catch (e) {
      console.error("CyberOcean: Render loop error", e);
    }
    */
  }, 1);

  return (
    <group ref={rootRef}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <ambientLight intensity={0.45} color="#8cc8ff" />
      <hemisphereLight intensity={0.4} color="#6fd3fb" groundColor="#08121f" />
      <directionalLight position={[2, 2, -2]} intensity={4} color="#ffffff" />
      <directionalLight position={[0, 1, 2]} intensity={0.7} color="#ffffff" />
      <directionalLight position={[-2, 2, -2]} intensity={1.0} color="#ffffff" />
    </group>
  );
}

useGLTF.preload(DEFAULT_DOLPHIN_URL, "/draco/");
