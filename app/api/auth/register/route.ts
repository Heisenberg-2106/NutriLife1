import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hash } from "bcrypt"

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const { name, email, password }: RegisterRequest = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Check existing user
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash and create user
    const hashedPassword = await hash(password, 10)
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      // createdAt and updatedAt will be auto-added by Mongoose
    })

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}