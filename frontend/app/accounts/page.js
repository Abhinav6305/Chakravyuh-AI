"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileUp, UserPlus } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Button from "@/components/Button";
import { apiRequest } from "@/lib/api";

export default function AccountsPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const upload = async () => {
    if (!file) {
      setError("Choose a CSV file to start graph analysis.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setProgress(18);

    const timer = setInterval(() => setProgress((value) => Math.min(value + 14, 88)), 180);
    try {
      const body = new FormData();
      body.append("file", file);
      await apiRequest("/upload", { method: "POST", body });
      setProgress(100);
      setSuccess("CSV uploaded. Fraud graph rebuilt successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(timer);
      setUploading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-cyan-700">Data onboarding</p>
        <h2 className="font-display mt-2 text-4xl font-semibold">Add accounts and transactions</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <FileUp className="text-cyan-700" />
            <h3 className="font-display text-2xl font-semibold">Upload CSV</h3>
          </div>
          <label className="mt-6 grid min-h-64 cursor-pointer place-items-center rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/50 p-8 text-center transition hover:bg-cyan-50">
            <input className="hidden" type="file" accept=".csv" onChange={(event) => setFile(event.target.files?.[0])} />
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-cyan-700 shadow-lg">
                <FileUp size={30} />
              </div>
              <p className="mt-5 text-lg font-semibold">{file ? file.name : "Drag and drop CSV or browse"}</p>
              <p className="mt-2 text-sm text-slate-500">from_account, to_account, amount, timestamp, ip_address, is_known_fraud</p>
            </div>
          </label>

          {(uploading || progress > 0) && (
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <motion.div className="h-full rounded-full bg-cyan-600" animate={{ width: `${progress}%` }} />
            </div>
          )}

          {success && <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 font-semibold text-green-700"><CheckCircle2 size={18} /> {success}</div>}
          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

          <Button className="mt-6" disabled={uploading} onClick={upload} variant="dark">
            {uploading ? "Analyzing network..." : "Upload and Analyze"}
          </Button>
        </motion.section>

        <motion.section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="flex items-center gap-3">
            <UserPlus className="text-cyan-700" />
            <h3 className="font-display text-2xl font-semibold">Manual entry</h3>
          </div>
          <div className="mt-6 space-y-4">
            {["Account number", "Name", "IFSC", "Phone"].map((label) => (
              <label className="block" key={label}>
                <span className="text-xs font-bold uppercase text-slate-500">{label}</span>
                <input className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(6,182,212,0.12)]" />
              </label>
            ))}
          </div>
          <Button className="mt-6 w-full" type="button" variant="light">Save Manual Account</Button>
        </motion.section>
      </div>
    </DashboardShell>
  );
}
