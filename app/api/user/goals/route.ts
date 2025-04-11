import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface GoalDocument {
  _id?: ObjectId;
  userId: ObjectId;
  calorieGoal: number;
  waterGoal: number;
  weightGoal: number;
  activityGoal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const goals = await db.collection<GoalDocument>("goals").findOne({ 
      userId: new ObjectId(session.user.id) 
    });

    // Return default goals if none exist
    if (!goals) {
      return NextResponse.json({
        calorieGoal: 2500,
        waterGoal: 2500,
        weightGoal: 68,
        activityGoal: 150,
      });
    }

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching user goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch user goals" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(session.user.id);
    const { calorieGoal, waterGoal, weightGoal, activityGoal } = await req.json();

    // Update or insert the goals
    const result = await db.collection<GoalDocument>("goals").updateOne(
      { userId },
      {
        $set: { 
          calorieGoal, 
          waterGoal, 
          weightGoal, 
          activityGoal,
          updatedAt: new Date() 
        },
        $setOnInsert: {
          userId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // Fetch the updated document to return
    const updatedGoals = await db.collection<GoalDocument>("goals").findOne({ userId });

    if (!updatedGoals) {
      // This should theoretically never happen after upsert
      return NextResponse.json({
        userId,
        calorieGoal,
        waterGoal,
        weightGoal,
        activityGoal,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json(updatedGoals);
  } catch (error) {
    console.error("Error updating user goals:", error);
    return NextResponse.json(
      { error: "Failed to update user goals" },
      { status: 500 }
    );
  }
}