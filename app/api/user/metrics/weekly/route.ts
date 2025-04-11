import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface WeeklyMetric {
  _id?: ObjectId;
  userId: ObjectId;
  weekStartDate: Date;
  averageCalories: number;
  averageWater: number;
  averageActivity: number;
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
    const userId = new ObjectId(session.user.id);

    const weeklyMetrics = await db.collection<WeeklyMetric>("weeklymetrics")
      .find({ userId })
      .sort({ weekStartDate: -1 })
      .toArray();

    return NextResponse.json(weeklyMetrics);
  } catch (error) {
    console.error("Error fetching weekly metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly metrics" },
      { status: 500 }
    );
  }
}