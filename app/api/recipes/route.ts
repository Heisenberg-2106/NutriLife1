import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface Recipe {
  _id: ObjectId
  name: string
  description?: string
  calories: number
  protein: number
  carbs: number
  fats: number
  isVegetarian: boolean
  ingredients?: string[]
  tags?: string[]
  prepTime?: number
  createdAt?: Date
  updatedAt?: Date
}

export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Fetch all recipes without any filters or limits
    const recipes = await db.collection<Recipe>("recipes").find().toArray()

    // Convert ObjectId to string for client-side and ensure tags exists
    const serializedRecipes = recipes.map(recipe => ({
      ...recipe,
      _id: recipe._id.toString(),
      createdAt: recipe.createdAt?.toISOString(),
      updatedAt: recipe.updatedAt?.toISOString(),
      tags: recipe.tags || [] // Ensure tags exists
    }))

    return NextResponse.json(serializedRecipes)

  } catch (error) {
    console.error("Error fetching recipes:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    )
  }
}