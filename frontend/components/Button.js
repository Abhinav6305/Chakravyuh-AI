"use client";

export default function Button({ children, variant = "dark", className = "", ...props }) {
  const base = "premium-button inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60";
  const styles = {
    dark: "bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.25)] hover:-translate-y-0.5",
    light: "border border-slate-200 bg-white/80 text-slate-950 shadow-sm backdrop-blur hover:-translate-y-0.5 hover:border-cyan-200",
    teal: "bg-cyan-700 text-white shadow-[0_18px_50px_rgba(8,145,178,0.22)] hover:-translate-y-0.5"
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} onMouseMove={handleMouseMove} {...props}>
      {children}
    </button>
  );
}
