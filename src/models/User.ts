import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:{ type: String, required: true, minlength: 6 },
  avatar:  { type: String, default: null },
  createdAt:{ type: Date, default: Date.now },
});

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default model<IUser>('User', userSchema);
