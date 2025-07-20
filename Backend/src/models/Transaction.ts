import { Document, Schema, model } from 'mongoose';

export interface ITransaction extends Document {
  title:       string;
  user:        Schema.Types.ObjectId;
  type:        'income' | 'expense';
  category:    string;
  amount:      number;
  description: string;
  date:        Date;
  recurring:   boolean;
  recurringType: 'monthly' | 'weekly' | 'yearly' | null;
  tags:        string[];
  createdAt:   Date;
}

const transactionSchema = new Schema<ITransaction>({
  description:        { type: String, required: true },
  user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:          { type: String, enum: ['income','expense'], required: true },
  category:      { type: String, required: true },
  amount:        { type: Number, required: true },
  date:          { type: Date, required: true },
  recurring:     { type: Boolean, default: false },
  recurringType: { type: String, enum: ['monthly','weekly','yearly'], default: null },
  tags:          [{ type: String }],
  createdAt:     { type: Date, default: Date.now },
});

export default model<ITransaction>('Transaction', transactionSchema);
