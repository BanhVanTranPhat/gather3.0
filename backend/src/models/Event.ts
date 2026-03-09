import mongoose, { Document, Schema } from 'mongoose'

export interface IEventAttendee {
  userId: string
  username: string
  status: 'going' | 'maybe' | 'not_going'
}

export interface IEvent extends Document {
  eventId: string
  realmId: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  createdBy: string
  createdByName: string
  attendees: IEventAttendee[]
  location: string
  maxParticipants?: number
  createdAt?: Date
  updatedAt?: Date
}

const eventSchema = new Schema<IEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    realmId: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true, validate: { validator(this: any, v: Date) { return v > this.startTime }, message: 'endTime must be after startTime' } },
    createdBy: { type: String, required: true },
    createdByName: { type: String, default: '', maxlength: 100 },
    attendees: {
      type: [{
        userId: String,
        username: { type: String, maxlength: 100 },
        status: { type: String, enum: ['going', 'maybe', 'not_going'], default: 'maybe' },
      }],
      validate: [(v: any[]) => v.length <= 200, 'Maximum 200 attendees'],
    },
    location: { type: String, default: '', maxlength: 300 },
    maxParticipants: { type: Number, min: 1 },
  },
  { timestamps: true }
)

eventSchema.index({ realmId: 1, startTime: 1 })
eventSchema.index({ createdBy: 1 })

export default mongoose.model<IEvent>('Event', eventSchema)
