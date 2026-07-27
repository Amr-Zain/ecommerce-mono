"use client";

import * as React from "react";
import gsap from "gsap";

type MotionPreset =
  | "fade"
  | "slide-up"
  | "section"
  | "page-header"
  | "image"
  | "modal"
  | "drawer-inline";

const presets: Record<MotionPreset, gsap.TweenVars> = {
  fade: { autoAlpha: 0 },
  "slide-up": { autoAlpha: 0, y: 18 },
  section: { autoAlpha: 0, y: 24 },
  "page-header": { autoAlpha: 0, y: 14 },
  image: { autoAlpha: 0, scale: 1.035 },
  modal: { autoAlpha: 0, y: 12, scale: 0.985 },
  "drawer-inline": { autoAlpha: 0, xPercent: 8 },
};

interface MotionProps extends React.ComponentProps<"div"> {
  preset?: MotionPreset;
  delay?: number;
  duration?: number;
  revealOnScroll?: boolean;
}

function Motion({
  preset = "fade",
  delay = 0,
  duration = 0.55,
  revealOnScroll = false,
  ...props
}: MotionProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add(
      { reduceMotion: "(prefers-reduced-motion: reduce)" },
      (context) => {
        if (context.conditions?.reduceMotion) {
          gsap.set(root, { clearProps: "all" });
          return;
        }
        const play = () =>
          gsap.from(root, {
            ...presets[preset],
            delay,
            duration,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility",
          });
        if (!revealOnScroll || !("IntersectionObserver" in window)) {
          play();
          return;
        }
        gsap.set(root, presets[preset]);
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            observer.disconnect();
            gsap.to(root, {
              autoAlpha: 1,
              x: 0,
              xPercent: 0,
              y: 0,
              scale: 1,
              delay,
              duration,
              ease: "power2.out",
              clearProps: "transform,opacity,visibility",
            });
          },
          { rootMargin: "0px 0px -8%", threshold: 0.08 },
        );
        observer.observe(root);
        return () => observer.disconnect();
      },
      root,
    );
    return () => media.revert();
  }, [delay, duration, preset, revealOnScroll]);
  return <div ref={rootRef} {...props} />;
}

interface StaggerProps extends React.ComponentProps<"div"> {
  delay?: number;
  stagger?: number;
  revealOnScroll?: boolean;
}

function Stagger({
  delay = 0,
  stagger = 0.07,
  revealOnScroll = true,
  ...props
}: StaggerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = gsap.utils.toArray<HTMLElement>("[data-motion-item]", root);
    if (!items.length) return;
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const vars: gsap.TweenVars = {
          autoAlpha: 0,
          y: 18,
          delay,
          duration: 0.5,
          stagger,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
        };
        if (!revealOnScroll || !("IntersectionObserver" in window)) {
          gsap.from(items, vars);
          return;
        }
        gsap.set(items, { autoAlpha: 0, y: 18 });
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) return;
            observer.disconnect();
            gsap.to(items, { ...vars, autoAlpha: 1, y: 0 });
          },
          { rootMargin: "0px 0px -8%", threshold: 0.06 },
        );
        observer.observe(root);
        return () => observer.disconnect();
      },
      root,
    );
    return () => media.revert();
  }, [delay, revealOnScroll, stagger]);
  return <div ref={rootRef} {...props} />;
}

function HoverLift(props: React.ComponentProps<"div">) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add(
      "(hover: hover) and (prefers-reduced-motion: no-preference)",
      () => {
        const enter = () =>
          gsap.to(root, {
            y: -4,
            duration: 0.22,
            ease: "power2.out",
            overwrite: "auto",
          });
        const leave = () =>
          gsap.to(root, {
            y: 0,
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
          });
        root.addEventListener("pointerenter", enter);
        root.addEventListener("pointerleave", leave);
        return () => {
          root.removeEventListener("pointerenter", enter);
          root.removeEventListener("pointerleave", leave);
        };
      },
      root,
    );
    return () => media.revert();
  }, []);
  return <div ref={rootRef} {...props} />;
}

export { HoverLift, Motion, Stagger, type MotionPreset };
