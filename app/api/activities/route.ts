import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const client = await clientPromise
    const db = client.db() // your database name

    // Add user ID and timestamp to the activity data
    const activityData = {
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
    }

    const result = await db.collection("activities").insertOne(activityData)
    
    return NextResponse.json({ 
      success: true, 
      activity: { ...activityData, _id: result.insertedId } 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db() // your database name

    // Get activities for the current user
    const activities = await db
      .collection("activities")
      .find({ userId: session.user.id })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}