"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, generateId } from "./store";
import {
    SHIP_MOVE_SPEED,
    SHIP_BOUNDS_X,
    SHIP_BOUNDS_Y,
    SHIP_FIRE_RATE,
} from "./config";

export default function Ship() {
    const meshRef = useRef<THREE.Group>(null);
    const posRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
    const keysRef = useRef<Set<string>>(new Set());
    const lastShotRef = useRef(0);

    const barriers = useGameStore((s) => s.barriers);
    const phase = useGameStore((s) => s.phase);
    const addBullet = useGameStore((s) => s.addBullet);
    const setShipPosition = useGameStore((s) => s.setShipPosition);
    const landingProgress = useGameStore((s) => s.landingProgress);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        keysRef.current.add(e.key.toLowerCase());
    }, []);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        keysRef.current.delete(e.key.toLowerCase());
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // During landing, auto-center the ship and shrink it
        if (phase === "landing" || phase === "won") {
            // Lerp ship position toward center
            posRef.current.x += (0 - posRef.current.x) * delta * 2;
            posRef.current.y += (0 - posRef.current.y) * delta * 2;
            posRef.current.z += (-50 * landingProgress - posRef.current.z) * delta * 1.5;

            meshRef.current.position.copy(posRef.current);

            // Shrink ship as it approaches the planet
            const scale = Math.max(0.05, 1 - landingProgress * 0.9);
            meshRef.current.scale.setScalar(scale);

            meshRef.current.rotation.z = 0;
            meshRef.current.rotation.x = 0;
            return;
        }

        if (phase !== "playing") return;

        const keys = keysRef.current;
        const moveX =
            (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
            (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
        const moveY =
            (keys.has("w") || keys.has("arrowup") ? 1 : 0) -
            (keys.has("s") || keys.has("arrowdown") ? 1 : 0);

        posRef.current.x += moveX * SHIP_MOVE_SPEED * delta;
        posRef.current.y += moveY * SHIP_MOVE_SPEED * delta;

        posRef.current.x = Math.max(-SHIP_BOUNDS_X, Math.min(SHIP_BOUNDS_X, posRef.current.x));
        posRef.current.y = Math.max(-SHIP_BOUNDS_Y, Math.min(SHIP_BOUNDS_Y, posRef.current.y));

        meshRef.current.position.copy(posRef.current);
        meshRef.current.scale.setScalar(1);

        // Tilt ship based on movement
        meshRef.current.rotation.z = -moveX * 0.3;
        meshRef.current.rotation.x = moveY * 0.15;

        // Update store with ship position for collision detection
        setShipPosition([posRef.current.x, posRef.current.y, posRef.current.z]);

        // Shooting — bullets fire in -z direction (forward into the screen)
        if (keys.has(" ")) {
            const now = state.clock.getElapsedTime();
            if (now - lastShotRef.current > SHIP_FIRE_RATE) {
                lastShotRef.current = now;
                addBullet({
                    id: generateId(),
                    position: [posRef.current.x, posRef.current.y, posRef.current.z - 1.5],
                    direction: [0, 0, -1],
                });
            }
        }
    });

    return (
        <group ref={meshRef}>
            {/* Ship body — cone pointing INTO the screen (-z) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.5, 1.8, 6]} />
                <meshStandardMaterial
                    color="#4488ff"
                    emissive="#1144aa"
                    emissiveIntensity={0.5}
                    metalness={0.7}
                    roughness={0.3}
                />
            </mesh>

            {/* Wing left */}
            <mesh position={[-0.8, -0.1, 0.3]} rotation={[0, 0, 0.3]}>
                <boxGeometry args={[0.8, 0.08, 0.5]} />
                <meshStandardMaterial color="#3366dd" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Wing right */}
            <mesh position={[0.8, -0.1, 0.3]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[0.8, 0.08, 0.5]} />
                <meshStandardMaterial color="#3366dd" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Engine glow (behind ship, toward +z / toward camera) */}
            <mesh position={[0, 0, 1.0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#ff6600" />
                <pointLight color="#ff4400" intensity={3} distance={5} />
            </mesh>

            {/* Second engine trail */}
            <mesh position={[0, 0, 1.4]}>
                <sphereGeometry args={[0.12, 6, 6]} />
                <meshBasicMaterial color="#ffaa00" transparent opacity={0.6} />
            </mesh>

            {/* Shield (visible when barriers > 0 and playing) */}
            {barriers > 0 && phase === "playing" && (
                <mesh>
                    <sphereGeometry args={[1.8, 16, 16]} />
                    <meshBasicMaterial
                        color="#00aaff"
                        wireframe
                        transparent
                        opacity={0.12 + barriers * 0.08}
                    />
                </mesh>
            )}

            {/* Ship light */}
            <pointLight color="#4488ff" intensity={2} distance={8} />
        </group>
    );
}
