"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ColorBendsProps {
  colors: string[];
  rotation?: number;
  speed?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  noise?: number;
  parallax?: number;
  iterations?: number;
  intensity?: number;
  bandWidth?: number;
  transparent?: boolean;
  autoRotate?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ColorBends({
  colors = ["#ef4444", "#8a5cff", "#00ffd1"],
  rotation = 90,
  speed = 0.2,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  noise = 0.15,
  parallax = 0.5,
  iterations = 1,
  intensity = 1.5,
  bandWidth = 6,
  transparent = true,
  autoRotate = 0,
  className = "",
  style,
}: ColorBendsProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const webglFailed = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!mountRef.current || prefersReducedMotion || webglFailed.current) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        alpha: transparent,
        antialias: true,
        powerPreference: "low-power"
      });
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to static background", e);
      webglFailed.current = true;
      return;
    }

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;
    
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Convert hex colors to vec3 strings for shader
    const colorVecs = colors.map((c) => {
      const color = new THREE.Color(c);
      return `vec3(${color.r.toFixed(3)}, ${color.g.toFixed(3)}, ${color.b.toFixed(3)})`;
    });
    
    // Fallback if colors array doesn't have enough entries
    while (colorVecs.length < 3) {
      colorVecs.push(colorVecs[colorVecs.length - 1] || "vec3(1.0, 0.0, 0.0)");
    }

    const fragmentShader = `
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec2 iMouse;
      uniform float iRotation;
      uniform float iScale;
      uniform float iFrequency;
      uniform float iWarpStrength;
      uniform float iMouseInfluence;
      uniform float iNoise;
      uniform float iIterations;
      uniform float iIntensity;
      uniform float iBandWidth;

      // GLSL logic ported from common bend shaders
      vec2 rotate(vec2 p, float a) {
          float s = sin(a);
          float c = cos(a);
          return mat2(c, -s, s, c) * p;
      }

      float rand(vec2 n) { 
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord.xy / iResolution.xy;
          // Center origin
          uv = uv * 2.0 - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          
          vec2 mouse = (iMouse.xy / iResolution.xy) * 2.0 - 1.0;
          mouse.x *= iResolution.x / iResolution.y;

          uv *= iScale;
          uv = rotate(uv, iRotation);
          
          // Mouse influence
          uv += mouse * iMouseInfluence * 0.1;

          float time = iTime * 0.5;
          vec2 p = uv;
          
          // Domain warping
          for(float i = 1.0; i <= 3.0; i++) {
              if (i > iIterations) break;
              p.x += sin(p.y * iFrequency + time) * iWarpStrength * 0.1;
              p.y += cos(p.x * iFrequency + time * 0.8) * iWarpStrength * 0.1;
          }

          // Generate color bands
          float f = sin(p.x * iBandWidth + time) * cos(p.y * iBandWidth + time * 1.2);
          
          // Add noise
          f += (rand(uv + time) - 0.5) * iNoise;
          
          // Map to colors
          vec3 col1 = ${colorVecs[0]};
          vec3 col2 = ${colorVecs[1]};
          vec3 col3 = ${colorVecs[2]};
          
          vec3 color = mix(col1, col2, smoothstep(-1.0, 0.0, f));
          color = mix(color, col3, smoothstep(0.0, 1.0, f));
          
          color *= iIntensity;

          // Alpha fade out towards edges for better blending
          float alpha = 1.0 - smoothstep(0.5, 1.5, length(uv * 0.5));
          
          fragColor = vec4(color, alpha);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const vertexShader = `
      void main() {
          gl_Position = vec4(position, 1.0);
      }
    `;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(w, h) },
      iMouse: { value: new THREE.Vector2(w / 2, h / 2) },
      iRotation: { value: (rotation * Math.PI) / 180 },
      iScale: { value: scale },
      iFrequency: { value: frequency },
      iWarpStrength: { value: warpStrength },
      iMouseInfluence: { value: mouseInfluence },
      iNoise: { value: noise },
      iIterations: { value: iterations },
      iIntensity: { value: intensity },
      iBandWidth: { value: bandWidth },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(plane);

    let mouseTarget = new THREE.Vector2(w / 2, h / 2);
    let autoRot = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Convert to component coordinates
      mouseTarget.set(e.clientX - rect.left, rect.height - (e.clientY - rect.top));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!mountRef.current || !renderer) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      uniforms.iResolution.value.set(width, height);
    };

    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const render = () => {
      const delta = clock.getDelta();
      
      uniforms.iTime.value += delta * speed;
      
      if (autoRotate > 0) {
         autoRot += delta * autoRotate;
         uniforms.iRotation.value = (rotation * Math.PI) / 180 + autoRot;
      }

      // Smooth mouse follow (parallax effect)
      uniforms.iMouse.value.lerp(mouseTarget, 0.05 * parallax);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const currentMount = mountRef.current;
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (currentMount && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      
      material.dispose();
      renderer.dispose();
    };
  }, [
    colors, rotation, speed, scale, frequency, warpStrength, 
    mouseInfluence, noise, parallax, iterations, intensity, 
    bandWidth, transparent, autoRotate, prefersReducedMotion
  ]);

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} 
      style={style} 
    />
  );
}
