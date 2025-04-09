import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { Types } from "mongoose"
// import { Hydration } from "@/models/Hydration"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const dateParam = searchParams.get("date")
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Parse the requested date or use today
    const requestedDate = dateParam ? new Date(dateParam) : new Date()
    requestedDate.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(requestedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get data for the specific day
    const dayData = await db.collection("hydrations").findOne({
      userId: new Types.ObjectId(userId),
      date: { $gte: requestedDate, $lte: endOfDay }
    })

    // Get weekly data (last 7 days including today)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)

    const weeklyData = await db.collection("hydrations")
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: weekStart }
      })
      .sort({ date: 1 })
      .toArray()

    return NextResponse.json({
      today: dayData || { 
        waterConsumed: 0, 
        waterGoal: 2500,
        date: requestedDate.toISOString()
      },
      weekly: weeklyData
    })

  } catch (error) {
    console.error("Error fetching hydration data:", error)
    return NextResponse.json(
      { error: "Failed to fetch hydration data" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId, waterConsumed, waterGoal, date } = await request.json()

    if (!userId || waterConsumed === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // Parse the date or use today
    const entryDate = date ? new Date(date) : new Date()
    entryDate.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(entryDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Create or update the record
    const result = await db.collection("hydrations").updateOne(
      {
        userId: new Types.ObjectId(userId),
        date: { $gte: entryDate, $lte: endOfDay }
      },
      {
        $set: {
          waterConsumed,
          waterGoal: waterGoal || 2500,
          date: entryDate
        },
        $setOnInsert: {
          userId: new Types.ObjectId(userId)
        }
      },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0,
      created: result.upsertedCount > 0,
      date: entryDate.toISOString()
    })

  } catch (error) {
    console.error("Error updating hydration data:", error)
    return NextResponse.json(
      { error: "Failed to update hydration data" },
      { status: 500 }
    )
  }
}