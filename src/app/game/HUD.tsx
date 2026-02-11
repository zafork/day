"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "./store";
import { MAX_BARRIERS } from "./config";

function TypewriterText({ text, speed = 50, onComplete, className, style }: { text: string, speed?: number, onComplete?: () => void, className?: string, style?: React.CSSProperties }) {
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text.charAt(index));
                setIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else {
            if (onComplete) onComplete();
        }
    }, [index, text, speed, onComplete]);

    return (
        <span className={className} style={style}>
            {displayedText}
            <span className="cursor">|</span>
            <style jsx>{`
                .cursor {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </span>
    );
}

export default function HUD() {
    const barriers = useGameStore((s) => s.barriers);
    const score = useGameStore((s) => s.score);
    const distance = useGameStore((s) => s.distance);
    const maxDistance = useGameStore((s) => s.maxDistance);
    const phase = useGameStore((s) => s.phase);

    const setPhase = useGameStore((s) => s.setPhase);
    const resetGame = useGameStore((s) => s.resetGame);
    const spawnInitialAsteroids = useGameStore((s) => s.spawnInitialAsteroids);

    const [noBtnState, setNoBtnState] = useState<"normal" | "sucked" | "gone">("normal");
    const [yesPressed, setYesPressed] = useState(false);
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);

    // Animation states
    const [showStartButton, setShowStartButton] = useState(false);
    const [showWonQuestion, setShowWonQuestion] = useState(false);
    const [showWonButtons, setShowWonButtons] = useState(false);

    const progress = Math.min(1, distance / maxDistance);

    const handleRestart = () => {
        resetGame();
        // keep music playing
        spawnInitialAsteroids();
        setNoBtnState("normal");
        setYesPressed(false);
        setShowWonQuestion(false);
        setShowWonButtons(false);
    };

    const handleStart = () => {
        setPhase("playing");
        setIsPlayingMusic(true); // Trigger re-render of player to ensure autoplay works on interaction
    };

    const handleNoClick = () => {
        setNoBtnState("sucked");
        // Hide the black hole after animation
        setTimeout(() => {
            setNoBtnState("gone");
        }, 2000);
    };

    const handleYesClick = () => {
        setYesPressed(true);
    };

    const isEndScreen = phase === "gameover";
    const isWonScreen = phase === "won";
    const isStartScreen = phase === "start";

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
                color: "#00ccff",
            }}
        >
            {/* Only mount player after interaction to ensure browser allows autoplay */}
            {isPlayingMusic && (
                <audio autoPlay loop style={{ display: 'none' }}>
                    <source src="/day/music.mp3" type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            )}

            {/* Top bar */}
            {phase === "playing" || phase === "landing" ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        padding: "20px 30px",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span
                            style={{
                                fontSize: 11,
                                letterSpacing: 3,
                                color: "#00ccff", // Celeste
                                textTransform: "uppercase",
                                display: "flex",
                                alignItems: "center",
                                gap: 6
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: 16 }}>shield</span> ESCUDOS
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
                                        borderColor: i <= barriers ? "#00BFFF" : "#333", // Deep Sky Blue
                                        background:
                                            i <= barriers
                                                ? "radial-gradient(circle, #00BFFFdd, #00BFFF44)"
                                                : "transparent",
                                        boxShadow: i <= barriers ? "0 0 15px #00BFFF88" : "none",
                                        transition: "all 0.3s ease",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

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
                                color: "#E0FFFF", // Light Cyan
                                textTransform: "uppercase",
                                display: "flex",
                                alignItems: "center",
                                gap: 6
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: 16 }}>favorite</span> AMOR ACUMULADO
                        </span>
                        <span
                            style={{
                                fontSize: 32,
                                fontWeight: 700,
                                color: "#fff",
                                textShadow: "0 0 20px #00BFFF66",
                            }}
                        >
                            {score.toLocaleString()}
                        </span>
                    </div>

                    <div style={{ width: 100 }} />
                </div>
            ) : null}

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
                            color: "#E0FFFF",
                            textShadow: "0 0 30px #00BFFF88",
                            animation: "pulse 1.5s infinite",
                        }}
                    >
                        🌍 LLEGANDO AL DESTINO...
                    </span>
                </div>
            )}

            {/* Distance progress bar */}
            {(phase === "playing" || phase === "landing") && (
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
                            color: "#E0FFFF",
                            textTransform: "uppercase",
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span className="material-icons" style={{ fontSize: 14 }}>rocket_launch</span> DISTANCIA
                        </span>
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
                                background: "linear-gradient(90deg, #00BFFF, #E0FFFF)",
                                borderRadius: 3,
                                transition: "width 0.3s ease",
                                boxShadow: "0 0 8px #00BFFF66",
                            }}
                        />
                    </div>
                </div>
            )}

            {phase === "playing" && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 16,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        fontSize: 11,
                        color: "#ffffff66",
                        letterSpacing: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10
                    }}
                >
                    <span>WASD / Flechas para mover</span> • <span>ESPACIO para disparar</span>
                </div>
            )}

            {/* Start Screen */}
            {isStartScreen && (
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
                        background: "radial-gradient(circle, #001a33cc, #000000ee)",
                        pointerEvents: "auto",
                        padding: 20,
                    }}
                >
                    <h1
                        style={{
                            fontSize: 48,
                            color: "#00BFFF",
                            textShadow: "0 0 40px #00BFFF",
                            marginBottom: 20,
                            letterSpacing: 6,
                            textAlign: "center",
                        }}
                    >
                        <TypewriterText text="TRANSMISIÓN ENTRANTE..." speed={100} />
                    </h1>
                    <div style={{ color: "#E0FFFF", marginBottom: 30, textAlign: "center", maxWidth: 600, lineHeight: 1.6, minHeight: 60 }}>
                        <TypewriterText
                            text="Detectamos una señal de vida en el sector prohibido. Parece que hay un mensaje esperando por ti al otro lado del cinturón de asteroides. ¿Aceptas la misión?"
                            speed={30}
                            onComplete={() => setShowStartButton(true)}
                        />
                    </div>

                    {showStartButton && (
                        <button
                            onClick={handleStart}
                            className="fade-in"
                            style={{
                                padding: "16px 48px",
                                fontSize: 18,
                                fontWeight: 700,
                                letterSpacing: 4,
                                border: "none",
                                background: "linear-gradient(45deg, #00BFFF, #1E90FF)",
                                color: "#fff",
                                cursor: "pointer",
                                borderRadius: 30,
                                boxShadow: "0 0 20px #1E90FF66",
                                textTransform: "uppercase",
                                transition: "all 0.3s",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                animation: "fadeIn 1s forwards"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            <span className="material-icons">rocket_launch</span> DESPEGAR
                        </button>
                    )}
                </div>
            )}

            {/* Game Over Screen */}
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
                        background: "#000000dd",
                        pointerEvents: "auto",
                        textAlign: "center",
                    }}
                >
                    <h1 style={{ fontSize: 50, color: "#ff3344", letterSpacing: 5 }}>MISIÓN FALLIDA</h1>
                    <p style={{ color: "#aaa", marginBottom: 20 }}>El amor requiere persistencia. No te rindas.</p>
                    <button
                        onClick={handleRestart}
                        style={{
                            padding: "12px 30px",
                            fontSize: 16,
                            background: "transparent",
                            border: "1px solid #ff3344",
                            color: "#ff3344",
                            cursor: "pointer",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <span className="material-icons">refresh</span> REINTENTAR
                    </button>
                </div>
            )}

            {/* Proposal Screen (WON) */}
            {isWonScreen && (
                <div
                    className="galaxy-bg"
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
                        pointerEvents: "auto",
                        textAlign: "center",
                        zIndex: 20,
                        overflow: "hidden"
                    }}
                >
                    {!yesPressed ? (
                        <>
                            <div style={{ position: "relative", zIndex: 2 }}>
                                <h1
                                    style={{
                                        fontSize: 24,
                                        color: "#88ccff",
                                        letterSpacing: 4,
                                        marginBottom: 40,
                                        textTransform: "uppercase",
                                        opacity: 0.8
                                    }}
                                >
                                    <TypewriterText
                                        text="Conexión establecida..."
                                        speed={50}
                                        onComplete={() => setShowWonQuestion(true)}
                                    />
                                </h1>

                                {showWonQuestion && (
                                    <div style={{ minHeight: 100 }}>
                                        <p style={{ fontSize: 32, color: "#fff", marginBottom: 50, fontWeight: "bold", textShadow: "0 0 20px #00BFFF" }}>
                                            <TypewriterText
                                                text="¿Quieres ser mi San Valentín? 💙"
                                                speed={80}
                                                onComplete={() => setShowWonButtons(true)}
                                            />
                                        </p>
                                    </div>
                                )}

                                {showWonButtons && (
                                    <div className="fade-in" style={{ display: "flex", gap: 40, alignItems: "center", justifyContent: "center", animation: "fadeIn 1s forwards" }}>
                                        <button
                                            onClick={handleYesClick}
                                            style={{
                                                padding: "16px 48px",
                                                fontSize: 20,
                                                fontWeight: "bold",
                                                background: "linear-gradient(45deg, #00BFFF, #1E90FF)",
                                                border: "none",
                                                borderRadius: 50,
                                                color: "#fff",
                                                cursor: "pointer",
                                                boxShadow: "0 0 20px #00BFFF88",
                                                transition: "transform 0.2s",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                        >
                                            <span className="material-icons">favorite</span> SÍ, ACEPTO
                                        </button>

                                        <div style={{ position: "relative", width: 100, height: 60 }}>
                                            {noBtnState === "normal" && (
                                                <button
                                                    onClick={handleNoClick}
                                                    style={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        padding: "12px 30px",
                                                        fontSize: 16,
                                                        background: "#333",
                                                        border: "1px solid #666",
                                                        borderRadius: 50,
                                                        color: "#aaa",
                                                        cursor: "pointer",
                                                        transition: "all 0.5s ease",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}
                                                >
                                                    No
                                                </button>
                                            )}
                                            {noBtnState !== "gone" && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: "50%",
                                                        left: "50%",
                                                        width: noBtnState === "sucked" ? 60 : 0,
                                                        height: noBtnState === "sucked" ? 60 : 0,
                                                        background: "#000",
                                                        borderRadius: "50%",
                                                        transform: "translate(-50%, -50%)",
                                                        boxShadow: noBtnState === "sucked" ? "0 0 15px #ffffff44, inset 0 0 20px #ffffff22" : "none",
                                                        transition: "all 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                                        zIndex: 5,
                                                        opacity: noBtnState === "sucked" ? 1 : 0,
                                                    }}
                                                />
                                            )}
                                            {noBtnState === "sucked" && (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        top: "50%",
                                                        left: "50%",
                                                        padding: "12px 30px",
                                                        background: "#333",
                                                        borderRadius: 50,
                                                        color: "#aaa",
                                                        fontSize: 16,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        transform: "translate(-50%, -50%) scale(0) rotate(720deg)",
                                                        transition: "all 1.2s ease-in-out",
                                                        opacity: 0,
                                                    }}
                                                >
                                                    No
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ animation: "fadeIn 1s", position: "relative", zIndex: 2 }}>
                            <h1 style={{ fontSize: 60, marginBottom: 20 }}>💙✨🪐</h1>
                            <h2
                                style={{
                                    fontSize: 36,
                                    color: "#E0FFFF",
                                    marginBottom: 30,
                                    textShadow: "0 0 20px #00BFFF",
                                }}
                            >
                                <TypewriterText text="SABIA QUE DIRIAS QUE SI <3 AHORA ERES MI COMPILOTO" speed={50} />
                            </h2>
                            <p style={{ fontSize: 20, color: "#fff" }}>
                                <TypewriterText text="Te veo el 14 de Febrero. 🚀" speed={50} />
                            </p>
                        </div>
                    )}
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                    50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .fade-in {
                    animation: fadeIn 1s forwards;
                }
                .galaxy-bg {
                    background: transparent; /* Now handled by 3D galaxy */
                    overflow: hidden;
                }
                .galaxy-bg::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 160px 120px, #ffffff, rgba(0,0,0,0));
                    background-repeat: repeat;
                    background-size: 200px 200px;
                    animation: stars 4s linear infinite;
                    opacity: 0.3;
                }
                .galaxy-bg::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at center, #00BFFF11 0%, transparent 60%);
                    animation: rotate 60s linear infinite;
                }
                @keyframes stars {
                    from { transform: translateY(0); }
                    to { transform: translateY(-200px); }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
