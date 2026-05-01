import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import circleLogo from "@/assets/circle-logo.png";
import { Eye, EyeOff } from "lucide-react";

const AuthScreen = () => {
  const { login, signup } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name || email.split("@")[0], email, password);
    } catch {
      // toasts shown in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-10">
          <img src={circleLogo} alt="Circle" className="w-20 h-20 mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Circle</h1>
          <p className="text-muted-foreground mt-1">Find your people</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
            />
          )}
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-secondary border-0 pr-12 text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" variant="hero" disabled={submitting} className="w-full h-12 rounded-xl text-base font-semibold">
            {submitting ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-muted-foreground"
          >
            {mode === "login" ? (
              <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
            ) : (
              <>Already have an account? <span className="text-primary font-medium">Log in</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
