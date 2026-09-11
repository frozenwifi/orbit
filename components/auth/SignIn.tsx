"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrbitWordmark } from "@/components/auth/OrbitWordmark";

const SIGN_IN_TRANSITION_MS = 7_000;

export function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    if (!isLoading) return;

    const timer = window.setTimeout(() => {
      router.push("/");
    }, SIGN_IN_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [isLoading, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
  }

  if (isLoading) {
    return (
      <main className="auth-loading-screen" aria-busy="true" aria-live="polite">
        <OrbitWordmark className="auth-loading-wordmark" label="Orbit is loading" />
        <span className="sr-only">Signing in to the Orbit Superadmin dashboard</span>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Orbit Superadmin dashboard preview">
        <OrbitWordmark className="auth-page-wordmark" />

        <div className="auth-device" aria-hidden="true">
          <span className="auth-device-button auth-device-button-one" />
          <span className="auth-device-button auth-device-button-two" />
          <span className="auth-device-button auth-device-button-three" />
          <div className="auth-device-screen">
            <img src="/assets/orbit-dashboard-dark.png" alt="" />
          </div>
        </div>
      </section>

      <section className="auth-login-panel" aria-labelledby="auth-title">
        <div className="auth-login-content">
          <h1 id="auth-title">Welcome 😎</h1>
          <p className="auth-intro">
            Launch a full turnkey MVNO and seamlessly integrate connectivity into your
            business operations with the first cloud-native, programmable
            Telecom-as-a-Service platform.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="orbit-email">Email</label>
              <input
                id="orbit-email"
                name="email"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="Enter your email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="orbit-password">Password</label>
              <input
                id="orbit-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>

            <button className="auth-forgot-button" type="button">
              Forgot password?
            </button>

            <button className="auth-submit-button" type="submit">
              Sign in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
