"use client";

import { create } from "zustand";
import {
    MAX_DISTANCE,
    MAX_BARRIERS,
    ASTEROID_SPAWN_Z_MIN,
    ASTEROID_SPAWN_Z_MAX,
    ASTEROID_SPREAD_X,
    ASTEROID_SPREAD_Y,
    ASTEROID_VEL_X,
    ASTEROID_VEL_Y,
    ASTEROID_VEL_Z,
    SPLIT_VEL_X,
    SPLIT_VEL_Y,
    SPLIT_VEL_Z,
    SPLIT_OFFSET,
    ASTEROID_INITIAL_COUNT,
    SCORE_BY_SIZE,
} from "./config";

export interface AsteroidData {
    id: string;
    size: 3 | 2 | 1;
    position: [number, number, number];
    velocity: [number, number, number];
}

export interface BulletData {
    id: string;
    position: [number, number, number];
    direction: [number, number, number];
}

export type GamePhase = "start" | "playing" | "landing" | "won" | "gameover";

interface GameState {
    barriers: number;
    score: number;
    distance: number;
    maxDistance: number;
    phase: GamePhase;
    asteroids: AsteroidData[];
    bullets: BulletData[];
    shipPosition: [number, number, number];
    landingProgress: number;
    youtubeId: string;

    decrementBarrier: () => void;
    regenerateBarrier: () => void;
    addScore: (points: number) => void;
    incrementDistance: (delta: number) => void;
    setPhase: (phase: GamePhase) => void;
    resetGame: () => void;
    setShipPosition: (pos: [number, number, number]) => void;
    setLandingProgress: (p: number) => void;
    setYoutubeId: (id: string) => void;

    addAsteroid: (asteroid: AsteroidData) => void;
    removeAsteroid: (id: string) => void;
    clearAsteroids: () => void;

    addBullet: (bullet: BulletData) => void;
    removeBullet: (id: string) => void;

    spawnInitialAsteroids: () => void;
    splitAsteroid: (id: string) => void;
}

let idCounter = 0;
export function generateId(): string {
    return `obj_${Date.now()}_${idCounter++}`;
}

function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function createRandomAsteroid(size: 3 | 2 | 1 = 3): AsteroidData {
    const x = randomRange(-ASTEROID_SPREAD_X, ASTEROID_SPREAD_X);
    const y = randomRange(-ASTEROID_SPREAD_Y, ASTEROID_SPREAD_Y);
    const z = randomRange(ASTEROID_SPAWN_Z_MIN, ASTEROID_SPAWN_Z_MAX);

    return {
        id: generateId(),
        size,
        position: [x, y, z],
        velocity: [
            randomRange(ASTEROID_VEL_X[0], ASTEROID_VEL_X[1]),
            randomRange(ASTEROID_VEL_Y[0], ASTEROID_VEL_Y[1]),
            randomRange(ASTEROID_VEL_Z[0], ASTEROID_VEL_Z[1]),
        ],
    };
}

export const useGameStore = create<GameState>((set, get) => ({
    barriers: MAX_BARRIERS,
    score: 0,
    distance: 0,
    maxDistance: MAX_DISTANCE,
    phase: "start",
    asteroids: [],
    bullets: [],
    shipPosition: [0, 0, 0],
    landingProgress: 0,
    youtubeId: "cHHLHGNpCSA",

    decrementBarrier: () =>
        set((state) => ({
            barriers: Math.max(0, state.barriers - 1),
        })),

    regenerateBarrier: () =>
        set((state) => ({
            barriers: Math.min(MAX_BARRIERS, state.barriers + 1),
        })),

    addScore: (points: number) =>
        set((state) => ({ score: state.score + points })),

    incrementDistance: (delta: number) =>
        set((state) => ({ distance: state.distance + delta })),

    setPhase: (phase: GamePhase) => set({ phase }),

    resetGame: () =>
        set({
            barriers: MAX_BARRIERS,
            score: 0,
            distance: 0,
            phase: "playing",
            asteroids: [],
            bullets: [],
            shipPosition: [0, 0, 0],
            landingProgress: 0,
        }),

    setShipPosition: (pos: [number, number, number]) =>
        set({ shipPosition: pos }),

    setLandingProgress: (p: number) => set({ landingProgress: p }),

    setYoutubeId: (id: string) => set({ youtubeId: id }),

    addAsteroid: (asteroid: AsteroidData) =>
        set((state) => ({ asteroids: [...state.asteroids, asteroid] })),

    removeAsteroid: (id: string) =>
        set((state) => ({
            asteroids: state.asteroids.filter((a) => a.id !== id),
        })),

    clearAsteroids: () => set({ asteroids: [], bullets: [] }),

    addBullet: (bullet: BulletData) =>
        set((state) => ({ bullets: [...state.bullets, bullet] })),

    removeBullet: (id: string) =>
        set((state) => ({
            bullets: state.bullets.filter((b) => b.id !== id),
        })),

    spawnInitialAsteroids: () => {
        const asteroids: AsteroidData[] = [];
        for (let i = 0; i < ASTEROID_INITIAL_COUNT; i++) {
            asteroids.push(createRandomAsteroid(3));
        }
        set({ asteroids });
    },

    splitAsteroid: (id: string) => {
        const state = get();
        const asteroid = state.asteroids.find((a) => a.id === id);
        if (!asteroid) return;

        const newAsteroids = state.asteroids.filter((a) => a.id !== id);

        if (asteroid.size > 1) {
            const newSize = (asteroid.size - 1) as 2 | 1;

            const child1: AsteroidData = {
                id: generateId(),
                size: newSize,
                position: [
                    asteroid.position[0] + SPLIT_OFFSET,
                    asteroid.position[1] + randomRange(-0.5, 0.5),
                    asteroid.position[2],
                ],
                velocity: [
                    randomRange(SPLIT_VEL_X[0], SPLIT_VEL_X[1]),
                    randomRange(SPLIT_VEL_Y[0], SPLIT_VEL_Y[1]),
                    randomRange(SPLIT_VEL_Z[0], SPLIT_VEL_Z[1]),
                ],
            };

            const child2: AsteroidData = {
                id: generateId(),
                size: newSize,
                position: [
                    asteroid.position[0] - SPLIT_OFFSET,
                    asteroid.position[1] + randomRange(-0.5, 0.5),
                    asteroid.position[2],
                ],
                velocity: [
                    randomRange(SPLIT_VEL_X[0], SPLIT_VEL_X[1]),
                    randomRange(SPLIT_VEL_Y[0], SPLIT_VEL_Y[1]),
                    randomRange(SPLIT_VEL_Z[0], SPLIT_VEL_Z[1]),
                ],
            };

            newAsteroids.push(child1, child2);
        }

        const scorePoints = SCORE_BY_SIZE[asteroid.size] ?? 25;
        set({
            asteroids: newAsteroids,
            score: state.score + scorePoints,
        });
    },
}));
