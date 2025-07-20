import { Document, Schema, model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  color?: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name:      { type: String, required: true, unique: true, trim: true },
  color:     { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default model<ICategory>('Category', categorySchema);
