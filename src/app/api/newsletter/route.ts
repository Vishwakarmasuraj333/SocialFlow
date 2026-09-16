import { NextRequest, NextResponse } from "next/server";

// In-memory subscriber storage with deduplication (or can be connected to Prisma/Resend/Mailchimp)
const subscribers = new Set<string>();

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Please enter your email address." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid corporate or personal email address." },
        { status: 400 }
      );
    }

    // Check for disposable / obvious placeholder domains
    const domain = email.split("@")[1];
    if (domain === "test.com" || domain === "fake.com" || domain === "example.com") {
      return NextResponse.json(
        { success: false, error: "Please provide a real active email address." },
        { status: 400 }
      );
    }

    if (subscribers.has(email)) {
      return NextResponse.json(
        { success: true, message: "You are already subscribed to SocialFlow platform updates!" },
        { status: 200 }
      );
    }

    subscribers.add(email);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed! You will receive our monthly platform changelog and release notes.",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
