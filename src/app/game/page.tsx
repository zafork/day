"use client";

import dynamic from "next/dynamic";

const GameScene = dynamic(() => import("./GameScene"), {
    ssr: false,
    loading: () => (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#00ccff",
                fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
                fontSize: 24,
                letterSpacing: 6,
            }}
        >
            LOADING...
        </div>
    ),
});

export default function GamePage() {
    return <GameScene />;
}
