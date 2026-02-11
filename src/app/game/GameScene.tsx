"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, generateId } from "./store";
import type { AsteroidData } from "./store";
import Asteroid from "./Asteroid";
import Bullet from "./Bullet";
import Ship from "./Ship";
import Stars from "./Stars";
import HUD from "./HUD";
import {
    ASTEROID_SIZES,
    ASTEROID_OOB_Z,
    ASTEROID_SPREAD_X,
    ASTEROID_SPREAD_Y,
    ASTEROID_VEL_X,
    ASTEROID_VEL_Y,
    ASTEROID_VEL_Z,
    SPAWN_INTERVAL_BASE,
    SPAWN_INTERVAL_MIN,
    SPAWN_INTERVAL_DECAY,
    DISTANCE_SPEED,
    SHIP_COLLISION_RADIUS,
    COLLISION_COOLDOWN,
    LANDING_PHASE_RATIO,
    PLANET_VISIBLE_RATIO,
    CAMERA_POSITION,
    CAMERA_FOV,
    CAMERA_LOOK_AT,
    SPEED_LINE_COUNT,
    PLANET_Z,
    PLANET_RADIUS,
    BARRIER_REGEN_INTERVAL,
} from "./config";

function dist3(
    a: [number, number, number],
    b: [number, number, number]
): number {
    return Math.sqrt(
        (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
    );
}

function Planet() {
    const meshRef = useRef<THREE.Group>(null);
    const distance = useGameStore((s) => s.distance);
    const maxDistance = useGameStore((s) => s.maxDistance);
    const phase = useGameStore((s) => s.phase);
    const landingProgress = useGameStore((s) => s.landingProgress);

    const progress = distance / maxDistance;
    const visible = progress > PLANET_VISIBLE_RATIO;

    useFrame((_, delta) => {
        if (!meshRef.current || !visible) return;
        meshRef.current.rotation.y += delta * 0.08;
    });

    if (!visible) return null;

    const approachFactor = Math.min(1, (progress - PLANET_VISIBLE_RATIO) / (1 - PLANET_VISIBLE_RATIO));
    const baseScale = 0.1 + approachFactor * 0.9;

    const landingScale = phase === "landing" || phase === "won"
        ? baseScale + landingProgress * 3
        : baseScale;
    const planetZ = phase === "landing" || phase === "won"
        ? PLANET_Z + landingProgress * 80
        : PLANET_Z;

    return (
        <group ref={meshRef} position={[0, -2, planetZ]} scale={[landingScale, landingScale, landingScale]}>
            {/* Planet body — icy celeste world */}
            <mesh>
                <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
                <meshStandardMaterial
                    color="#00BFFF"
                    emissive="#005577"
                    emissiveIntensity={0.3}
                    roughness={0.5}
                    metalness={0.2}
                />
            </mesh>

            {/* Continents / land layer */}
            <mesh rotation={[0.3, 0.8, 0.1]}>
                <sphereGeometry args={[PLANET_RADIUS * 1.002, 48, 48]} />
                <meshStandardMaterial
                    color="#87CEEB"
                    transparent
                    opacity={0.6}
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>

            {/* Ice caps */}
            <mesh rotation={[0, 0, 0]} position={[0, PLANET_RADIUS * 0.92, 0]}>
                <sphereGeometry args={[PLANET_RADIUS * 0.35, 16, 16]} />
                <meshStandardMaterial
                    color="#E0FFFF"
                    transparent
                    opacity={0.8}
                    roughness={0.2}
                />
            </mesh>
            <mesh rotation={[Math.PI, 0, 0]} position={[0, -PLANET_RADIUS * 0.92, 0]}>
                <sphereGeometry args={[PLANET_RADIUS * 0.25, 16, 16]} />
                <meshStandardMaterial
                    color="#E0FFFF"
                    transparent
                    opacity={0.7}
                    roughness={0.2}
                />
            </mesh>

            <mesh rotation={[0.15, 1.2, 0.05]}>
                <sphereGeometry args={[PLANET_RADIUS * 1.03, 48, 48]} />
                <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.2}
                    roughness={1}
                />
            </mesh>

            <mesh>
                <sphereGeometry args={[PLANET_RADIUS * 1.08, 32, 32]} />
                <meshBasicMaterial
                    color="#64B5F6"
                    transparent
                    opacity={0.06}
                    side={THREE.BackSide}
                />
            </mesh>

            <mesh>
                <sphereGeometry args={[PLANET_RADIUS * 1.2, 32, 32]} />
                <meshBasicMaterial
                    color="#42A5F5"
                    transparent
                    opacity={0.03}
                    side={THREE.BackSide}
                />
            </mesh>

            <pointLight color="#64B5F6" intensity={6} distance={80} />
        </group>
    );
}

