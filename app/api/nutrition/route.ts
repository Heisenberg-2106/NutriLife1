import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    const client = await clientPromise;
    const db = client.db();

    const nutrition = await db.collection("nutrition").findOne({ userId, date });
    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, date, caloriesConsumed, caloriesGoal, protein, carbs, fat, meals } = await request.json();

    // Validate input
    if (!userId || !date || !caloriesConsumed || !caloriesGoal || !protein || !carbs || !fat || !meals) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Create nutrition log
    const result = await db.collection("nutrition").insertOne({
      userId,
      date,
      caloriesConsumed,
      caloriesGoal,
      protein,
      carbs,
      fat,
      meals,
    });

    return NextResponse.json({
      success: true,
      nutritionId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating nutrition log:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}