"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 70, scale: 0.94, filter: "blur(14px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function TumbleSection({ children, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [18, 0, -16]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.5, 1], [-1.8, 0, 1.4]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [120, 0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.86, 1], [0.2, 1, 1, 0.2]);
  const filter = useTransform(scrollYProgress, [0, 0.22, 0.8, 1], ["blur(14px)", "blur(0px)", "blur(0px)", "blur(10px)"]);

  return (
    <motion.section
      ref={ref}
      className={className}
      style={{ filter, opacity, rotateX, rotateZ, scale, y, transformPerspective: 1000 }}
    >
      {children}
    </motion.section>
  );
}

export function CinematicSection({ children, className = "", dark = false }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const clipPath = useTransform(scrollYProgress, [0, 0.2, 0.82, 1], [
    "inset(10% 8% round 28px)",
    "inset(0% 0% round 0px)",
    "inset(0% 0% round 0px)",
    "inset(8% 7% round 28px)"
  ]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [110, 0, -110]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.95]);

  return (
    <motion.section
      ref={ref}
      className={`relative ${className}`}
      style={{ clipPath, scale, y }}
    >
      <motion.div
        className={`pointer-events-none absolute inset-x-0 top-0 h-40 ${dark ? "bg-gradient-to-b from-white/10 to-transparent" : "bg-gradient-to-b from-cyan-100/60 to-transparent"}`}
        style={{ opacity: useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0, 1, 0]) }}
      />
      {children}
    </motion.section>
  );
}

export function ParallaxLayer({ children, className = "", distance = 90 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  return (
    <motion.div ref={ref} className={className} style={{ rotate, y }}>
      {children}
    </motion.div>
  );
}

export function StickyParallaxSection({ children, className = "", innerClassName = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.96, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const opacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 1, 0.35]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], ["0px", "34px"]);

  return (
    <section ref={ref} className={`relative min-h-[190vh] ${className}`}>
      <motion.div
        className={`sticky top-0 flex min-h-screen items-center overflow-hidden ${innerClassName}`}
        style={{ borderRadius, opacity, rotateX, scale, transformPerspective: 1200, y }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export function StickyParallaxItem({ children, className = "", distance = 160, reverse = false }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], reverse ? [-distance, distance] : [distance, -distance]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.82, 1], [0, 1, 1, 0.25]);

  return (
    <motion.div ref={ref} className={className} style={{ opacity, scale, y }}>
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-cyan-500 via-teal-400 to-slate-950"
      style={{ scaleX }}
    />
  );
}

export function HoverLift({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -12, scale: 1.035, rotateX: 4, rotateY: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
