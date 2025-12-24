import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

await connect();

export async function POST(request: NextRequest) {
  try {
    // 1) Parse body
    const reqBody = await request.json();
    console.log("REGISTER: incoming body:", reqBody);

    const { username, email, password } = reqBody;
    console.log("REGISTER: parsed fields:", {
      username,
      emailPresent: !!email,
      passwordPresent: !!password,
    });

    if (!username || !email || !password) {
      console.log("REGISTER: missing required fields");
      return NextResponse.json(
        { message: "Username, email and password are required" },
        { status: 400 }
      );
    }

    // 2) Check existing user
    const existingUser = await User.findOne({ email });
    console.log(
      "REGISTER: existingUser:",
      existingUser ? existingUser._id : "none"
    );

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // 3) Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log("REGISTER: password hashed");

    // 4) Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("REGISTER: user saved:", newUser._id);

    // 5) Send verification email
    await sendEmail({
      email: newUser.email,
      emailType: "VERIFY",
      userId: newUser._id,
    });
    console.log("REGISTER: verification email sent");

    // 6) Response
    return NextResponse.json(
      {
        message: "User registered successfully",
      },
      { status: 200}
    );
  } catch (error: any) {
    console.error("REGISTER: ERROR CAUGHT:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: String(error?.message || error),
      },
      { status: 500 }
    );
  }
}
