import { format } from 'date-fns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import type { Net, Checkin } from './types'

// --- ADIF EXPORT ---
export const exportToADIF = (net: Net, checkins: Checkin[]) => {
    let adif = `9M2PJU NCS Dashboard Export\n`
    adif += `<ADIF_VER:5>3.1.4\n`
    adif += `<PROGRAMID:6>9M2PJU\n`
    adif += `<EOH>\n\n`

    checkins.forEach((c) => {
        const date = format(new Date(c.checked_in_at), 'yyyyMMdd')
        const time = format(new Date(c.checked_in_at), 'HHmmss')

        adif += `<CALL:${c.callsign.length}>${c.callsign} `
        adif += `<QSO_DATE:8>${date} `
        adif += `<TIME_ON:6>${time} `
        if (c.name) adif += `<NAME:${c.name.length}>${c.name} `
        if (c.location) adif += `<QTH:${c.location.length}>${c.location} `
        if (c.grid_locator) adif += `<GRIDSQUARE:${c.grid_locator.length}>${c.grid_locator} `
        if (c.signal_report) adif += `<RST_RCVD:${c.signal_report.length}>${c.signal_report} `
        if (c.remarks) adif += `<COMMENT:${c.remarks.length}>${c.remarks} `
        if (net.frequency) adif += `<FREQ:${net.frequency.length}>${net.frequency} `
        if (net.mode) adif += `<MODE:${net.mode.length}>${net.mode} `
        adif += `<EOR>\n`
    })

    const blob = new Blob([adif], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `net_log_${net.name.replace(/\s+/g, '_')}_${format(new Date(net.started_at), 'yyyyMMdd')}.adi`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// --- ADIF IMPORT (BASIC) ---
export const parseADIF = (content: string): Partial<Checkin>[] => {
    const records: Partial<Checkin>[] = []
    const rawRecords = content.split(/<EOR>/i)

    rawRecords.forEach(raw => {
        if (!raw.trim()) return
        const record: Partial<Checkin> = {}

        const callMatch = raw.match(/<CALL:\d+>([^<]+)/i)
        if (callMatch) record.callsign = callMatch[1].trim()

        const nameMatch = raw.match(/<NAME:\d+>([^<]+)/i)
        if (nameMatch) record.name = nameMatch[1].trim()

        const qthMatch = raw.match(/<QTH:\d+>([^<]+)/i)
        if (qthMatch) record.location = qthMatch[1].trim()

        const rstMatch = raw.match(/<RST_RCVD:\d+>([^<]+)/i)
        if (rstMatch) record.signal_report = rstMatch[1].trim()

        const commentMatch = raw.match(/<COMMENT:\d+>([^<]+)/i)
        if (commentMatch) record.remarks = commentMatch[1].trim()

        if (record.callsign) records.push(record)
    })

    return records
}

// --- PDF EXPORT ---
export const exportToPDF = async (net: Net, checkins: Checkin[], chartRefs: (HTMLElement | null)[]) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(22)
    doc.setTextColor(16, 185, 129) // Emerald-500
    doc.text('9M2PJU NCS DASHBOARD', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(16)
    doc.setTextColor(30, 41, 59) // Slate-800
    doc.text(`NET REPORT: ${net.name}`, pageWidth / 2, 30, { align: 'center' })

    // Net Info
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139) // Slate-500
    const netDetails = [
        `Started: ${format(new Date(net.started_at), 'yyyy-MM-dd HH:mm')}`,
        `Ended: ${net.ended_at ? format(new Date(net.ended_at), 'yyyy-MM-dd HH:mm') : 'Active'}`,
        `Freq: ${net.frequency || 'N/A'}`,
        `Mode: ${net.mode || 'N/A'}`,
        `Type: ${net.type.toUpperCase()}`
    ]
    doc.text(netDetails.join('  |  '), pageWidth / 2, 40, { align: 'center' })

    if (net.notes) {
        doc.setFontSize(9)
        doc.text(`Notes: ${net.notes}`, pageWidth / 2, 46, { align: 'center', maxWidth: 180 })
    }

    // Stats
    const uniqueCallsigns = new Set(checkins.map(c => c.callsign)).size
    const trafficCount = checkins.filter(c => c.traffic).length

    autoTable(doc, {
        startY: 55,
        head: [['Total Check-ins', 'Unique Stations', 'Traffic Reports']],
        body: [[checkins.length, uniqueCallsigns, trafficCount]],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        styles: { halign: 'center' }
    })

    // Log Table
    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['#', 'Time', 'Callsign', 'Operator', 'Signal', 'Location', 'Traffic', 'Remarks']],
        body: checkins.map((c, i) => [
            i + 1,
            format(new Date(c.checked_in_at), 'HH:mm'),
            c.callsign,
            c.name || '-',
            c.signal_report || '-',
            c.location || '-',
            c.traffic ? (c.traffic_precedence?.toUpperCase() || 'YES') : 'NO',
            c.remarks || '-'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 }
    })

    // Add Charts Page if requested
    for (const chartRef of chartRefs) {
        if (chartRef) {
            doc.addPage()
            doc.setFontSize(14)
            doc.text('ANALYTICS VISUALIZATION', pageWidth / 2, 20, { align: 'center' })

            try {
                const canvas = await html2canvas(chartRef, {
                    backgroundColor: '#0f172a', // Dark slate
                    scale: 2
                })
                const imgData = canvas.toDataURL('image/png')
                const imgWidth = 180
                const imgHeight = (canvas.height * imgWidth) / canvas.width
                doc.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight)
            } catch (err) {
                console.error('Error capturing chart:', err)
            }
        }
    }

    doc.save(`net_report_${net.name.replace(/\s+/g, '_')}_${format(new Date(net.started_at), 'yyyyMMdd')}.pdf`)
}

