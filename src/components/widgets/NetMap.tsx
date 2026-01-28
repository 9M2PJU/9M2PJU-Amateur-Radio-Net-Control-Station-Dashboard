'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
// import 'leaflet/dist/leaflet.css' // Moved to globals.css
import { Checkin } from '@/lib/types'
import { useEffect, useState } from 'react'
// Fix: Dynamic import of leaflet assets for Next.js is tricky.
// Usually we can just use the URLs directly or rely on the CSS.
// But standard marker icons might be broken without setting specific paths.
// We will try without manual icon override first, or use a CDN fallback if issues.
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface NetMapProps {
    checkins: Checkin[]
    className?: string
}

interface StationMarker {
    callsign: string
    lat: number
    lon: number
    name: string | null
}

// Character codes constants
const CHAR_A = 'A'.charCodeAt(0)
const CHAR_ZERO = '0'.charCodeAt(0)

/**
 * Converts a Maidenhead Grid Locator (4 or 6 chars) to Latitude and Longitude
 */
function locatorToLatLng(locator: string): [number, number] | null {
    if (!locator || locator.length < 4) return null

    // Regex to validate Maidenhead Grid Locator format (2 letters, 2 digits, optionally 2 letters)
    const gridRegex = /^[A-R]{2}[0-9]{2}([A-X]{2})?$/i
    if (!gridRegex.test(locator)) {
        console.warn(`Invalid grid locator format: ${locator}`)
        return null
    }

    locator = locator.toUpperCase()

    // Fields (0-17)
    let lon = (locator.charCodeAt(0) - CHAR_A) * 20 - 180
    let lat = (locator.charCodeAt(1) - CHAR_A) * 10 - 90

    // Squares (0-9)
    lon += (locator.charCodeAt(2) - CHAR_ZERO) * 2
    lat += (locator.charCodeAt(3) - CHAR_ZERO) * 1

    // Subsquares (0-23) - if 6 chars
    if (locator.length >= 6) {
        lon += (locator.charCodeAt(4) - CHAR_A) * (2 / 24) + (1 / 24)
        lat += (locator.charCodeAt(5) - CHAR_A) * (1 / 24) + (0.5 / 24)
    } else {
        // Center of square if only 4 chars
        lon += 1
        lat += 0.5
    }

    // Safety clamp (Leaflet crashes on invalid LatLng)
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        console.warn(`Calculated coordinates out of bounds: ${lat}, ${lon} for locator ${locator}`)
        return null
    }

    return [lat, lon]
}

/**
 * Gets coordinates for a callsign based on prefix (fallback when grid is missing)
 */
function getCoordsByCallsign(callsign: string): [number, number] | null {
    if (!callsign) return null
    const cs = callsign.toUpperCase()

    // West Malaysia (9M2, 9W2)
    if (cs.startsWith('9M2') || cs.startsWith('9W2')) return [3.1390, 101.6869] // Kuala Lumpur area

    // Sabah (9M6, 9W6)
    if (cs.startsWith('9M6') || cs.startsWith('9W6')) return [5.9804, 116.0735] // Kota Kinabalu

    // Sarawak (9M8, 9W8)
    if (cs.startsWith('9M8') || cs.startsWith('9W8')) return [1.5533, 110.3592] // Kuching

    // Default to Center of Malaysia
    if (cs.startsWith('9M') || cs.startsWith('9W')) return [4.2105, 101.9758]

    return null
}

export default function NetMap({ checkins, className = "h-[400px] w-full rounded-xl overflow-hidden" }: NetMapProps) {
    const [markers, setMarkers] = useState<StationMarker[]>([])
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        if (!checkins || !Array.isArray(checkins)) return

        const newMarkers: StationMarker[] = checkins
            .map(c => {
                if (!c || !c.callsign) return null

                let coords: [number, number] | null = null

                if (c.grid_locator) {
                    coords = locatorToLatLng(c.grid_locator)
                }

                if (!coords) {
                    coords = getCoordsByCallsign(c.callsign)
                }

                if (!coords) return null

                return {
                    callsign: c.callsign,
                    lat: coords[0],
                    lon: coords[1],
                    name: c.name
                }
            })
            .filter((m): m is StationMarker => m !== null)

        setMarkers(newMarkers)
    }, [checkins])

    if (!isClient) {
        return <div className={`bg-slate-900 animate-pulse ${className}`} />
    }

    // Default center (Malaysia as it's for 9M2PJU, but we can auto-center)
    // Safety check for markers[0]
    const center: [number, number] = (markers.length > 0 && markers[0]?.lat && markers[0]?.lon)
        ? [markers[0].lat, markers[0].lon]
        : [4.2105, 101.9758] // Malaysia default

    return (
        <div className={className}>
            <MapContainer
                center={center}
                zoom={markers.length > 0 ? 6 : 4}
                className="h-full w-full"
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker, idx) => (
                    <Marker key={`${marker.callsign}-${idx}`} position={[marker.lat, marker.lon]}>
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-lg mb-0">{marker.callsign}</p>
                                {marker.name && <p className="text-sm text-slate-600 mb-1">{marker.name}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
