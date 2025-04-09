import { Schema, model, Document, Types } from "mongoose";

export interface IRecipe extends Document {
  userId: Types.ObjectId;
  title: string;
  image?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  tags: string[];
  ingredients: string[];
  instructions: string;
  dietaryInfo: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
  };
  suitableFor: string[];
}

const recipeSchema = new Schema<IRecipe>({
  userId: { type: Schema.Types.ObjectId },
  title: { type: String, required: true },
  image: { type: String },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  prepTime: { type: Number, required: true },
  tags: [{ type: String }],
  ingredients: [{ type: String }],
  instructions: { type: String, required: true },
  dietaryInfo: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false },
  },
  suitableFor: [{ type: String }],
});

export default model<IRecipe>("Recipe", recipeSchema);