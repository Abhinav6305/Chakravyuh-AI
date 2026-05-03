"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Button from "@/components/Button";
import { apiRequest, saveSession } from "@/lib/api";

export default function AuthCard({ mode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [form, setForm] = useState({
    bank_id: "DEMO",
    bank_name: "",
    branch: isSignup ? "" : "Main Branch",
    password: "demo123"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = isSignup
        ? form
        : { bank_id: form.bank_id, password: form.password };
      const auth = await apiRequest(isSignup ? "/signup" : "/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      saveSession(auth);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  };

  return (
    <motion.div
      className="glass relative z-10 w-full max-w-md rounded-2xl p-7"
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-slate-950 p-3 text-white shadow-xl">
          <ShieldCheck size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-cyan-700">Chakravyuh AI</p>
          <h1 className="font-display text-3xl font-semibold text-slate-950">
            {isSignup ? "Create bank workspace" : "Sign in securely"}
          </h1>
        </div>
      </div>

      <form className="space-y-5" onSubmit={submit}>
        <FloatingInput label="Bank ID" name="bank_id" value={form.bank_id} onChange={update} />
        {isSignup && (
          <FloatingInput label="Bank Name" name="bank_name" value={form.bank_name} onChange={update} />
        )}
        <FloatingInput label="Branch Name" name="branch" value={form.branch} onChange={update} />
        <FloatingInput label="Password" name="password" type="password" value={form.password} onChange={update} />

        {error && (
          <motion.div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <Button className="w-full" disabled={loading} type="submit" variant="dark">
          {loading ? "Securing session..." : isSignup ? "Create Workspace" : "Enter Dashboard"}
        </Button>
      </form>
    </motion.div>
  );
}

function FloatingInput({ label, ...props }) {
  return (
    <label className="group relative block">
      <input
        className="peer w-full rounded-xl border border-slate-200 bg-white/75 px-4 pb-3 pt-6 text-sm font-semibold text-slate-950 outline-none transition focus:border-cyan-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(6,182,212,0.12)]"
        placeholder=" "
        required
        {...props}
      />
      <span className="pointer-events-none absolute left-4 top-2 text-xs font-semibold text-slate-500 transition peer-focus:text-cyan-700">
        {label}
      </span>
    </label>
  );
}
