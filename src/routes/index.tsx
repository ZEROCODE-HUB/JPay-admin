import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, Eye, EyeOff, Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useDemoMode } from "@/contexts/demo-mode";
import { supabase, getAuthErrorMessage } from "@/lib/supabase";
import { brand, pageTitle } from "@/brand/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: pageTitle() },
      { name: "description", content: `Panel de administración de la plataforma ${brand.shortName}.` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setRole } = useDemoMode();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      console.warn(
        "Supabase no configurado: faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en el entorno de build.",
      );
      setError("Credenciales inválidas.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(getAuthErrorMessage(error.message));
      setLoading(false);
      return;
    }
    setRole("admin");
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden select-none">
      {/* Animated background image */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <img
          src={brand.assets.loginBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover animate-kenburns"
        />
      </div>

      {/* Contrast overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--brand-navigation) 72%, transparent) 0%, color-mix(in srgb, var(--brand-navigation) 55%, transparent) 45%, color-mix(in srgb, var(--brand-navigation) 78%, transparent) 100%), radial-gradient(ellipse at center, color-mix(in srgb, var(--brand-navigation) 15%, transparent) 0%, color-mix(in srgb, var(--brand-navigation) 65%, transparent) 100%)",
        }}
      />

      <div className="w-full max-w-[400px] relative">
        {/* Logo + title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <BrandLogo size={44} variant="light" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-white tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-base text-white/50 mt-2">Inicia sesión para continuar.</p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8 shadow-[0_24px_64px_rgba(0,0,0,0.45)] relative overflow-hidden"
          style={{
            background: "color-mix(in srgb, var(--brand-navigation) 78%, transparent)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Brand glow */}
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-25 pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--brand-primary-500) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand-primary-500) 60%, transparent), transparent)",
            }}
          />
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-white/80 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`admin@${brand.web.domain}`}
                  required
                  autoComplete="email"
                  className="w-full h-11 pl-9 pr-3.5 rounded-lg border border-white/15 bg-white/5 text-sm text-white placeholder:text-white/35 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white/10 focus:ring-2 focus:ring-primary-500/25"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-white/80 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-9 pr-10 rounded-lg border border-white/15 bg-white/5 text-sm text-white placeholder:text-white/35 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white/10 focus:ring-2 focus:ring-primary-500/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition cursor-pointer"
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-500/40 bg-danger-500/15 px-3 py-2.5 text-xs text-danger-200">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary-500 text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-[0_8px_24px_-8px_var(--brand-primary-500)] transition-all duration-200 hover:bg-primary-400 active:bg-primary-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4 pt-4 border-t border-white/10 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary-500/25 bg-primary-500/10">
              <ShieldCheck size={12} className="text-primary-300" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-300">
                Registrado ante BCRA
              </span>
            </div>
            <p className="text-center text-[11px] text-white/45 leading-relaxed">
              Solo administradores autorizados.
              <br />
              {brand.shortName} &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
