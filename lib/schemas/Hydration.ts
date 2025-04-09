import { Schema, model, Document, Types } from "mongoose";

export interface IHydration extends Document {
  userId: Types.ObjectId;
  date: Date;
  waterConsumed: number;
  waterGoal: number;
}

const hydrationSchema = new Schema<IHydration>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  waterConsumed: { type: Number, required: true },
  waterGoal: { type: Number, required: true },
});

export default model<IHydration>("Hydration", hydrationSchema);