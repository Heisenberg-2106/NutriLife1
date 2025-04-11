import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";
import { startOfWeek, endOfWeek } from "date-fns";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const { date, calories, water, activity, weight } = await req.json();

    // Store daily metric
    const newMetric = await db.collection("dailymetrics").insertOne({
      userId: new Types.ObjectId(session.user.id),
      date: date || new Date(),
      calories,
      water,
      activity,
      weight,
      createdAt: new Date(),
    });

    // Check if we need to update weekly metrics (run every Sunday)
    const today = new Date();
    if (today.getDay() === 0) { // Sunday
      await updateWeeklyMetrics(session.user.id, db);
    }

    return NextResponse.json(newMetric);
  } catch (error) {
    console.error("Error storing daily metrics:", error);
    return NextResponse.json(
      { error: "Failed to store daily metrics" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "week";
    const limit = parseInt(searchParams.get("limit") || "7");

    let metrics;
    if (range === "week") {
      metrics = await db.collection("dailymetrics").find({
        userId: new Types.ObjectId(session.user.id),
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }).sort({ date: -1 }).toArray();
    } else {
      metrics = await db.collection("dailymetrics").find({ 
        userId: new Types.ObjectId(session.user.id) 
      })
      .sort({ date: -1 })
      .limit(limit)
      .toArray();
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching daily metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily metrics" },
      { status: 500 }
    );
  }
}

async function updateWeeklyMetrics(userId: string, db: any) {
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());

  const weeklyData = await db.collection("dailymetrics").aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        date: { $gte: weekStart, $lte: weekEnd },
      },
    },
    {
      $group: {
        _id: null,
        averageCalories: { $avg: "$calories" },
        averageWater: { $avg: "$water" },
        averageActivity: { $avg: "$activity" },
      },
    },
  ]).toArray();

  if (weeklyData.length > 0) {
    await db.collection("weeklymetrics").updateOne(
      { 
        userId: new Types.ObjectId(userId), 
        weekStartDate: weekStart 
      },
      {
        $set: {
          averageCalories: weeklyData[0].averageCalories,
          averageWater: weeklyData[0].averageWater,
          averageActivity: weeklyData[0].averageActivity,
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );
  }
}