function SpeedLines() {
    const count = SPEED_LINE_COUNT;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const positions = useRef<Float32Array | null>(null);
    const speeds = useRef<Float32Array | null>(null);

    useEffect(() => {
        if (!meshRef.current) return;
        const pos = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
            pos[i * 3 + 2] = Math.random() * -100;
            spd[i] = 20 + Math.random() * 40;
        }
        positions.current = pos;
        speeds.current = spd;
    }, [count]);

    useFrame((_, delta) => {
        if (!meshRef.current || !positions.current || !speeds.current) return;
        const pos = positions.current;
        const spd = speeds.current;
        for (let i = 0; i < count; i++) {
            pos[i * 3 + 2] += spd[i] * delta;
            if (pos[i * 3 + 2] > 20) {
                pos[i * 3 + 2] = -100;
                pos[i * 3] = (Math.random() - 0.5) * 50;
                pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
            }
            dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
            dummy.scale.set(0.03, 0.03, 0.8 + spd[i] * 0.02);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </instancedMesh>
    );
}

function Sun({ visible }: { visible: boolean }) {
    const meshRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y += delta * 0.05;

        if (glowRef.current) {
            glowRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
            glowRef.current.rotation.z -= delta * 0.1;
        }
    });

    if (!visible) return null;

    return (
        <group ref={meshRef} position={[10, 5, -10]}>
            {/* Core */}
            <mesh>
                <sphereGeometry args={[4, 64, 64]} />
                <meshStandardMaterial
                    color="#FDB813"
                    emissive="#FF8C00"
                    emissiveIntensity={3}
                    toneMapped={false}
                />
            </mesh>
            <pointLight intensity={3} distance={100} color="#FDB813" decay={2} />

            {/* Inner Glow / Corona */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[4.2, 32, 32]} />
                <meshBasicMaterial
                    color="#FF4500"
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Outer Raidance/Halo */}
            <mesh scale={[1.5, 1.5, 1.5]}>
                <sphereGeometry args={[4, 32, 32]} />
                <meshBasicMaterial
                    color="#FFD700"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}

function Galaxy({ visible }: { visible: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate spiral galaxy particles
    const particleCount = 2000;
    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const colorInside = new THREE.Color("#ff0066");
        const colorOutside = new THREE.Color("#00ccff");

        for (let i = 0; i < particleCount; i++) {
            const radius = Math.random() * 20 + 2;
            const spinAngle = radius * 0.8;
            const branchAngle = (i % 3) * ((2 * Math.PI) / 3);

            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;

            positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2 + randomY;
            positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            const mixedColor = colorInside.clone().lerp(colorOutside, radius / 20);

            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }
        return { positions, colors };
    }, []);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;
        pointsRef.current.rotation.y += delta * 0.05;
    });

    if (!visible) return null;

    return (
        <group position={[0, 0, -30]} rotation={[0.4, 0, 0]}>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={particleCount}
                        array={colors}
                        itemSize={3}
                        args={[colors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.2}
                    sizeAttenuation={true}
                    depthWrite={false}
                    vertexColors={true}
                    blending={THREE.AdditiveBlending}
                    transparent
                    opacity={0.8}
                />
            </points>
        </group>
    );
}

