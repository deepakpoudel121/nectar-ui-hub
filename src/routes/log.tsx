import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Workouts } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { toast } from "sonner";
import { Sparkles, Send } from "lucide-react";

export const Route = createFileRoute("/log")({
  component: () => (
    <AuthGate>
      <AppShell>
        <LogPage />
      </AppShell>
    </AuthGate>
  ),
});

const EXAMPLES = [
  "bench 5x5 80kg felt easy then incline db 3x10 26s",
  "squat 100kg x5 x5 x5, leg press 4 plates 12 12 10, calves 3x20",
  "ran 5k in 28 mins easy zone 2",
];

function LogPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await Workouts.log(text);
      setResult(res);
      if (res?.session_id) {
        toast.success("Workout logged. Parsing complete.");
      } else if (res?.error) {
        toast.error(res.error);
      } else if (res?.feedback) {
        toast.message(res.feedback);
      } else {
        toast.success("Logged.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl">
      <div className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-2">// new entry</div>
      <h1 className="display text-5xl md:text-7xl mb-2">LOG WORKOUT</h1>
      <p className="text-muted-foreground mb-10 max-w-xl">
        Type it however you'd say it. Slang, typos, abbreviations — the parser will handle it.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="bench 5x5 80kg felt strong, then curls 3x12 light…"
            rows={8}
            className="w-full bg-input border border-border rounded-sm p-5 text-base font-mono leading-relaxed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-muted-foreground">
            {text.length} chars
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setText(ex)}
                className="text-[11px] font-mono border border-border rounded-sm px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary"
              >
                {ex.slice(0, 40)}…
              </button>
            ))}
          </div>
          <button
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40"
          >
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" /> Parsing…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Log it
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-10 border border-border rounded-sm bg-card p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="display text-2xl">Parser response</h3>
            {result?.session_id && (
              <button
                onClick={() => navigate({ to: "/sessions/$id", params: { id: String(result.session_id) } })}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
              >
                View session →
              </button>
            )}
          </div>

          {result?.feedback && (
            <div className="border-l-2 border-primary pl-4 text-sm">{result.feedback}</div>
          )}
          {result?.error && (
            <div className="border-l-2 border-destructive pl-4 text-sm text-destructive">{result.error}</div>
          )}

          {result?.parsed_workout && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Parsed</div>
              <pre className="bg-background border border-border rounded-sm p-4 text-xs font-mono overflow-x-auto max-h-96">
                {JSON.stringify(result.parsed_workout, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
