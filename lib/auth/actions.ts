"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { isRegistrationConfigured } from "@/lib/auth/env";
import {
  AuthConfigurationError,
  assertAuthConfigured,
  getCurrentAuthState,
} from "@/lib/auth/session";
import { registerUser, updateUserDisplayName } from "@/lib/auth/sanity-profile";
import {
  sanitizeNextPath,
  parseRegisterRole,
  validateEmail,
  validateFullName,
  validatePassword,
} from "@/lib/auth/validation";

export type AuthFormState = {
  error?: string;
  success?: string;
};

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    assertAuthConfigured();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const nextPath = sanitizeNextPath(String(formData.get("next") ?? ""));

    const emailError = validateEmail(email);
    if (emailError) {
      return { error: emailError };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { error: passwordError };
    }

    await signIn("credentials", {
      email: email.trim(),
      password,
      redirectTo: nextPath,
    });

    return {};
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AuthConfigurationError) {
      return {
        error:
          "Auth is not configured. Add AUTH_SECRET to .env.local and restart the server.",
      };
    }
    if (error instanceof AuthError) {
      return { error: "Incorrect email or password" };
    }
    throw error;
  }
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    if (!isRegistrationConfigured()) {
      return {
        error:
          "Registration is unavailable: AUTH_SECRET and SANITY_API_WRITE_TOKEN are required in .env.local.",
      };
    }

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "");

    const emailError = validateEmail(email);
    if (emailError) {
      return { error: emailError };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { error: passwordError };
    }

    const fullNameError = validateFullName(fullName);
    if (fullNameError) {
      return { error: fullNameError };
    }

    const role = parseRegisterRole(formData.get("accountRole"));

    await registerUser({
      email,
      password,
      displayName: fullName.trim() || null,
      role,
    });

    revalidatePath("/", "layout");
    const redirectTo =
      role === "seller" ? "/seller/store?setup=1" : "/account";
    await signIn("credentials", {
      email: email.trim(),
      password,
      redirectTo,
    });

    return {};
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      return { error: "Could not sign in after registration. Try signing in manually." };
    }
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return { error: "A user with this email is already registered" };
    }
    return { error: "Could not create account. Try again." };
  }
}

export async function logoutAction(): Promise<void> {
  assertAuthConfigured();
  await signOut({ redirectTo: "/" });
  revalidatePath("/", "layout");
}

export async function updateProfileAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const authState = await getCurrentAuthState();
    if (!authState) {
      redirect("/login?next=/profile");
    }

    const fullName = String(formData.get("fullName") ?? "");
    const fullNameError = validateFullName(fullName);
    if (fullNameError) {
      return { error: fullNameError };
    }

    const displayName = fullName.trim() || null;
    await updateUserDisplayName(authState.profile.id, displayName);

    revalidatePath("/profile");
    revalidatePath("/account");
    revalidatePath("/", "layout");
    return { success: "Profile updated" };
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return { error: "Auth is not configured" };
    }
    return { error: "Could not update profile" };
  }
}
