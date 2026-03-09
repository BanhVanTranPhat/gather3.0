import { z } from 'zod'
import { Session } from '../session'

export const JoinRealm = z.object({
    realmId: z.string(),
    shareId: z.string(),
})

export const Disconnect = z.any()

export const MovePlayer = z.object({
    x: z.number(),
    y: z.number(),
})

export const Teleport = z.object({
    x: z.number(),
    y: z.number(),
    roomIndex: z.number(),
})

export const ChangedSkin = z.string()

export const NewMessage = z.string()

export const MediaState = z.object({
    micOn: z.boolean(),
    camOn: z.boolean(),
})

export const CallRequest = z.object({
    targetUid: z.string(),
})

export const CallResponse = z.object({
    callerUid: z.string(),
    accept: z.boolean(),
})

export type OnEventCallback = (args: { session: Session, data?: any }) => void