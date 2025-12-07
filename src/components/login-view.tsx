import { FormEvent, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useAuth } from "../lib/auth-context";
import { useTranslation } from "../lib/i18n";
import { LanguageSelector } from "./language-selector";
import { Shield, LogIn } from "lucide-react";
import { toast } from "sonner";

export function LoginView() {
  const { login, authenticating, authError } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login({ email, password });
      toast.success(t.loginSuccess);
    } catch (error) {
      const message =
        (error instanceof Error ? error.message : null) || authError || t.loginErrorFallback;
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold">PhishLab</p>
              <p className="text-sm text-muted-foreground">{t.loginProductTagline}</p>
            </div>
          </div>
          <LanguageSelector />
        </header>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>{t.loginTitle}</CardTitle>
            <CardDescription>{t.loginSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">{t.loginEmailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={authenticating}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.loginPasswordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={authenticating}
                  required
                />
              </div>

              {authError && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {authError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={authenticating}>
                <LogIn className="mr-2 size-4" />
                {authenticating ? t.loginButtonLoading : t.loginButton}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Version 2.0 • Developed by Webforge LLC
        </p>
      </div>
    </div>
  );
}
