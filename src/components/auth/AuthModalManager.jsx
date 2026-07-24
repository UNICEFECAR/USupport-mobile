import React, { useContext, useMemo, useState } from "react";

import {
  AuthWelcomeModal,
  AuthLoginModal,
  AuthRegisterEmailModal,
  AuthRegisterAnonymousModal,
  AuthForgotPasswordModal,
} from "./modals";
import { Context } from "#services";

const AuthStep = {
  Welcome: "Welcome",
  Login: "Login",
  RegisterEmail: "RegisterEmail",
  RegisterAnonymous: "RegisterAnonymous",
  ForgotPassword: "ForgotPassword",
};

/**
 * Root-level authentication flow rendered as non-dismissible backdrops.
 *
 * This mirrors client-ui's authentication backdrops pattern: when unauthenticated,
 * we render an overlay flow instead of navigating to auth screens.
 */
export function AuthModalManager() {
  const { token, country } = useContext(Context);

  const initialStep = useMemo(() => {
    // Mirror client-ui: Welcome is the entry point and hub.
    return AuthStep.Welcome;
  }, [country]);

  const [step, setStep] = useState(initialStep);

  // If we became authenticated, render nothing.
  if (token) return null;

  switch (step) {
    case AuthStep.Welcome:
      return (
        <AuthWelcomeModal
          onRegisterEmail={() => setStep(AuthStep.RegisterEmail)}
          onRegisterAnonymous={() => setStep(AuthStep.RegisterAnonymous)}
          onLogin={() => setStep(AuthStep.Login)}
        />
      );

    case AuthStep.Login:
      return (
        <AuthLoginModal
          onGoBack={() => setStep(AuthStep.Welcome)}
          onGoToRegister={() => setStep(AuthStep.Welcome)}
          onGoToForgotPassword={() => setStep(AuthStep.ForgotPassword)}
        />
      );

    case AuthStep.ForgotPassword:
      return (
        <AuthForgotPasswordModal onDone={() => setStep(AuthStep.Login)} />
      );

    case AuthStep.RegisterEmail:
      return (
        <AuthRegisterEmailModal
          onGoBack={() => setStep(AuthStep.Welcome)}
          onGoToLogin={() => setStep(AuthStep.Login)}
        />
      );

    case AuthStep.RegisterAnonymous:
      return (
        <AuthRegisterAnonymousModal
          onGoBack={() => setStep(AuthStep.Welcome)}
          onGoToLogin={() => setStep(AuthStep.Login)}
        />
      );

    default:
      return null;
  }
}
