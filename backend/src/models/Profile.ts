import mongoose, { Document, Schema } from 'mongoose'

export interface IProfile extends Document {
  id: string
  skin?: string
  avatar?: string
  avatarConfig?: Record<string, string>
  displayName?: string
  visited_realms?: string[]
  updatedAt?: Date
}

const profileSchema = new Schema<IProfile>(
  {
    id: { type: String, required: true, unique: true },
    skin: { type: String },
    avatar: { type: String },
    avatarConfig: { type: Schema.Types.Mixed },
    displayName: { type: String },
    visited_realms: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model<IProfile>('Profile', profileSchema)
