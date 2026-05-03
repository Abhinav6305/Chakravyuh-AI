"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, GitBranch, LogOut, Menu, Shield, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { clearSession, getBankProfile, getToken } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/accounts", label: "Add Accounts", icon: UploadCloud },
  { href: "/investigate", label: "Investigation", icon: GitBranch }
];

export default function DashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState({ bankName: "Bank", branch: "Fraud command center" });

  useEffect(() => {
    if (!getToken()) router.push("/login");
    setProfile(getBankProfile());
  }, [router]);

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className={`fixed left-4 top-4 z-30 hidden h-[calc(100vh-32px)] rounded-2xl border border-white/70 bg-white/75 p-3 shadow-2xl shadow-slate-200/80 backdrop-blur-xl transition-all lg:block ${collapsed ? "w-20" : "w-72"}`}>
        <div className="flex items-center justify-between gap-3 px-2 py-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="rounded-xl bg-slate-950 p-3 text-white">
              <Shield size={22} />
            </div>
            {!collapsed && (
              <div>
                <p className="text-xs font-bold text-cyan-700">Chakravyuh AI</p>
                <p className="truncate text-sm font-semibold">{profile.bankName}</p>
              </div>
            )}
          </div>
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" onClick={() => setCollapsed(!collapsed)}>
            <Menu size={18} />
          </button>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-slate-950 text-white shadow-xl shadow-slate-300" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}
                href={item.href}
                key={item.href}
              >
                <Icon size={19} />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={`transition-all ${collapsed ? "lg:pl-28" : "lg:pl-80"}`}>
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-cyan-700">{profile.branch}</p>
              <h1 className="font-display text-xl font-semibold text-slate-950">{profile.bankName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold sm:block">
                {profile.bankId || "DEMO"}
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">
                {(profile.bankName || "B").slice(0, 1)}
              </div>
              <button className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" onClick={logout}>
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <motion.main
          className="mx-auto max-w-7xl px-5 py-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
