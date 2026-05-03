import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import NetworkBackdrop from "@/components/NetworkBackdrop";

export default function SignupPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-16">
      <NetworkBackdrop density={38} />
      <AuthCard mode="signup" />
      <p className="relative z-10 mt-6 text-sm font-medium text-slate-600">
        Already secured a workspace? <Link className="font-bold text-cyan-700" href="/login">Sign in</Link>
      </p>
    </main>
  );
}
