// Database types for Supabase
export interface Profile {
    id: string
    callsign: string
    name: string | null
    created_at: string
}

export interface Net {
    id: string
    user_id: string
    name: string
    type: 'weekly' | 'emergency_exercise' | 'special'
    frequency: string | null
    mode: string | null
    started_at: string
    ended_at: string | null
    notes: string | null
    created_at: string
}

export interface Checkin {
    id: string
    net_id: string
    callsign: string
    name: string | null
    location: string | null
    signal_report: string | null
    readability: number | null
    signal_strength: number | null
    remarks: string | null
    traffic: boolean
    traffic_precedence: 'routine' | 'welfare' | 'priority' | 'emergency' | null
    traffic_details: string | null
    checked_in_at: string
}

// Extended types with relations
export interface NetWithCheckins extends Net {
    checkins: Checkin[]
    profile?: Profile
}

export interface NetStats {
    total_checkins: number
    unique_callsigns: number
    duration_minutes: number | null
    traffic_count: number
}
