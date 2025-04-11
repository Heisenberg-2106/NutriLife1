import { Schema, model, Document, Types } from "mongoose";

export interface IDailyMetric extends Document {
  userId: Types.ObjectId;
  date: Date;
  calories: number;
  water: number; // in ml
  activity: number; // in minutes
  weight: number; // in kg
}

const dailyMetricSchema = new Schema<IDailyMetric>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true, default: Date.now },
  calories: { type: Number, required: true },
  water: { type: Number, required: true },
  activity: { type: Number, required: true },
  weight: { type: Number, required: true },
});

export default model<IDailyMetric>("DailyMetric", dailyMetricSchema);