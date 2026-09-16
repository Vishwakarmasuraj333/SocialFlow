"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Key, Server, CheckCircle2, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [flags, setFlags] = useState({
    registrationEnabled: true,
    strictOAuthScopeValidation: true,
    automatedCronDispatcher: true,
    immutableAuditLogging: true,
    rateLimitingEnforced: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Configuration & Security</h1>
          <p className="text-xs text-slate-500">
            Configure global feature flags, authentication policies, and cryptographic security settings.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} className="gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{saved ? "Settings Saved!" : "Save System Config"}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-500" />
            <span>Platform Feature Flags & Security Toggles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Public User Registration
              </span>
              <span className="text-[11px] text-slate-500">
                Allow new users to create accounts and provision workspace tenants.
              </span>
            </div>
            <input
              type="checkbox"
              checked={flags.registrationEnabled}
              onChange={(e) => setFlags({ ...flags, registrationEnabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Strict OAuth PKCE Scope Enforcement
              </span>
              <span className="text-[11px] text-slate-500">
                Reject any OAuth token handshake that lacks required platform scopes.
              </span>
            </div>
            <input
              type="checkbox"
              checked={flags.strictOAuthScopeValidation}
              onChange={(e) => setFlags({ ...flags, strictOAuthScopeValidation: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Background Cron & Queue Dispatcher
              </span>
              <span className="text-[11px] text-slate-500">
                Automatically process due scheduled posts every minute via background runner.
              </span>
            </div>
            <input
              type="checkbox"
              checked={flags.automatedCronDispatcher}
              onChange={(e) => setFlags({ ...flags, automatedCronDispatcher: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Immutable Audit Logging
              </span>
              <span className="text-[11px] text-slate-500">
                Record all administrative, publishing, and authorization events.
              </span>
            </div>
            <input
              type="checkbox"
              checked={flags.immutableAuditLogging}
              onChange={(e) => setFlags({ ...flags, immutableAuditLogging: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
