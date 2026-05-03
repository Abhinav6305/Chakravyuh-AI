"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Eye, GitBranch, Landmark, LockKeyhole, Network, Radar, ShieldAlert } from "lucide-react";
import Button from "@/components/Button";
import MiniGraph from "@/components/MiniGraph";
import NetworkBackdrop from "@/components/NetworkBackdrop";
import { FadeUp, HoverLift, ScrollProgress, StickyParallaxItem, StickyParallaxSection } from "@/components/MotionShell";

const features = [
  { title: "Fraud Network Detection", icon: Network, text: "Reveal coordinated account rings through transaction paths and shared infrastructure." },
  { title: "Predictive Risk Scoring", icon: Radar, text: "Rank accounts before losses compound using proximity, centrality, and fraud-neighbor signals." },
  { title: "Multi-bank Intelligence", icon: Landmark, text: "Tenant-safe workspaces keep each bank isolated while preserving investigation speed." },
  { title: "Visual Investigation Dashboard", icon: Eye, text: "Investigators can click through accounts, evidence, and relationships in one graph." }
];

const steps = ["Upload Data", "Build Network Graph", "AI Risk Analysis", "Investigate & Prevent"];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-white">
      <ScrollProgress />
      <section className="relative flex min-h-screen items-center px-5 py-24">
        <NetworkBackdrop density={42} />
        <nav className="absolute left-0 right-0 top-0 z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
          <Link className="font-display text-xl font-semibold text-slate-950" href="/">Chakravyuh AI</Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="light">Sign In</Button></Link>
            <Link href="/signup"><Button variant="dark">Get Started</Button></Link>
          </div>
        </nav>

        <motion.div
          className="pointer-events-none absolute bottom-12 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-500 md:flex"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        >
          Scroll
          <span className="h-14 w-px bg-gradient-to-b from-slate-400 to-transparent" />
        </motion.div>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div initial={{ opacity: 0, y: 72, scale: 0.94, filter: "blur(18px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-sm font-semibold text-cyan-800 shadow-sm backdrop-blur">
              <ShieldAlert size={16} />
              Network intelligence for modern banking systems
            </div>
            <h1 className="font-display max-w-4xl text-6xl font-semibold leading-[1.03] text-slate-950 md:text-7xl">
              See Fraud Before It Happens
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
              AI-powered network intelligence for modern banking systems.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup"><Button variant="dark">Get Started <ArrowRight size={18} /></Button></Link>
              <Link href="/login"><Button variant="light">Sign In</Button></Link>
            </div>
          </motion.div>

          <motion.div className="floating-orbit" initial={{ opacity: 0, scale: 0.82, rotate: -8, filter: "blur(16px)" }} animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }} transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}>
            <MiniGraph />
          </motion.div>
        </div>
      </section>

      <StickyParallaxSection innerClassName="bg-white px-5">
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <StickyParallaxItem distance={110}>
            <p className="text-sm font-bold uppercase text-cyan-700">The problem</p>
            <h2 className="font-display mt-3 max-w-3xl text-5xl font-semibold leading-tight text-slate-950">Traditional fraud detection sees transactions. Fraud teams fight networks.</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">As you scroll, the old fraud model falls behind: isolated rules, delayed alerts, and hidden account relationships.</p>
          </StickyParallaxItem>
          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
            {[
              ["Traditional fraud detection fails", "Static rules miss activity that looks normal one transaction at a time."],
              ["Fraud is network-based", "Modern fraud moves through mule accounts, shared devices, and coordinated transfers."],
              ["Hidden connections matter", "Shared IPs and graph distance expose signals that flat tables bury."]
            ].map(([title, text], index) => (
              <StickyParallaxItem distance={170 - index * 38} key={title} reverse={index % 2 === 1}>
                <HoverLift className="h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-100">
                  <LockKeyhole className="text-cyan-700" />
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </HoverLift>
              </StickyParallaxItem>
            ))}
          </div>
        </div>
      </StickyParallaxSection>

      <StickyParallaxSection innerClassName="bg-slate-50 px-5">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          <StickyParallaxItem distance={190}><MiniGraph /></StickyParallaxItem>
          <StickyParallaxItem distance={130} reverse>
            <p className="text-sm font-bold uppercase text-cyan-700">The solution</p>
            <h2 className="font-display mt-3 text-5xl font-semibold leading-tight">We do not detect fraud transactions. We detect fraud networks.</h2>
            <div className="mt-8 space-y-4">
              {["Graph-based AI", "Explainable risk scoring", "Real-time insights"].map((item, index) => (
                <motion.div
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={item}
                  whileHover={{ x: 12, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                  <BrainCircuit className="text-cyan-700" />
                  <span className="font-semibold text-slate-800">{item}</span>
                </motion.div>
              ))}
            </div>
          </StickyParallaxItem>
        </div>
      </StickyParallaxSection>

      <StickyParallaxSection innerClassName="bg-white px-5">
        <div className="mx-auto w-full max-w-7xl">
          <StickyParallaxItem distance={90}>
            <p className="text-sm font-bold uppercase text-cyan-700">Features</p>
            <h2 className="font-display mt-3 max-w-3xl text-5xl font-semibold leading-tight">Built for serious fraud investigation teams</h2>
          </StickyParallaxItem>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StickyParallaxItem distance={120 + index * 28} key={feature.title} reverse={index % 2 === 0}>
                  <HoverLift className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
                    <Icon className="text-cyan-700" />
                    <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
                  </HoverLift>
                </StickyParallaxItem>
              );
            })}
          </div>
        </div>
      </StickyParallaxSection>

      <StickyParallaxSection innerClassName="bg-slate-950 px-5 text-white">
        <div className="mx-auto w-full max-w-7xl">
          <StickyParallaxItem distance={100}>
            <p className="text-sm font-bold uppercase text-cyan-300">How it works</p>
            <h2 className="font-display mt-3 max-w-4xl text-5xl font-semibold leading-tight">From raw bank CSV to investigation graph</h2>
          </StickyParallaxItem>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <StickyParallaxItem distance={150 + index * 22} key={step}>
                <motion.div
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur"
                  whileHover={{ scale: 1.04, y: -10, borderColor: "rgba(103,232,249,0.55)" }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">{index + 1}</div>
                  <h3 className="mt-6 text-xl font-semibold">{step}</h3>
                </motion.div>
              </StickyParallaxItem>
            ))}
          </div>
        </div>
      </StickyParallaxSection>

      <StickyParallaxSection innerClassName="relative bg-white px-5">
        <NetworkBackdrop density={28} />
        <StickyParallaxItem className="relative z-10 mx-auto max-w-4xl text-center" distance={140}>
          <GitBranch className="mx-auto text-cyan-700" size={42} />
          <h2 className="font-display mt-5 text-5xl font-semibold text-slate-950">Start Securing Your Bank Today</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Transform isolated transaction reviews into network-first fraud prevention.</p>
          <div className="mt-8">
            <Link href="/signup"><Button variant="dark">Get Started <ArrowRight size={18} /></Button></Link>
          </div>
        </StickyParallaxItem>
      </StickyParallaxSection>
    </main>
  );
}
