"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import type { AsteroidData } from "./store";
import { ASTEROID_SIZES } from "./config";

interface AsteroidProps {
    data: AsteroidData;
}

export default function Asteroid({ data }: AsteroidProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const posRef = useRef<[number, number, number]>([...data.position]);
    const velRef = useRef<[number, number, number]>([...data.velocity]);
    const rotSpeed = useRef<[number, number, number]>([
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
    ]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        posRef.current[0] += velRef.current[0] * delta;
        posRef.current[1] += velRef.current[1] * delta;
        posRef.current[2] += velRef.current[2] * delta;

        meshRef.current.position.set(
            posRef.current[0],
            posRef.current[1],
            posRef.current[2]
        );

        meshRef.current.rotation.x += rotSpeed.current[0] * delta;
        meshRef.current.rotation.y += rotSpeed.current[1] * delta;
        meshRef.current.rotation.z += rotSpeed.current[2] * delta;

        data.position = [...posRef.current];
    });

    const cfg = ASTEROID_SIZES[data.size];

    return (
        <mesh ref={meshRef} position={data.position}>
            <dodecahedronGeometry args={[cfg.radius, 1]} />
            <meshStandardMaterial
                color={cfg.color}
                roughness={0.8}
                metalness={0.2}
                flatShading
            />
        </mesh>
    );
}
