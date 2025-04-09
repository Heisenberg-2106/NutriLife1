import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7")

    const client = await clientPromise
    const db = client.db()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get logs for the user within the date range
    const logs = await db
      .collection("logs")
      .find({
        userId: new ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    // Validate required fields
    if (!data.type || !data.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Create log entry
    const result = await db.collection("logs").insertOne({
      userId: new ObjectId(userId),
      ...data,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      logId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating log:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

