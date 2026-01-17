export const colors = {
    background: "#1A1A2E", // Deep Dark Blue
    surface: "#2D2D44",
    surfaceHighlight: "#3D3D58",

    // Glassmorphism
    glass: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "rgba(255, 255, 255, 0.1)",
        text: "rgba(255, 255, 255, 0.9)",
        textMuted: "rgba(255, 255, 255, 0.6)",
    },

    // Semantic Palette (Spark)
    palette: {
        ignite: "#FF6B6B",    // Red/Coral
        fogcutter: "#4ECDC4", // Teal
        pomodoro: "#FFBD69",  // Orange
        anchor: "#45B7D1",    // Blue
        checkin: "#A06EE1",   // Purple
        crisis: "#EF476F",    // Pink/Red Warning
    },

    text: "#FFFFFF",
    textMuted: "#888888",
    textFaint: "#666666",
    accent: "#A06EE1", // Updated to cleaner Purple
    danger: "#FF6B6B",
    border: "rgba(255,255,255,0.1)", // Subtle border
} as const;

export const spacing = {
    4: 4,
    8: 8,
    12: 12,
    16: 16,
    24: 24,
    32: 32,
    48: 48,
} as const;

export const radius = {
    input: 12,
    button: 14,
    card: 16,
    pill: 9999,
} as const;
