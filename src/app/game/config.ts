/* ============================================================
 * GAME CONFIG — Central place for all tunable game constants
 * ============================================================ */

// ---- Game progression ----
export const MAX_DISTANCE = 500;           // AU to reach the planet
export const DISTANCE_SPEED = 10;          // AU per second
export const LANDING_PHASE_RATIO = 0.92;   // At 92% distance, stop asteroids & begin landing
export const PLANET_VISIBLE_RATIO = 0.55;  // Planet appears at 55% distance

// ---- Ship ----
export const SHIP_MOVE_SPEED = 20;
export const SHIP_BOUNDS_X = 14;
export const SHIP_BOUNDS_Y = 8;
export const SHIP_FIRE_RATE = 0.15;        // Seconds between shots

// ---- Barriers / Shields ----
export const MAX_BARRIERS = 3;
export const BARRIER_REGEN_INTERVAL = 10000; // ms between regen ticks
export const SHIP_COLLISION_RADIUS = 1.5;
export const COLLISION_COOLDOWN = 1.0;     // Seconds of invincibility after hit

// ---- Bullets ----
export const BULLET_SPEED = 100;
export const BULLET_MIN_Z = -100;          // Removed when z < this

// ---- Asteroids — dimensions ----
export const ASTEROID_SIZES = {
    3: { radius: 2, hitRadius: 2.4, color: "#8B4513" },
    2: { radius: 1.3, hitRadius: 1.6, color: "#A0522D" },
    1: { radius: 0.7, hitRadius: 0.9, color: "#CD853F" },
} as const;

// ---- Asteroids — spawning ----
export const ASTEROID_SPAWN_Z_MIN = -100;   // Farthest spawn z
export const ASTEROID_SPAWN_Z_MAX = -70;    // Nearest spawn z
export const ASTEROID_SPREAD_X = 30;        // Horizontal spread
export const ASTEROID_SPREAD_Y = 20;        // Vertical spread
export const ASTEROID_INITIAL_COUNT = 15;
export const ASTEROID_OOB_Z = 15;           // Removed when z > this (behind camera)

// ---- Asteroids — velocity ----
export const ASTEROID_VEL_X = [-1, 1] as const;     // Lateral drift range
export const ASTEROID_VEL_Y = [-1, 1] as const; // Vertical drift range
export const ASTEROID_VEL_Z = [12, 20] as const;     // Forward speed range (toward +z)

// ---- Asteroids — split children velocity ----
export const SPLIT_VEL_X = [-2, 2] as const;
export const SPLIT_VEL_Y = [-1, 1] as const;
export const SPLIT_VEL_Z = [5, 12] as const;
export const SPLIT_OFFSET = 1.5;

// ---- Asteroids — spawn rate (decreases over time) ----
export const SPAWN_INTERVAL_BASE = 0.5;    // Seconds at start
export const SPAWN_INTERVAL_MIN = 0.1;     // Minimum spawn interval
export const SPAWN_INTERVAL_DECAY = 0.003; // Multiplied by distance to reduce interval

// ---- Scoring ----
export const SCORE_BY_SIZE: Record<number, number> = {
    1: 100,
    2: 50,
    3: 25,
};

// ---- Camera ----
export const CAMERA_POSITION: [number, number, number] = [0, 3, 12];
export const CAMERA_FOV = 70;
export const CAMERA_LOOK_AT: [number, number, number] = [0, 0, -30];

// ---- Planet ----
export const PLANET_Z = -120;
export const PLANET_RADIUS = 14;

// ---- Speed lines ----
export const SPEED_LINE_COUNT = 200;
