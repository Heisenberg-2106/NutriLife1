import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
// import { Recipe } from "@/models/Recipe"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "User ID is required" },
    //     { status: 400 }
    //   )
    // }

    const client = await clientPromise
    const db = client.db()

    // Fetch all recipes (you might want to add pagination later)
    const recipes = await db.collection("recipes").find().toArray()

    return NextResponse.json(recipes)

  } catch (error) {
    console.error("Error fetching recipes:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    )
  }
}