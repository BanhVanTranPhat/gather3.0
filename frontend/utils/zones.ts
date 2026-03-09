export type ZoneType = 'team' | 'meeting' | 'focus' | 'github' | 'common'

export interface ZoneBounds {
    x1: number
    y1: number
    x2: number
    y2: number
}

export interface Zone {
    id: string
    name: string
    type: ZoneType
    bounds: ZoneBounds
    color: string
    icon: string
    description: string
    enterTile: { x: number; y: number }
    callEnabled?: boolean
}

export interface DoorMarker {
    x: number
    y: number
    direction: 'horizontal' | 'vertical'
    connectsZones: [string, string]
}

export const OVERVIEW_ZOOM_THRESHOLD = 0.6

export const officeZones: Zone[] = [
    {
        id: 'lobby',
        name: 'Main Lobby',
        type: 'common',
        bounds: { x1: 17, y1: 10, x2: 33, y2: 22 },
        color: '#6366f1',
        icon: '🏢',
        description: 'Central gathering area & social hub',
        enterTile: { x: 24, y: 16 },
        callEnabled: true,
    },
    {
        id: 'team-alpha',
        name: 'Team Alpha',
        type: 'team',
        bounds: { x1: 2, y1: 10, x2: 16, y2: 22 },
        color: '#3b82f6',
        icon: '👥',
        description: 'Collaborative team workspace',
        enterTile: { x: 9, y: 16 },
        callEnabled: true,
    },
    {
        id: 'team-beta',
        name: 'Team Beta',
        type: 'team',
        bounds: { x1: 34, y1: 10, x2: 47, y2: 22 },
        color: '#8b5cf6',
        icon: '👥',
        description: 'Collaborative team workspace',
        enterTile: { x: 40, y: 16 },
        callEnabled: true,
    },
    {
        id: 'meeting',
        name: 'Meeting Room',
        type: 'meeting',
        bounds: { x1: 2, y1: 24, x2: 17, y2: 37 },
        color: '#ec4899',
        icon: '📋',
        description: 'Private meeting & conference room',
        enterTile: { x: 9, y: 30 },
        callEnabled: true,
    },
    {
        id: 'courtyard',
        name: 'Courtyard',
        type: 'common',
        bounds: { x1: 18, y1: 24, x2: 33, y2: 37 },
        color: '#22c55e',
        icon: '🌿',
        description: 'Outdoor garden & break area',
        enterTile: { x: 25, y: 30 },
    },
    {
        id: 'focus',
        name: 'Focus Room',
        type: 'focus',
        bounds: { x1: 34, y1: 24, x2: 47, y2: 30 },
        color: '#f59e0b',
        icon: '🎧',
        description: 'Deep work zone with ambient music',
        enterTile: { x: 40, y: 27 },
    },
    {
        id: 'github',
        name: 'GitHub Hub',
        type: 'github',
        bounds: { x1: 34, y1: 31, x2: 47, y2: 37 },
        color: '#10b981',
        icon: '💻',
        description: 'Code collaboration & GitHub activity',
        enterTile: { x: 40, y: 34 },
    },
]

export const officeDoors: DoorMarker[] = [
    { x: 17, y: 16, direction: 'vertical', connectsZones: ['team-alpha', 'lobby'] },
    { x: 33, y: 16, direction: 'vertical', connectsZones: ['lobby', 'team-beta'] },
    { x: 9, y: 23, direction: 'horizontal', connectsZones: ['team-alpha', 'meeting'] },
    { x: 24, y: 23, direction: 'horizontal', connectsZones: ['lobby', 'courtyard'] },
    { x: 40, y: 23, direction: 'horizontal', connectsZones: ['team-beta', 'focus'] },
    { x: 17, y: 30, direction: 'vertical', connectsZones: ['meeting', 'courtyard'] },
    { x: 40, y: 30, direction: 'horizontal', connectsZones: ['focus', 'github'] },
]

export function getZoneAt(x: number, y: number, zones: Zone[]): Zone | null {
    for (const zone of zones) {
        const b = zone.bounds
        if (x >= b.x1 && x <= b.x2 && y >= b.y1 && y <= b.y2) {
            return zone
        }
    }
    return null
}

export function getZoneCenter(zone: Zone): { x: number; y: number } {
    return {
        x: Math.floor((zone.bounds.x1 + zone.bounds.x2) / 2),
        y: Math.floor((zone.bounds.y1 + zone.bounds.y2) / 2),
    }
}
