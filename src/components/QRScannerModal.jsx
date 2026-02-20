import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_ID = 'qr-scanner-region';

/**
 * QRScannerModal
 * Props:
 *   employees   – full employees array
 *   records     – existing records map  { "empId::date": {...} }
 *   onScan      – async fn(empId, date, recordData) — same as saveRecord from App.js
 *   onClose     – fn to close
 */
export default function QRScannerModal({ employees, records, onScan, onClose }) {
    const scannerRef = useRef(null);
    const [status, setStatus] = useState('init');   // init | scanning | success | error | already
    const [message, setMessage] = useState('');
    const [empInfo, setEmpInfo] = useState(null);
    const [saving, setSaving] = useState(false);

    // ── Start camera scanner on mount ─────────────────────────────
    useEffect(() => {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        const config = {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
        };

        scanner
            .start(
                { facingMode: 'environment' },
                config,
                onDecodeSuccess,
                () => { } // suppress per-frame errors
            )
            .then(() => setStatus('scanning'))
            .catch(err => {
                setStatus('error');
                setMessage(
                    err?.message?.includes('permission')
                        ? 'Camera permission denied. Please allow camera access and try again.'
                        : 'Could not access camera: ' + (err?.message || 'Unknown error')
                );
            });

        return () => {
            scanner
                .stop()
                .catch(() => { })
                .finally(() => scanner.clear());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handle a decoded QR value ──────────────────────────────────
    async function onDecodeSuccess(decodedText) {
        if (saving || status === 'success') return;

        // Find employee by their UUID (the QR value)
        const emp = employees.find(e => e.id === decodedText.trim());
        if (!emp) {
            setStatus('error');
            setMessage(`Unknown QR code. No employee found with ID: "${decodedText.slice(0, 40)}"`);
            return;
        }

        // Check today's date
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const key = `${emp.id}::${today}`;
        const existing = records[key];

        if (existing && existing.status === 'present') {
            setEmpInfo({ emp, existing, today });
            setStatus('already');
            return;
        }

        // Auto check-in time
        const checkIn = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        setSaving(true);
        try {
            await onScan(emp.id, today, {
                status: 'present',
                checkIn,
                checkOut: existing?.checkOut || '',
                leaveType: '',
                holidayName: '',
                note: existing?.note || '',
            });
            setEmpInfo({ emp, checkIn, today });
            setStatus('success');
        } catch (e) {
            setStatus('error');
            setMessage('Failed to save attendance: ' + e.message);
        } finally {
            setSaving(false);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────
    const fmtTime = t => {
        if (!t) return '';
        const [h, m] = t.split(':');
        const hr = +h;
        return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
    };

    const resetScanner = () => {
        setStatus('scanning');
        setMessage('');
        setEmpInfo(null);
    };

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-box" style={{ width: 400, textAlign: 'center' }}>

                {/* Header */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg,#10b981,#059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, margin: '0 auto 12px',
                        boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                    }}>📷</div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                        Scan Employee QR Code
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                        Point camera at an employee's QR code to mark them Present
                    </div>
                </div>

                {/* Camera Preview */}
                {(status === 'init' || status === 'scanning') && (
                    <>
                        <div style={{
                            position: 'relative',
                            borderRadius: 12,
                            overflow: 'hidden',
                            background: '#0a0a14',
                            border: '2px solid rgba(16,185,129,0.3)',
                            marginBottom: 14,
                        }}>
                            <div id={SCANNER_ID} style={{ width: '100%' }} />
                            {/* Corner scan lines */}
                            <div style={{
                                position: 'absolute', inset: 0, pointerEvents: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: 220, height: 220,
                                    border: '2px solid transparent',
                                    borderRadius: 4,
                                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                                    position: 'relative',
                                }}>
                                    {/* Animated scan line */}
                                    <div className="qr-scan-line" />
                                    {/* Corner markers */}
                                    {[
                                        { top: 0, left: 0, borderWidth: '3px 0 0 3px' },
                                        { top: 0, right: 0, borderWidth: '3px 3px 0 0' },
                                        { bottom: 0, left: 0, borderWidth: '0 0 3px 3px' },
                                        { bottom: 0, right: 0, borderWidth: '0 3px 3px 0' },
                                    ].map((style, i) => (
                                        <div key={i} style={{
                                            position: 'absolute',
                                            width: 20, height: 20,
                                            borderStyle: 'solid',
                                            borderColor: '#10b981',
                                            borderRadius: 2,
                                            ...style,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 14 }}>
                            {status === 'init' ? '⏳ Starting camera…' : '🔍 Scanning — align QR code in the frame'}
                        </div>
                    </>
                )}

                {/* ── Success State ── */}
                {status === 'success' && empInfo && (
                    <div style={{
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        borderRadius: 12, padding: '20px 16px', marginBottom: 16,
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#4ade80', marginBottom: 6 }}>
                            Attendance Marked!
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                            {empInfo.emp.name}
                        </div>
                        {empInfo.emp.department && (
                            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
                                {empInfo.emp.department}
                            </div>
                        )}
                        <div style={{
                            display: 'inline-flex', gap: 16, background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '8px 16px',
                        }}>
                            <div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
                                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>{empInfo.today}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Check In</div>
                                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>{fmtTime(empInfo.checkIn)}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Already Marked State ── */}
                {status === 'already' && empInfo && (
                    <div style={{
                        background: 'rgba(245,158,11,0.08)',
                        border: '1px solid rgba(245,158,11,0.25)',
                        borderRadius: 12, padding: '20px 16px', marginBottom: 16,
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#fbbf24', marginBottom: 5 }}>
                            Already Marked Present
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 700, marginBottom: 4 }}>
                            {empInfo.emp.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                            Already marked Present today{empInfo.existing?.checkIn ? ` at ${fmtTime(empInfo.existing.checkIn)}` : ''}.
                        </div>
                    </div>
                )}

                {/* ── Error State ── */}
                {status === 'error' && (
                    <div style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 12, padding: '20px 16px', marginBottom: 16,
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>❌</div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-danger-text)', marginBottom: 8 }}>
                            Scan Failed
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{message}</div>
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {(status === 'success' || status === 'already' || status === 'error') && (
                        <button className="btn-primary" onClick={resetScanner} style={{ flex: 1, padding: '9px', fontSize: 13 }}>
                            📷 Scan Another
                        </button>
                    )}
                    <button className="btn-ghost" onClick={onClose} style={{ flex: 1, padding: '9px', fontSize: 13 }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
