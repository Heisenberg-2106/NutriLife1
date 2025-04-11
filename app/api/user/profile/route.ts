import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

interface UserProfile {
  _id: ObjectId
  email: string
  name?: string
  height?: number
  weight?: number
  age?: number
  gender?: string
  createdAt?: Date
  updatedAt?: Date
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(session.user.id)

    const user = await db.collection<UserProfile>("users").findOne(
      { _id: userId },
      {
        projection: {
          email: 1,
          name: 1,
          height: 1,
          weight: 1,
          age: 1,
          gender: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      profile: {
        ...user,
        _id: user._id.toString(),
        email: session.user.email || user.email,
        name: session.user.name || user.name
      }
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(session.user.id)

    const updateData = {
      height: data.height,
      weight: data.weight,
      age: data.age,
      gender: data.gender,
      updatedAt: new Date()
    }

    const result = await db.collection<UserProfile>("users").updateOne(
      { _id: userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile data" },
      { status: 500 }
    )
  }
}