// --- CERTIFICATE GENERATION ---
export const exportCertificate = async (net: Net, checkin: Checkin) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // --- BACKGROUND ---
    // Solid Dark Background
    doc.setFillColor(15, 23, 42) // Slate-900
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Add a slightly lighter inner area
    doc.setFillColor(2, 6, 23) // Slate-950
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'F')

    // --- DECORATIVE PATTERNS ---
    const drawCircuitLine = (x1: number, y1: number, x2: number, y2: number) => {
        doc.setDrawColor(16, 185, 129) // Emerald-500
        doc.setLineWidth(0.3)
        doc.line(x1, y1, x2, y2)
        doc.setFillColor(16, 185, 129)
        doc.circle(x2, y2, 0.6, 'F')
    }

    // Top Left Patterns
    drawCircuitLine(15, 45, 45, 15)
    drawCircuitLine(15, 65, 65, 15)
    // Bottom Right Patterns
    drawCircuitLine(pageWidth - 15, pageHeight - 45, pageWidth - 45, pageHeight - 15)
    drawCircuitLine(pageWidth - 15, pageHeight - 65, pageWidth - 65, pageHeight - 15)

    // Outer Border
    doc.setDrawColor(16, 185, 129) // Emerald-500
    doc.setLineWidth(1)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    // Inner Glowing Border (Thin)
    doc.setDrawColor(6, 182, 212) // Cyan-500
    doc.setLineWidth(0.2)
    doc.rect(11.5, 11.5, pageWidth - 23, pageHeight - 23)

    // Decorative Corners
    const cornerSize = 25
    doc.setLineWidth(2)
    doc.setDrawColor(16, 185, 129)
    // Top Left
    doc.line(10, 10, 10 + cornerSize, 10)
    doc.line(10, 10, 10, 10 + cornerSize)
    // Top Right
    doc.line(pageWidth - 10, 10, pageWidth - 10 - cornerSize, 10)
    doc.line(pageWidth - 10, 10, pageWidth - 10, 10 + cornerSize)
    // Bottom Left
    doc.line(10, pageHeight - 10, 10 + cornerSize, pageHeight - 10)
    doc.line(10, pageHeight - 10, 10, pageHeight - 10 - cornerSize)
    // Bottom Right
    doc.line(pageWidth - 10, pageHeight - 10, pageWidth - 10 - cornerSize, pageHeight - 10)
    doc.line(pageWidth - 10, pageHeight - 10, pageWidth - 10, pageHeight - 10 - cornerSize)

    // --- LOGO & BRANDING ---
    try {
        const logoImg = new Image()
        logoImg.src = '/logo.png'
        await new Promise((resolve, reject) => {
            logoImg.onload = resolve
            logoImg.onerror = reject
        })
        const logoSize = 30
        const logoX = (pageWidth - logoSize) / 2
        const logoY = 18

        // Logo Frame / Border
        doc.setDrawColor(16, 185, 129)
        doc.setLineWidth(0.8)
        doc.rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
        doc.setDrawColor(6, 182, 212)
        doc.setLineWidth(0.3)
        doc.rect(logoX - 3.5, logoY - 3.5, logoSize + 7, logoSize + 7)

        doc.addImage(logoImg, 'PNG', logoX, logoY, logoSize, logoSize)
    } catch (err) {
        console.error('Failed to load logo for certificate:', err)
    }

    // --- CONTENT ---
    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(30)
    doc.setTextColor(16, 185, 129) // Emerald-500
    doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, 65, { align: 'center' })

    doc.setFontSize(16)
    doc.setTextColor(203, 213, 225) // Slate-300
    doc.text('This special recognition is awarded to', pageWidth / 2, 78, { align: 'center' })

    // Callsign
    doc.setFontSize(50)
    doc.setTextColor(255, 255, 255)
    doc.text(checkin.callsign.toUpperCase(), pageWidth / 2, 102, { align: 'center' })

    // Name
    if (checkin.name) {
        doc.setFontSize(22)
        doc.setTextColor(16, 185, 129)
        doc.text(checkin.name, pageWidth / 2, 116, { align: 'center' })
    }

    doc.setFontSize(16)
    doc.setTextColor(203, 213, 225)
    doc.text('for active participation in the radio net operation', pageWidth / 2, 132, { align: 'center' })

    // Net Name
    doc.setFontSize(24)
    doc.setTextColor(6, 182, 212) // Cyan-500
    doc.text(net.name, pageWidth / 2, 146, { align: 'center' })

    // Details Grid
    doc.setFontSize(13)
    doc.setTextColor(148, 163, 184) // Slate-400
    const detailsY = 160
    doc.text(`Frequency: ${net.frequency || 'N/A'}`, pageWidth / 4, detailsY, { align: 'center' })
    doc.text(`Mode: ${net.mode || 'N/A'}`, pageWidth / 2, detailsY, { align: 'center' })
    doc.text(`Date: ${format(new Date(checkin.checked_in_at), 'MMMM dd, yyyy')}`, (pageWidth * 3) / 4, detailsY, { align: 'center' })

    // --- FOOTER & SIGNATURE ---
    // Digital Signature Line
    doc.setDrawColor(51, 65, 85) // Slate-700
    doc.setLineWidth(0.5)
    doc.line(pageWidth / 2 - 50, 188, pageWidth / 2 + 50, 188)

    // Controller Name
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    const netController = (net as any).profiles
        ? `${(net as any).profiles.name || 'Unknown'} (${(net as any).profiles.callsign})`
        : 'Authorized NCS'
    doc.text(netController, pageWidth / 2, 194, { align: 'center' })

    // Controller Title
    doc.setFontSize(11)
    doc.setTextColor(16, 185, 129)
    doc.text('Net Control Station', pageWidth / 2, 200, { align: 'center' })

    // Bottom Branding
    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105) // Slate-600
    doc.text(`Verification ID: ${net.id.substring(0, 8)}-${checkin.id.substring(0, 8)}`, 15, pageHeight - 12)
    doc.text('Generated by 9M2PJU NCS Center', pageWidth - 15, pageHeight - 12, { align: 'right' })

    doc.save(`certificate_${checkin.callsign}_${format(new Date(checkin.checked_in_at), 'yyyyMMdd')}.pdf`)
}
