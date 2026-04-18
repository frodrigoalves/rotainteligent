import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, MapPin, Volume2, Gauge, Settings2 } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RA Routes — Cabine do Motorista" },
      {
        name: "description",
        content:
          "Plataforma profissional de condução assistida para motoristas: rota guiada por voz, telemetria e mapa em tempo real.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Discrete operator/manager link */}
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <Link
          to="/gestor"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
          aria-label="Acesso restrito ao painel do gestor"
        >
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="font-mono uppercase tracking-[0.18em]">Operação</span>
        </Link>
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-20">
        <AnimatePresence>
          {mounted && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 flex items-center gap-2.5 rounded-full border border-border bg-surface/60 px-4 py-1.5 backdrop-blur"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Cabine pronta para condução
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-center text-4xl font-semibold tracking-tight md:text-6xl"
              >
                Bem-vindo,{" "}
                <span className="bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
                  motorista
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-5 max-w-xl text-center text-base text-muted-foreground md:text-lg"
              >
                Inicie seu percurso com orientações através do sistema de
                Rota Inteligente.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 w-full max-w-md"
              >
                <Link
                  to="/motorista"
                  className="group relative block overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary to-accent p-[1px] shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="rounded-[15px] bg-surface px-8 py-7">
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                        <Navigation className="h-6 w-6" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                          Entrar na cabine
                        </div>
                        <div className="mt-1 text-xl font-semibold">
                          Iniciar condução
                        </div>
                      </div>
                      <span className="text-2xl text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-14 grid grid-cols-3 gap-6 text-center sm:gap-10"
              >
                {[
                  { Icon: MapPin, label: "Trajeto completo" },
                  { Icon: Volume2, label: "Voz em pt-BR" },
                  { Icon: Gauge, label: "Telemetria" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <Icon
                      className="h-5 w-5 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
