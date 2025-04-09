import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

