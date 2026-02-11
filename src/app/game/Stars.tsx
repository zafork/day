"use client";

import { Stars as DreiStars } from "@react-three/drei";

export default function Stars() {
    return (
        <DreiStars
            radius={100}
            depth={80}
            count={3000}
            factor={4}
            saturation={0.3}
            fade
            speed={4}
        />
    );
}
