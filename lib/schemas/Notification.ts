import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  dailyReminders: boolean;
  weeklyReports: boolean;
  achievementAlerts: boolean;
  hydrationReminders: boolean;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dailyReminders: { type: Boolean, default: true },
  weeklyReports: { type: Boolean, default: true },
  achievementAlerts: { type: Boolean, default: true },
  hydrationReminders: { type: Boolean, default: false },
});

export default model<INotification>("Notification", notificationSchema);