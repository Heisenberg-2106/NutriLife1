import { Schema, model, Document, Types } from "mongoose";

export interface IGoal extends Document {
  userId: Types.ObjectId;
  calorieGoal: number;
  waterGoal: number;
  weightGoal: number;
  activityGoal: number;
}

const goalSchema = new Schema<IGoal>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  calorieGoal: { type: Number, required: true },
  waterGoal: { type: Number, required: true },
  weightGoal: { type: Number, required: true },
  activityGoal: { type: Number, required: true },
});

export default model<IGoal>("Goal", goalSchema);