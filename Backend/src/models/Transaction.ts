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
  paymentMethod?: 'pix' | 'credito' | 'debito' | 'alelo' | '';
  // NOVOS CAMPOS PARA PARCELAMENTO
  installmentCount?: number; // Qual o número desta parcela (ex: 1)
  installmentTotal?: number; // Total de parcelas (ex: 12)
}

const transactionSchema = new Schema<ITransaction>({
  description:        { type: String },
  user:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:          { type: String, enum: ['income','expense'], required: true },
  category:      { type: String, required: true },
  amount:        { type: Number, required: true },
  date:          { type: Date, required: true },
  recurring:     { type: Boolean, default: false },
  recurringType: { type: String, enum: ['monthly','weekly','yearly'], default: null },
  tags:          [{ type: String }],
  createdAt:     { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['pix', 'credito', 'debito', 'alelo', ''], default: ''},
  
  // Novos campos opcionais no banco
  installmentCount: { type: Number },
  installmentTotal: { type: Number },
});

export default model<ITransaction>('Transaction', transactionSchema);