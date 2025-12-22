import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugAuth() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      const session = await supabase.auth.getSession();
      const user = await supabase.auth.getUser();

      // Try to fetch from profiles table
      let profileData = null;
      let profileError = null;
      if (session.data.session?.user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.data.session.user.id)
          .single();
        profileData = data;
        profileError = error;
      }

      setInfo({
        session: session.data,
        sessionError: session.error,
        user: user.data,
        userError: user.error,
        profile: profileData,
        profileError: profileError,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        currentUrl: window.location.href,
      });
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Auth Debug Info</h1>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 font-semibold">Supabase URL</h2>
            <pre className="overflow-auto text-sm">{info.supabaseUrl || "Not set"}</pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 font-semibold">Current URL</h2>
            <pre className="overflow-auto text-sm">{info.currentUrl}</pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 font-semibold">Session</h2>
            <pre className="overflow-auto text-sm">{JSON.stringify(info.session, null, 2)}</pre>
          </div>

          {info.sessionError && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <h2 className="mb-2 font-semibold text-destructive">Session Error</h2>
              <pre className="overflow-auto text-sm">{JSON.stringify(info.sessionError, null, 2)}</pre>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 font-semibold">User</h2>
            <pre className="overflow-auto text-sm">{JSON.stringify(info.user, null, 2)}</pre>
          </div>

          {info.userError && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <h2 className="mb-2 font-semibold text-destructive">User Error</h2>
              <pre className="overflow-auto text-sm">{JSON.stringify(info.userError, null, 2)}</pre>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 font-semibold">Profile (from database)</h2>
            <pre className="overflow-auto text-sm">{JSON.stringify(info.profile, null, 2)}</pre>
          </div>

          {info.profileError && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <h2 className="mb-2 font-semibold text-destructive">Profile Error</h2>
              <pre className="overflow-auto text-sm">{JSON.stringify(info.profileError, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-4 py-2 text-white"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
