import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  displayName?: string
  createdAt?: Date
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model<IUser>('User', userSchema)

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10)
}

export async function comparePassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash)
}
