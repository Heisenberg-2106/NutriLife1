import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface MealLog {
  _id?: ObjectId
  userId: ObjectId
  breakfast: string | null
  lunch: string | null
  dinner: string | null
  snack: string | null
  date: string
  createdAt?: Date
  updatedAt?: Date
}

export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()
    
    // In a real app, you would filter by user ID
    const logs = await db.collection<MealLog>("meal-logs")
      .find()
      .sort({ date: -1 })
      .limit(30)
      .toArray()

    return NextResponse.json(logs)

  } catch (error) {
    console.error("Error fetching meal logs:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching meal logs" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()
    const body = await request.json()

    const newLog = {
      userId: new ObjectId(), // In a real app, use the actual user ID
      breakfast: body.breakfast,
      lunch: body.lunch,
      dinner: body.dinner,
      snack: body.snack,
      date: body.date || new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection<MealLog>("meal-logs").insertOne(newLog)

    return NextResponse.json({
      _id: result.insertedId,
      ...newLog
    })

  } catch (error) {
    console.error("Error creating meal log:", error)
    return NextResponse.json(
      { error: "An error occurred while creating meal log" },
      { status: 500 }
    )
  }
}