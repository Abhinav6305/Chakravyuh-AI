"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, Database, UploadCloud } from "lucide-react";
import Link from "next/link";
import AIReportPanel from "@/components/AIReportPanel";
import Button from "@/components/Button";
import DashboardShell from "@/components/DashboardShell";
import MiniGraph from "@/components/MiniGraph";
import { apiRequest } from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/dashboard/summary").then(setSummary).catch((err) => setError(err.message));
  }, []);

  const cards = [
    { label: "Total Accounts", value: summary?.total_accounts ?? "-", icon: Database },
    { label: "High Risk", value: summary?.high_risk_count ?? "-", icon: AlertTriangle },
    { label: "Medium Risk", value: summary?.medium_risk_count ?? "-", icon: Activity },
    { label: "System Status", value: summary?.system_status || "Pending", icon: CheckCircle2 }
  ];

  return (
    <DashboardShell>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase text-cyan-700">Command center</p>
          <h2 className="font-display mt-2 text-4xl font-semibold text-slate-950">Fraud intelligence dashboard</h2>
        </div>
        <Link href="/accounts"><Button variant="dark"><UploadCloud size={18} /> Upload Data</Button></Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-100 transition hover:-translate-y-1 hover:shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              key={card.label}
            >
              <Icon className="text-cyan-700" />
              <p className="mt-5 text-sm font-bold uppercase text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {summary?.system_status !== "Active" ? (
        <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xl shadow-slate-100">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
            <UploadCloud size={34} />
          </div>
          <h3 className="font-display mt-6 text-2xl font-semibold">No accounts detected. Upload data to begin fraud analysis</h3>
          <p className="mt-3 max-w-xl text-slate-600">Once a transaction CSV is added, Chakravyuh AI will build a graph, score accounts, and activate the investigation workspace.</p>
          <Link className="mt-6" href="/accounts"><Button variant="teal">Upload CSV</Button></Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <MiniGraph />
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-100">
              <p className="text-sm font-bold uppercase text-cyan-700">Activity graph</p>
              <h3 className="font-display mt-3 text-3xl font-semibold">Network signals are active</h3>
              <p className="mt-4 leading-7 text-slate-600">The current graph contains {summary?.total_accounts} accounts and {summary?.total_edges} relationship edges. High-risk nodes are prioritized for investigation.</p>
              <Link className="mt-7 inline-flex" href="/investigate"><Button variant="dark">Open Investigation</Button></Link>
            </div>
          </div>

          <div className="mt-8">
            <AIReportPanel />
          </div>
        </>
      )}
    </DashboardShell>
  );
}
