import { useEffect, useState, useMemo } from "react";

/**
 * Normalizes an RGB color string to an array [r, g, b] where components are 0-1
 */
const parseToLottieColor = (colorStr: string): number[] | null => {
    if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)') return null;

    // Create a canvas or temp element to get computed RGB
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = colorStr;
    const computed = ctx.fillStyle; // will be in #rrggbb format

    if (computed.startsWith('#')) {
        const r = parseInt(computed.slice(1, 3), 16) / 255;
        const g = parseInt(computed.slice(3, 5), 16) / 255;
        const b = parseInt(computed.slice(5, 7), 16) / 255;
        return [r, g, b];
    }

    const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
        return [
            parseInt(match[1]) / 255,
            parseInt(match[2]) / 255,
            parseInt(match[3]) / 255,
        ];
    }

    return [0, 0, 0];
};

/**
 * Resolves a color name (variable, hex, rgb) to Lottie normalized format
 */
export const resolveColor = (colorName: string): number[] => {
    if (typeof window === "undefined") return [0, 0, 0];

    const temp = document.createElement("div");
    // Expand candidates specifically for Tailwind 4 and common HSL/Variables patterns
    const base = colorName.replace(/^--color-|^--/, "");
    const candidates = [
        colorName,                    // e.g. "red" or "#fff"
        `var(--${base})`,            // e.g. var(--primary)
        `var(--color-${base})`,      // e.g. var(--color-primary) - Tailwind 4 style
        `hsl(var(--${base}))`,       // e.g. hsl(var(--primary)) - Shadcn style
        `var(--${colorName})`,
        `var(${colorName})`
    ];

    for (const cand of candidates) {
        temp.style.color = cand;
        document.body.appendChild(temp);
        const color = getComputedStyle(temp).color;
        document.body.removeChild(temp);

        if (color && color !== 'rgb(0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
            const parsed = parseToLottieColor(color);
            if (parsed) return parsed;
        }
    }

    return [0, 0, 0];
};

/**
 * Deeply searches and replaces colors in the Lottie JSON
 */
export const colorize = (data: any, map: Record<string, number[]>): any => {
    if (!data) return null;
    const clone = JSON.parse(JSON.stringify(data));

    const processColor = (colorArr: any) => {
        if (!Array.isArray(colorArr)) return colorArr;
        const r = colorArr[0], g = colorArr[1], b = colorArr[2];

        for (const [key, replacement] of Object.entries(map)) {
            const parts = key.split(',').map(Number);
            if (parts.length >= 3) {
                if (Math.abs(r - parts[0]) < 0.05 && Math.abs(g - parts[1]) < 0.05 && Math.abs(b - parts[2]) < 0.05) {
                    if (colorArr.length === 4) return [...replacement, colorArr[3]];
                    return [...replacement];
                }
            }
        }
        return colorArr;
    };

    const traverse = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;

        // Static color: { c: { k: [r, g, b] } } with a: 0
        if (obj.c && Array.isArray(obj.c.k) && obj.c.a === 0) {
            obj.c.k = processColor(obj.c.k);
        }
        // Animated color: { c: { k: [ { s: [r, g, b] } ] } } with a: 1
        else if (obj.c && Array.isArray(obj.c.k) && obj.c.a === 1) {
            obj.c.k.forEach((keyframe: any) => {
                if (keyframe.s) keyframe.s = processColor(keyframe.s);
                if (keyframe.e) keyframe.e = processColor(keyframe.e);
            });
        }

        for (const key in obj) {
            if (typeof obj[key] === 'object') traverse(obj[key]);
        }
    };

    traverse(clone);
    return clone;
};

/**
 * Hook to get a theme-aware Lottie animation data
 */
export const useThemeAwareLottie = (data: any, mappings: Record<string, string>) => {
    const [result, setResult] = useState(data);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const observer = new MutationObserver(() => setTick(t => t + 1));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!data) return;
        const resolvedMap: Record<string, number[]> = {};
        for (const [key, val] of Object.entries(mappings)) {
            resolvedMap[key] = resolveColor(val);
        }
        setResult(colorize(data, resolvedMap));
    }, [data, mappings, tick]);

    return result;
};
