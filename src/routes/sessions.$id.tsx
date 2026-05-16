import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Workouts } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/sessions/$id")({
  component: () => (
    <AuthGate>
      <AppShell>
        <SessionDetailPage />
      </AppShell>
    </AuthGate>
  ),
});

function SessionDetailPage() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["session", id],
    queryFn: () => Workouts.detail(id),
  });

  if (isLoading) return <div className="p-12 text-muted-foreground text-sm">Loading…</div>;
  if (error) return <div className="p-12 text-destructive font-mono text-sm">{(error as Error).message}</div>;
  if (!data) return null;

  return (
    <div className="p-6 md:p-12 max-w-5xl">
      <Link to="/sessions" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="h-3 w-3" /> All sessions
      </Link>

      <div className="flex items-end justify-between flex-wrap gap-4 mb-2">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-2">
            // session #{data.id}
          </div>
          <h1 className="display text-5xl md:text-6xl">
            {format(new Date(data.logged_at), "EEEE")}
          </h1>
          <div className="text-sm text-muted-foreground mt-1">
            {format(new Date(data.logged_at), "MMM d, yyyy · HH:mm")}
          </div>
        </div>
        {data.perceived_effort != null && (
          <div className="border border-border rounded-sm px-6 py-3 bg-card text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Perceived effort</div>
            <div className="display text-4xl text-primary">{data.perceived_effort}</div>
          </div>
        )}
      </div>

      {data.notes && (
        <div className="mt-6 border-l-2 border-primary pl-4 italic text-muted-foreground">
          "{data.notes}"
        </div>
      )}

      <details className="mt-6 border border-border rounded-sm bg-card">
        <summary className="cursor-pointer px-4 py-3 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
          Raw input
        </summary>
        <pre className="px-4 pb-4 text-sm font-mono whitespace-pre-wrap text-muted-foreground">{data.raw_input}</pre>
      </details>

      <div className="mt-10 space-y-4">
        <h2 className="display text-3xl">Exercises</h2>
        {data.exercises.length === 0 && (
          <div className="text-sm text-muted-foreground">No exercises parsed.</div>
        )}
        {data.exercises.map((ex) => (
          <div key={ex.id} className="border border-border rounded-sm bg-card overflow-hidden">
            <div className="flex items-start justify-between p-5 border-b border-border">
              <div>
                <h3 className="display text-2xl">{ex.name}</h3>
                {ex.notes && <div className="text-sm text-muted-foreground mt-1">{ex.notes}</div>}
                {ex.superset_group && (
                  <div className="inline-block mt-2 text-[10px] font-mono uppercase tracking-widest border border-accent text-accent px-2 py-0.5">
                    Superset · {ex.superset_group}
                  </div>
                )}
              </div>
              <Link
                to="/progression"
                search={{ name: ex.name }}
                className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" /> Progress
              </Link>
            </div>

            <table className="w-full text-sm">
              <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2 w-12">Set</th>
                  <th className="text-left px-5 py-2">Weight</th>
                  <th className="text-left px-5 py-2">Reps</th>
                  <th className="text-left px-5 py-2">RIR</th>
                  <th className="text-left px-5 py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {ex.sets.map((s, i) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-muted-foreground">{(s.set_order ?? i) + 1}</td>
                    <td className="px-5 py-3">
                      {s.weight != null ? (
                        <span><span className="text-primary font-bold">{s.weight}</span> <span className="text-muted-foreground text-xs">{s.unit || ""}</span></span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">{s.reps ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.rir ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{s.notes || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
