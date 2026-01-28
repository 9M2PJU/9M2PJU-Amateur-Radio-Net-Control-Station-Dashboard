/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf'
    export default function autoTable(doc: any, options: any): void;
}
