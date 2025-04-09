import { Schema, model, Document, Types } from "mongoose";

export interface IWeeklyMetric extends Document {
  userId: Types.ObjectId;
  weekStartDate: Date;
  averageCalories: number;
  averageWater: number;
  averageActivity: number;
}

const weeklyMetricSchema = new Schema<IWeeklyMetric>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  weekStartDate: { type: Date, required: true },
  averageCalories: { type: Number, required: true },
  averageWater: { type: Number, required: true },
  averageActivity: { type: Number, required: true },
});

export default model<IWeeklyMetric>("WeeklyMetric", weeklyMetricSchema);