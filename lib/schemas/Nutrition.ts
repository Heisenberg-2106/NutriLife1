import { Schema, model, Document, Types } from "mongoose";

export interface IMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export interface INutrition extends Document {
  userId: Types.ObjectId;
  date: Date;
  caloriesConsumed: number;
  caloriesGoal: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: IMeal[];
}

const nutritionSchema = new Schema<INutrition>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  caloriesConsumed: { type: Number, required: true },
  caloriesGoal: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  meals: [
    {
      name: { type: String, required: true },
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
      time: { type: String, required: true },
    },
  ],
});

export default model<INutrition>("Nutrition", nutritionSchema);