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

// Types based on actual API response
interface Set {
  weight: number | null;
  unit: string | null;
  reps: number;
  rir: number;
  notes: string | null;
}

interface Exercise {
  name: string;
  sets: Set[];
  notes: string | null;
  superset_group: string | null;
}

interface ParsedWorkout {
  name: string;
  exercises: Exercise[];
  notes: string | null;
  perceived_effort: number | null;
}

interface Feedback {
  overall_rating: number;
  volume_notes: string;
  balance_notes: string;
  coaching_tip: string;
  summary: string;
}

interface WorkoutResponse {
  raw_input: string;
  user_id: number;
  is_fitness_related: boolean;
  parsed_workout: ParsedWorkout;
  is_valid: boolean;
  validation_issues: any[];
  session_id: number;
  feedback: Feedback;
  error: string | null;
  workout_history: string[];
}

function LogPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkoutResponse | null>(null);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await Workouts.log(text) as WorkoutResponse;
      setResult(res);
      
      // Handle different response scenarios
      if (res?.session_id) {
        if (res.is_valid) {
          toast.success("Workout logged successfully!");
        } else {
          toast.warning("Workout logged with validation issues");
        }
      } else if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Workout logged!");
      }
    } catch (err: any) {
      console.error("Error logging workout:", err);
      toast.error(err.message || "Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
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
                className="text-[11px] font-mono border border-border rounded-sm px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                {ex.slice(0, 40)}…
              </button>
            ))}
          </div>
          <button
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-opacity"
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
        <div className="mt-10 border border-border rounded-sm bg-card p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h3 className="display text-2xl mb-1">Session #{result.session_id}</h3>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-sm ${result.is_valid ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {result.is_valid ? '✓ Valid' : '⚠️ Has Issues'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-sm bg-primary/10 text-primary">
                  Rating: {result.feedback?.overall_rating || 'N/A'}/10
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/sessions/$id", params: { id: String(result.session_id) } })}
              className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
            >
              View session →
            </button>
          </div>

          {/* Raw Input */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Raw Input</div>
            <div className="bg-background border border-border rounded-sm p-3 text-sm font-mono">
              "{result.raw_input}"
            </div>
          </div>

          {/* Parsed Exercises */}
          {result.parsed_workout?.exercises && result.parsed_workout.exercises.length > 0 && (
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Parsed Exercises</div>
              <div className="space-y-4">
                {result.parsed_workout.exercises.map((exercise, idx) => (
                  <div key={idx} className="bg-background border border-border rounded-sm p-4">
                    <h4 className="font-bold text-lg mb-3">{exercise.name}</h4>
                    <div className="space-y-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-1">Set</th>
                            <th className="text-left py-1">Weight</th>
                            <th className="text-left py-1">Reps</th>
                            <th className="text-left py-1">RIR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set, setIdx) => (
                            <tr key={setIdx} className="border-b border-border/50">
                              <td className="py-1">{setIdx + 1}</td>
                              <td className="py-1">{set.weight ? `${set.weight} ${set.unit || ''}` : '—'}</td>
                              <td className="py-1">{set.reps}</td>
                              <td className="py-1">{set.rir}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {exercise.notes && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Note: {exercise.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {result.feedback && (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">AI Coach Feedback</div>
              
              {result.feedback.volume_notes && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-primary">Volume Analysis</div>
                  <div className="text-sm text-muted-foreground">{result.feedback.volume_notes}</div>
                </div>
              )}
              
              {result.feedback.balance_notes && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-primary">Balance Analysis</div>
                  <div className="text-sm text-muted-foreground">{result.feedback.balance_notes}</div>
                </div>
              )}
              
              {result.feedback.coaching_tip && (
                <div className="bg-primary/5 border-l-2 border-primary pl-3 py-2">
                  <div className="text-xs font-semibold text-primary">💡 Coaching Tip</div>
                  <div className="text-sm">{result.feedback.coaching_tip}</div>
                </div>
              )}
              
              {result.feedback.summary && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-primary">Summary</div>
                  <div className="text-sm">{result.feedback.summary}</div>
                </div>
              )}
            </div>
          )}

          {/* Workout History (if available) */}
          {result.workout_history && result.workout_history.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recent History</div>
              <div className="space-y-1">
                {result.workout_history.map((history, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground border-l-2 border-border pl-3">
                    • {history}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Issues */}
          {result.validation_issues && result.validation_issues.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-yellow-500">Validation Issues</div>
              <div className="space-y-1">
                {result.validation_issues.map((issue, idx) => (
                  <div key={idx} className="text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {result.error && (
            <div className="border-l-2 border-destructive pl-4 text-sm text-destructive">
              <span className="font-semibold">Error:</span> {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
