"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import Button from "@/components/Button";
import { generateRiskExplanation } from "@/lib/ai";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const riskColor = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#16a34a"
};

export default function InvestigationGraph({ nodes, edges }) {
  const graphRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const graphData = useMemo(() => ({
    nodes: nodes.map((node) => ({ ...node, val: node.risk_level === "High" ? 8 : node.risk_level === "Medium" ? 6 : 4 })),
    links: edges.map((edge) => ({ source: edge.source, target: edge.target, ...edge }))
  }), [nodes, edges]);

  const connectedFraud = useMemo(() => {
    if (!selected) return [];
    const highRisk = new Set(nodes.filter((node) => node.risk_level === "High").map((node) => node.id));
    return edges
      .filter((edge) => edge.source === selected.id || edge.target === selected.id)
      .map((edge) => (edge.source === selected.id ? edge.target : edge.source))
      .filter((id) => highRisk.has(id));
  }, [selected, nodes, edges]);

  const explain = async () => {
    if (!selected) return;
    setLoading(true);
    setAiText("");
    try {
      setAiText(await generateRiskExplanation(selected));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[680px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
      <div className="soft-grid absolute inset-0 opacity-60" />
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        backgroundColor="rgba(255,255,255,0)"
        nodeRelSize={6}
        cooldownTicks={80}
        linkColor={(link) => link.type === "ip_shared" ? "rgba(8,145,178,0.55)" : "rgba(100,116,139,0.34)"}
        linkDirectionalParticles={(link) => link.type === "transaction" ? 1 : 0}
        linkDirectionalParticleSpeed={0.004}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const radius = node.val;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = riskColor[node.risk_level] || "#16a34a";
          ctx.shadowBlur = 16;
          ctx.shadowColor = riskColor[node.risk_level] || "#16a34a";
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "rgba(15,23,42,0.22)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const fontSize = 12 / globalScale;
          ctx.font = `600 ${fontSize}px Inter, Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#0f172a";
          ctx.fillText(label, node.x, node.y + radius + 3);
        }}
        onNodeClick={(node) => {
          setSelected(node);
          setAiText("");
          graphRef.current?.centerAt(node.x, node.y, 700);
          graphRef.current?.zoom(2.2, 700);
        }}
      />

      <div className="absolute left-5 top-5 rounded-xl border border-slate-200 bg-white/85 p-4 shadow-lg backdrop-blur">
        <p className="text-xs font-bold uppercase text-slate-500">Risk legend</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
          <Legend color="#ef4444" label="High" />
          <Legend color="#f59e0b" label="Medium" />
          <Legend color="#16a34a" label="Low" />
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.aside
            animate={{ x: 0, opacity: 1 }}
            className="absolute bottom-0 right-0 top-0 w-full max-w-md border-l border-slate-200 bg-white/90 p-6 shadow-2xl backdrop-blur-xl"
            exit={{ x: 420, opacity: 0 }}
            initial={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <button className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setSelected(null)}>
              <X size={20} />
            </button>
            <p className="text-xs font-bold uppercase text-cyan-700">Account intelligence</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">{selected.id}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Risk score" value={Number(selected.risk_score).toFixed(2)} />
              <Metric label="Risk level" value={selected.risk_level} />
              <Metric label="Fraud neighbors" value={selected.fraud_neighbors || 0} />
              <Metric label="Centrality" value={Number(selected.centrality || 0).toFixed(2)} />
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold">Explanation</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {(selected.explanation || []).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold">Connected fraud accounts</p>
              <p className="mt-2 text-sm text-slate-600">{connectedFraud.length ? connectedFraud.join(", ") : "No direct high-risk account connection detected."}</p>
            </div>

            <Button className="mt-5 w-full" onClick={explain} variant="teal">
              <Sparkles size={18} />
              {loading ? "Generating..." : "Explain Risk"}
            </Button>

            {aiText && (
              <motion.div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-sm leading-6 text-slate-700" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {aiText}
              </motion.div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