function SceneLogic() {
    const phase = useGameStore((s) => s.phase);
    const asteroids = useGameStore((s) => s.asteroids);
    const bullets = useGameStore((s) => s.bullets);
    const splitAsteroid = useGameStore((s) => s.splitAsteroid);
    const removeBullet = useGameStore((s) => s.removeBullet);
    const removeAsteroid = useGameStore((s) => s.removeAsteroid);
    const decrementBarrier = useGameStore((s) => s.decrementBarrier);
    const setPhase = useGameStore((s) => s.setPhase);
    const incrementDistance = useGameStore((s) => s.incrementDistance);
    const addAsteroid = useGameStore((s) => s.addAsteroid);
    const setLandingProgress = useGameStore((s) => s.setLandingProgress);
    const clearAsteroids = useGameStore((s) => s.clearAsteroids);

    const collisionCooldownRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const landingTimerRef = useRef(0);
    const landingStartedRef = useRef(false);

    useFrame((_, delta) => {
        if (phase === "start" || phase === "won" || phase === "gameover") return;

        const state = useGameStore.getState();

        if (phase === "landing") {
            landingTimerRef.current += delta;
            const landingDuration = 4;
            const progress = Math.min(1, landingTimerRef.current / landingDuration);
            setLandingProgress(progress);

            if (!landingStartedRef.current) {
                landingStartedRef.current = true;
                clearAsteroids();
            }

            incrementDistance(delta * 3);

            if (progress >= 1) {
                setPhase("won");
            }
            return;
        }

        incrementDistance(delta * DISTANCE_SPEED);

        if (state.distance >= state.maxDistance * LANDING_PHASE_RATIO) {
            setPhase("landing");
            landingTimerRef.current = 0;
            landingStartedRef.current = false;
            return;
        }

        collisionCooldownRef.current = Math.max(
            0,
            collisionCooldownRef.current - delta
        );

        const bulletsToRemove = new Set<string>();
        const asteroidsToSplit = new Set<string>();

        for (const bullet of bullets) {
            for (const asteroid of asteroids) {
                const hitR = ASTEROID_SIZES[asteroid.size].hitRadius;
                if (dist3(bullet.position, asteroid.position) < hitR + 0.2) {
                    bulletsToRemove.add(bullet.id);
                    asteroidsToSplit.add(asteroid.id);
                }
            }
        }

        for (const id of bulletsToRemove) removeBullet(id);
        for (const id of asteroidsToSplit) splitAsteroid(id);

        if (collisionCooldownRef.current <= 0) {
            const shipPos = state.shipPosition;
            for (const asteroid of asteroids) {
                const hitR = ASTEROID_SIZES[asteroid.size].hitRadius;
                if (dist3(shipPos, asteroid.position) < hitR + SHIP_COLLISION_RADIUS) {
                    const barriers = state.barriers;
                    if (barriers > 0) {
                        decrementBarrier();
                        removeAsteroid(asteroid.id);
                        collisionCooldownRef.current = COLLISION_COOLDOWN;
                    } else {
                        setPhase("gameover");
                    }
                    break;
                }
            }
        }

        for (const asteroid of asteroids) {
            if (asteroid.position[2] > ASTEROID_OOB_Z) {
                removeAsteroid(asteroid.id);
            }
        }

        spawnTimerRef.current += delta;
        const spawnInterval = Math.max(
            SPAWN_INTERVAL_MIN,
            SPAWN_INTERVAL_BASE - state.distance * SPAWN_INTERVAL_DECAY
        );
        if (spawnTimerRef.current > spawnInterval) {
            spawnTimerRef.current = 0;
            const sizes: (3 | 2 | 1)[] = [3, 3, 2, 2, 3];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            const x = (Math.random() - 0.5) * 2 * ASTEROID_SPREAD_X;
            const y = (Math.random() - 0.5) * 2 * ASTEROID_SPREAD_Y;
            const z = -70 + Math.random() * -30;

            const newAsteroid: AsteroidData = {
                id: generateId(),
                size,
                position: [x, y, z],
                velocity: [
                    (Math.random() - 0.5) * (ASTEROID_VEL_X[1] - ASTEROID_VEL_X[0]),
                    (Math.random() - 0.5) * (ASTEROID_VEL_Y[1] - ASTEROID_VEL_Y[0]),
                    ASTEROID_VEL_Z[0] + Math.random() * (ASTEROID_VEL_Z[1] - ASTEROID_VEL_Z[0]),
                ],
            };
            addAsteroid(newAsteroid);
        }
    });

    return null;
}

export default function GameScene() {
    const asteroids = useGameStore((s) => s.asteroids);
    const bullets = useGameStore((s) => s.bullets);
    const removeBullet = useGameStore((s) => s.removeBullet);
    const spawnInitialAsteroids = useGameStore((s) => s.spawnInitialAsteroids);
    const regenerateBarrier = useGameStore((s) => s.regenerateBarrier);
    const phase = useGameStore((s) => s.phase);

    const handleBulletOOB = useCallback(
        (id: string) => removeBullet(id),
        [removeBullet]
    );

    useEffect(() => {
        spawnInitialAsteroids();
    }, [spawnInitialAsteroids]);

    useEffect(() => {
        const interval = setInterval(() => {
            const state = useGameStore.getState();
            if (state.phase === "playing" && state.barriers < 3) {
                regenerateBarrier();
            }
        }, BARRIER_REGEN_INTERVAL);
        return () => clearInterval(interval);
    }, [regenerateBarrier]);

    const showShip = phase === "playing" || phase === "landing";

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
            <Canvas
                camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: 0.1, far: 500 }}
                style={{ width: "100%", height: "100%" }}
                onCreated={({ camera }) => {
                    camera.lookAt(...CAMERA_LOOK_AT);
                }}
            >
                <ambientLight intensity={0.12} />
                <directionalLight position={[5, 10, 5]} intensity={0.5} />
                <directionalLight position={[-3, -5, -15]} intensity={0.25} color="#4466ff" />

                <fog attach="fog" args={["#000011", 40, 150]} />

                <Stars />
                <SpeedLines />

                <Planet />

                {/* Sun (Start Phase) */}
                <Sun visible={phase === "start"} />

                {/* Galaxy (Won Phase) */}
                <Galaxy visible={phase === "won"} />


                <SceneLogic />

                {showShip && <Ship />}

                {asteroids.map((a) => (
                    <Asteroid key={a.id} data={a} />
                ))}

                {bullets.map((b) => (
                    <Bullet key={b.id} data={b} onOutOfBounds={handleBulletOOB} />
                ))}
            </Canvas>

            <HUD />
        </div>
    );
}
