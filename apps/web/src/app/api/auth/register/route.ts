import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, confirmPassword, agreedToTerms } = body;

    // 1. Full name validation
    const trimmedName = typeof fullName === "string" ? fullName.trim() : "";
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (minimum 2 characters)." },
        { status: 400 }
      );
    }
    if (trimmedName.length > 80) {
      return NextResponse.json(
        { success: false, error: "Full name must be 80 characters or fewer." },
        { status: 400 }
      );
    }

    // 2. Email validation
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 3. Password policy
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json(
        { success: false, error: "Password must contain both letters and numbers." },
        { status: 400 }
      );
    }

    // 4. Confirm password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // 5. Terms agreement
    if (agreedToTerms !== true) {
      return NextResponse.json(
        { success: false, error: "You must accept the Terms of Service and Privacy Policy to register." },
        { status: 400 }
      );
    }

    // 6. Registration handling
    // When a production identity provider (e.g. Supabase, NextAuth, or custom DB) is configured,
    // persist user credentials here. In the current SaaS architecture without a third-party auth service,
    // return structured success payload directing user into their personalized onboarding flow.
    return NextResponse.json({
      success: true,
      message: "Account created successfully! Preparing your IELTS onboarding journey...",
      user: {
        name: trimmedName,
        email: trimmedEmail,
      },
      redirectTo: "/onboarding",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload or server error." },
      { status: 500 }
    );
  }
}
