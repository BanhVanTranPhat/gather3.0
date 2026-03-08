import mongoose, { Document, Schema } from 'mongoose'

export interface IProfile extends Document {
  id: string
  skin?: string
  visited_realms?: string[]
  updatedAt?: Date
}

const profileSchema = new Schema<IProfile>(
  {
    id: { type: String, required: true, unique: true },
    skin: { type: String },
    visited_realms: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model<IProfile>('Profile', profileSchema)
