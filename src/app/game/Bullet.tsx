"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import type { BulletData } from "./store";
import { BULLET_SPEED, BULLET_MIN_Z } from "./config";

interface BulletProps {
    data: BulletData;
    onOutOfBounds: (id: string) => void;
}

export default function Bullet({ data, onOutOfBounds }: BulletProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const posRef = useRef<[number, number, number]>([...data.position]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        posRef.current[0] += data.direction[0] * BULLET_SPEED * delta;
        posRef.current[1] += data.direction[1] * BULLET_SPEED * delta;
        posRef.current[2] += data.direction[2] * BULLET_SPEED * delta;

        meshRef.current.position.set(
            posRef.current[0],
            posRef.current[1],
            posRef.current[2]
        );

        data.position = [...posRef.current];

        if (posRef.current[2] < BULLET_MIN_Z) {
            onOutOfBounds(data.id);
        }
    });

    return (
        <mesh ref={meshRef} position={data.position}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#00ffff" />
            <pointLight color="#00ffff" intensity={2} distance={4} />
        </mesh>
    );
}
