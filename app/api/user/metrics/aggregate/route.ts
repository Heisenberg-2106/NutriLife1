import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface DailyMetric {
  userId: ObjectId;
  date: Date;
  calories: number;
  water: number;
  activity: number;
  weight: number;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month";

    // Calculate date range
    const now = Date.now();
    const rangeMap: Record<string, number> = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };

    const dateFilter = range in rangeMap 
      ? { $gte: new Date(now - rangeMap[range]) } 
      : {};

    // Perform aggregation
    const aggregates = await db.collection<DailyMetric>("dailymetrics").aggregate([
      {
        $match: {
          userId: new ObjectId(session.user.id),
          date: dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          avgCalories: { $avg: "$calories" },
          avgWater: { $avg: "$water" },
          avgActivity: { $avg: "$activity" },
          avgWeight: { $avg: "$weight" },
          minWeight: { $min: "$weight" },
          maxWeight: { $max: "$weight" },
          totalDays: { $sum: 1 },
        },
      },
    ]).toArray();

    // Format results
    const result = aggregates[0] || {
      avgCalories: null,
      avgWater: null,
      avgActivity: null,
      avgWeight: null,
      minWeight: null,
      maxWeight: null,
      totalDays: 0
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching aggregated metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch aggregated metrics" },
      { status: 500 }
    );
  }
}