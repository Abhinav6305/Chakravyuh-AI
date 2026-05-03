"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import InvestigationGraph from "@/components/InvestigationGraph";
import { apiRequest } from "@/lib/api";

export default function InvestigatePage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiRequest("/graph/nodes"), apiRequest("/graph/edges")])
      .then(([nodeData, edgeData]) => {
        setNodes(nodeData);
        setEdges(edgeData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-cyan-700">Investigation graph</p>
        <h2 className="font-display mt-2 text-4xl font-semibold">Fraud network exploration</h2>
        <p className="mt-3 max-w-2xl text-slate-600">Click any node to open risk evidence, connected fraud accounts, and AI-generated investigator notes.</p>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}
      {loading ? (
        <div className="grid min-h-96 place-items-center rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
        </div>
      ) : (
        <InvestigationGraph nodes={nodes} edges={edges} />
      )}
    </DashboardShell>
  );
}
