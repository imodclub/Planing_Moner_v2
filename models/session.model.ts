// models/session.model.ts
import mongoose, { Document, Schema } from 'mongoose';

interface ISession extends Document {
  sessionId: string;
  data: Record<string, any>;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' }, // Session จะหมดอายุหลังจาก 7 วัน
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;