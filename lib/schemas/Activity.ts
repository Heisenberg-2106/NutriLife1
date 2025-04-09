import { Schema, model, Document, Types } from "mongoose";

export interface IActivity extends Document {
  userId: Types.ObjectId;
  date: Date;
  type: string;
  duration: number;
  caloriesBurnt: number;
}

const activitySchema = new Schema<IActivity>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  caloriesBurnt: { type: Number, required: true },
});

export default model<IActivity>("Activity", activitySchema);