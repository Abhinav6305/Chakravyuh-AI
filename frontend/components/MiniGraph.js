"use client";

import { motion } from "framer-motion";

const nodes = [
  [20, 32, "high"],
  [42, 18, "medium"],
  [62, 38, "low"],
  [78, 22, "high"],
  [36, 64, "low"],
  [58, 72, "medium"],
  [82, 62, "low"]
];

const links = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [5, 6],
  [2, 5],
  [3, 6]
];

const colors = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#16a34a"
};

export default function MiniGraph() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
      <div className="soft-grid absolute inset-0 opacity-70" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {links.map(([a, b], index) => (
          <motion.line
            animate={{ pathLength: 1, opacity: 0.55 }}
            initial={{ pathLength: 0, opacity: 0 }}
            key={`${a}-${b}`}
            stroke="#0891b2"
            strokeWidth="0.35"
            transition={{ delay: 0.15 * index, duration: 0.8 }}
            x1={nodes[a][0]}
            x2={nodes[b][0]}
            y1={nodes[a][1]}
            y2={nodes[b][1]}
          />
        ))}
        {nodes.map(([x, y, risk], index) => (
          <motion.g
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0 }}
            key={`${x}-${y}`}
            style={{ transformOrigin: `${x}% ${y}%` }}
            transition={{ delay: 0.1 * index, type: "spring", stiffness: 180, damping: 14 }}
          >
            <circle cx={x} cy={y} fill={colors[risk]} r="2.4" />
            <circle cx={x} cy={y} fill="none" r="4.8" stroke={colors[risk]} strokeOpacity="0.2" strokeWidth="0.8" />
          </motion.g>
        ))}
      </svg>
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/80 bg-white/80 p-4 backdrop-blur">
        <p className="text-xs font-bold uppercase text-cyan-700">Live network intelligence</p>
        <p className="mt-1 text-sm font-semibold text-slate-700">Suspicious clusters surface through account relationships, shared IPs, and fraud proximity.</p>
      </div>
    </div>
  );
}
