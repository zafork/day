"use client";

import { useGameStore } from "./store";
import { MAX_BARRIERS } from "./config";

export default function HUD() {
    const barriers = useGameStore((s) => s.barriers);
    const score = useGameStore((s) => s.score);
    const distance = useGameStore((s) => s.distance);
    const maxDistance = useGameStore((s) => s.maxDistance);
    const phase = useGameStore((s) => s.phase);
    const resetGame = useGameStore((s) => s.resetGame);
    const spawnInitialAsteroids = useGameStore((s) => s.spawnInitialAsteroids);

    const progress = Math.min(1, distance / maxDistance);

    const handleRestart = () => {
        resetGame();
        spawnInitialAsteroids();
    };

    const isEndScreen = phase === "won" || phase === "gameover";

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
                zIndex: 10,
            }}
        >
            {/* Top bar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "20px 30px",
                }}
            >
                {/* Barriers */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span
                        style={{
                            fontSize: 11,
                            letterSpacing: 3,
                            color: "#66aaff",
                            textTransform: "uppercase",
                        }}
                    >
                        Shields
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                        {Array.from({ length: MAX_BARRIERS }, (_, i) => i + 1).map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    border: "2px solid",
                                    borderColor: i <= barriers ? "#00ccff" : "#333",
                                    background:
                                        i <= barriers
                                            ? "radial-gradient(circle, #00ccff55, #00ccff22)"
                                            : "transparent",
                                    boxShadow: i <= barriers ? "0 0 10px #00ccff66" : "none",
                                    transition: "all 0.3s ease",
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Score */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <span
                        style={{
                            fontSize: 11,
                            letterSpacing: 3,
                            color: "#ffcc00",
                            textTransform: "uppercase",
                        }}
                    >
                        Score
                    </span>
                    <span
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: "#fff",
                            textShadow: "0 0 20px #ffcc0066",
                        }}
                    >
                        {score.toLocaleString()}
                    </span>
                </div>

                {/* Placeholder for balance */}
                <div style={{ width: 100 }} />
            </div>

            {/* Landing indicator */}
            {phase === "landing" && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: 28,
                            letterSpacing: 6,
                            color: "#44ff88",
                            textShadow: "0 0 30px #44ff8866",
                            animation: "pulse 1.5s infinite",
                        }}
                    >
                        🌍 APPROACHING PLANET...
                    </span>
                </div>
            )}

            {/* Distance progress bar */}
            <div
                style={{
                    position: "absolute",
                    bottom: 50,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    width: "60%",
                    maxWidth: 400,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        fontSize: 11,
                        letterSpacing: 2,
                        color: "#44ff88",
                        textTransform: "uppercase",
                    }}
                >
                    <span>🚀 Distance</span>
                    <span>{Math.floor(distance)} / {maxDistance} AU</span>
                </div>
                <div
                    style={{
                        width: "100%",
                        height: 6,
                        background: "#ffffff11",
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid #ffffff22",
                    }}
                >
                    <div
                        style={{
                            width: `${progress * 100}%`,
                            height: "100%",
                            background:
                                progress > 0.8
                                    ? "linear-gradient(90deg, #44ff88, #88ffaa)"
                                    : "linear-gradient(90deg, #00ccff, #44ff88)",
                            borderRadius: 3,
                            transition: "width 0.3s ease",
                            boxShadow: "0 0 8px #44ff8844",
                        }}
                    />
                </div>
                {progress > 0.55 && phase === "playing" && (
                    <span style={{ fontSize: 10, color: "#44ff8888", letterSpacing: 2 }}>
                        🌍 PLANET DETECTED
                    </span>
                )}
            </div>

            {/* Bottom controls hint */}
            {phase === "playing" && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 16,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        fontSize: 11,
                        color: "#ffffff33",
                        letterSpacing: 2,
                    }}
                >
                    WASD / Arrows to move &nbsp;•&nbsp; SPACE to shoot
                </div>
            )}

            {/* End screen */}
            {isEndScreen && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "radial-gradient(circle, #000000cc, #000000ee)",
                        pointerEvents: "auto",
                    }}
                >
                    <h1
                        style={{
                            fontSize: 56,
                            color: phase === "won" ? "#44ff88" : "#ff3344",
                            textShadow:
                                phase === "won"
                                    ? "0 0 40px #44ff8888"
                                    : "0 0 40px #ff334488",
                            marginBottom: 10,
                            letterSpacing: 8,
                        }}
                    >
                        {phase === "won" ? "MISSION COMPLETE" : "GAME OVER"}
                    </h1>
                    {phase === "won" && (
                        <p style={{ fontSize: 16, color: "#aaa", marginBottom: 4 }}>
                            You reached the planet safely! 🌍
                        </p>
                    )}
                    <p style={{ fontSize: 20, color: "#aaa", marginBottom: 8 }}>
                        Final Score:{" "}
                        <strong style={{ color: "#ffcc00" }}>
                            {score.toLocaleString()}
                        </strong>
                    </p>
                    <p style={{ fontSize: 16, color: "#888", marginBottom: 30 }}>
                        Distance Traveled: {Math.floor(distance)} AU
                    </p>
                    <button
                        onClick={handleRestart}
                        onKeyDown={(e) => e.key === "Enter" && handleRestart()}
                        type="button"
                        style={{
                            padding: "14px 40px",
                            fontSize: 18,
                            fontWeight: 700,
                            letterSpacing: 4,
                            border: "2px solid #00ccff",
                            background: "transparent",
                            color: "#00ccff",
                            cursor: "pointer",
                            borderRadius: 4,
                            transition: "all 0.2s ease",
                            textTransform: "uppercase",
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.background = "#00ccff22";
                            (e.target as HTMLButtonElement).style.boxShadow = "0 0 20px #00ccff44";
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.background = "transparent";
                            (e.target as HTMLButtonElement).style.boxShadow = "none";
                        }}
                    >
                        {phase === "won" ? "Play Again" : "Restart"}
                    </button>
                </div>
            )}
        </div>
    );
}
