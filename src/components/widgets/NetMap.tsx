import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Checkin } from '@/lib/types'
import { useEffect, useState } from 'react'

// Fix for default marker icons in Leaflet with Vite/React
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
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

    // Character codes
    const A = 'A'.charCodeAt(0)
    const ZERO = '0'.charCodeAt(0)

    // Fields (0-17)
    let lon = (locator.charCodeAt(0) - A) * 20 - 180
    let lat = (locator.charCodeAt(1) - A) * 10 - 90

    // Squares (0-9)
    lon += (locator.charCodeAt(2) - ZERO) * 2
    lat += (locator.charCodeAt(3) - ZERO) * 1

    // Subsquares (0-23) - if 6 chars
    if (locator.length >= 6) {
        lon += (locator.charCodeAt(4) - A) * (2 / 24) + (1 / 24)
        lat += (locator.charCodeAt(5) - A) * (1 / 24) + (0.5 / 24)
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

export default function NetMap({ checkins, className = "h-[400px] w-full rounded-xl overflow-hidden" }: NetMapProps) {
    const [markers, setMarkers] = useState<StationMarker[]>([])

    useEffect(() => {
        const newMarkers: StationMarker[] = checkins
            .map(c => {
                if (!c.grid_locator) return null
                const coords = locatorToLatLng(c.grid_locator)
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

    // Default center (Malaysia as it's for 9M2PJU, but we can auto-center)
    const center: [number, number] = markers.length > 0
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
