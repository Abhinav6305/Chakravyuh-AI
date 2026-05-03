"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, FileText, Sparkles } from "lucide-react";
import Button from "@/components/Button";
import { apiRequest } from "@/lib/api";

export default function AIReportPanel() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateReport = async () => {
    setLoading(true);
    setError("");
    try {
      setReport(await apiRequest("/ai/report"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-100">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
              <BrainCircuit size={23} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-cyan-700">AI insights</p>
              <h3 className="font-display text-2xl font-semibold text-slate-950">Fraud intelligence report</h3>
            </div>
          </div>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Generate a bank-level AI report across all accounts, risk scores, graph relationships, shared IP signals, and priority investigation paths.
          </p>
        </div>
        <Button disabled={loading} onClick={generateReport} variant="teal">
          <Sparkles size={18} />
          {loading ? "Analyzing graph..." : "Generate AI Report"}
        </Button>
      </div>

      {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      {report && (
        <motion.div
          className="mt-7 space-y-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5">
            <div className="flex items-center gap-2 text-sm font-bold uppercase text-cyan-800">
              <FileText size={16} />
              Executive summary
            </div>
            <p className="mt-3 leading-7 text-slate-700">{report.executive_summary}</p>
            <p className="mt-3 text-xs font-semibold uppercase text-slate-500">Provider: {report.provider}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ReportList title="Key findings" items={report.key_findings} />
            <ReportList title="Recommended actions" items={report.recommended_actions} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(report.risk_distribution || {}).map(([level, count]) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={level}>
                <p className="text-xs font-bold uppercase text-slate-500">{level} risk</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{count}</p>
              </div>
            ))}
          </div>

          {report.priority_accounts?.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold uppercase text-slate-500">
                Priority accounts
              </div>
              <div className="divide-y divide-slate-100">
                {report.priority_accounts.slice(0, 6).map((account) => (
                  <div className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto]" key={account.id}>
                    <div>
                      <p className="font-semibold text-slate-950">{account.id}</p>
                      <p className="mt-1 text-sm text-slate-500">{account.explanation?.[0] || "Graph risk signal detected"}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">Score {Number(account.risk_score).toFixed(2)}</span>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">{account.risk_level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.model_report && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-bold uppercase text-slate-500">AI report narrative</p>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{report.model_report}</p>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}

function ReportList({ title, items = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-bold uppercase text-slate-500">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div className="flex gap-3 text-sm leading-6 text-slate-700" key={item}>
            <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-700" size={17} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
