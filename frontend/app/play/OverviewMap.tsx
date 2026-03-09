'use client'

import React, { useEffect, useState, useCallback } from 'react'
import signal from '@/utils/signal'
import { officeZones, officeDoors, Zone, OVERVIEW_ZOOM_THRESHOLD } from '@/utils/zones'
import ZonePopup from './ZonePopup'

type ZoomData = {
    zoom: number
    isOverview: boolean
    minX: number
    maxX: number
    minY: number
    maxY: number
    playerX: number
    playerY: number
}

const OverviewMap: React.FC = () => {
    const [visible, setVisible] = useState(false)
    const [zoomData, setZoomData] = useState<ZoomData | null>(null)
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
    const [opacity, setOpacity] = useState(0)

    useEffect(() => {
        const onZoomChanged = (data: ZoomData) => {
            setZoomData(data)
            if (data.isOverview) {
                setVisible(true)
                const t = 1 - (data.zoom - 0.3) / (OVERVIEW_ZOOM_THRESHOLD - 0.3)
                setOpacity(Math.min(1, Math.max(0, t)))
            } else {
                setOpacity(0)
                setTimeout(() => setVisible(false), 200)
            }
        }
        signal.on('zoomChanged', onZoomChanged)
        return () => signal.off('zoomChanged', onZoomChanged)
    }, [])

    const handleZoneClick = useCallback((zone: Zone) => {
        setSelectedZone(zone)
    }, [])

    const handleGoTo = useCallback((zone: Zone) => {
        signal.emit('navigateToTile', zone.enterTile)
        setSelectedZone(null)
        setVisible(false)
        setOpacity(0)
    }, [])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey) {
            const pinchDelta = -e.deltaY * 0.01
            signal.emit('mapZoomDelta', pinchDelta)
        } else {
            const delta = e.deltaY > 0 ? -0.25 : 0.25
            signal.emit('mapZoomDelta', delta)
        }
    }, [])

    if (!visible || !zoomData) return null

    const mapW = (zoomData.maxX - zoomData.minX + 1)
    const mapH = (zoomData.maxY - zoomData.minY + 1)

    return (
        <div
            className="absolute inset-0 z-20 transition-opacity duration-200"
            style={{ opacity, pointerEvents: opacity > 0.3 ? 'auto' : 'none' }}
            onWheel={handleWheel}
        >
            <div className="w-full h-full bg-[#1a1d2e]/85 backdrop-blur-sm flex items-center justify-center">
                <div className="relative" style={{ width: '85%', maxWidth: 900, aspectRatio: `${mapW} / ${mapH}` }}>
                    {officeZones.map((zone) => {
                        const left = ((zone.bounds.x1 - zoomData.minX) / mapW) * 100
                        const top = ((zone.bounds.y1 - zoomData.minY) / mapH) * 100
                        const width = ((zone.bounds.x2 - zone.bounds.x1 + 1) / mapW) * 100
                        const height = ((zone.bounds.y2 - zone.bounds.y1 + 1) / mapH) * 100

                        const isSelected = selectedZone?.id === zone.id
                        const isPlayerHere = zoomData.playerX >= zone.bounds.x1 &&
                            zoomData.playerX <= zone.bounds.x2 &&
                            zoomData.playerY >= zone.bounds.y1 &&
                            zoomData.playerY <= zone.bounds.y2

                        return (
                            <button
                                key={zone.id}
                                className="absolute rounded-lg border-2 transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center gap-1 hover:scale-[1.02] hover:z-10"
                                style={{
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${width}%`,
                                    height: `${height}%`,
                                    backgroundColor: zone.color + '30',
                                    borderColor: isSelected ? '#fff' : zone.color + '80',
                                    boxShadow: isSelected
                                        ? `0 0 20px ${zone.color}60, inset 0 0 20px ${zone.color}20`
                                        : isPlayerHere
                                            ? `inset 0 0 15px ${zone.color}30`
                                            : 'none',
                                }}
                                onClick={() => handleZoneClick(zone)}
                            >
                                <span className="text-xl md:text-2xl drop-shadow-lg">{zone.icon}</span>
                                <span
                                    className="text-[10px] md:text-xs font-bold tracking-wide text-white drop-shadow-lg"
                                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}
                                >
                                    {zone.name}
                                </span>
                                {isPlayerHere && (
                                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
                                )}

                                <div
                                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                    style={{ background: `linear-gradient(135deg, ${zone.color}15, ${zone.color}25)` }}
                                />
                            </button>
                        )
                    })}

                    {officeDoors.map((door, i) => {
                        const cx = ((door.x - zoomData.minX + 0.5) / mapW) * 100
                        const cy = ((door.y - zoomData.minY + 0.5) / mapH) * 100
                        const isVert = door.direction === 'vertical'

                        return (
                            <div
                                key={i}
                                className="absolute z-10 flex items-center justify-center"
                                style={{
                                    left: `${cx}%`,
                                    top: `${cy}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div
                                    className="bg-amber-400/90 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse"
                                    style={{
                                        width: isVert ? 4 : 16,
                                        height: isVert ? 16 : 4,
                                    }}
                                />
                            </div>
                        )
                    })}

                    {zoomData.playerX >= zoomData.minX && zoomData.playerY >= zoomData.minY && (
                        <div
                            className="absolute z-20 w-3 h-3 rounded-full bg-green-400 border-2 border-white shadow-[0_0_10px_#4ade80] animate-bounce"
                            style={{
                                left: `${((zoomData.playerX - zoomData.minX + 0.5) / mapW) * 100}%`,
                                top: `${((zoomData.playerY - zoomData.minY + 0.5) / mapH) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    )}
                </div>
            </div>

            {selectedZone && (
                <ZonePopup
                    zone={selectedZone}
                    onClose={() => setSelectedZone(null)}
                    onGoTo={handleGoTo}
                />
            )}
        </div>
    )
}

export default OverviewMap
