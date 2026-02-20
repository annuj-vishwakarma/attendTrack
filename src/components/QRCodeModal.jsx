import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

/**
 * QRCodeModal
 * Props:
 *   employee  – employee object { id, name, employeeId, department, designation }
 *   onClose   – function to close the modal
 */
export default function QRCodeModal({ employee, onClose }) {
    const canvasRef = useRef(null);

    if (!employee) return null;

    // The QR value encodes the employee's unique UUID (used as emp_id in attendance records)
    const qrValue = employee.id;

    const handleDownload = () => {
        const canvas = document.getElementById('emp-qr-canvas');
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR_${employee.name.replace(/\s+/g, '_')}_${employee.employeeId || employee.id}.png`;
        link.click();
    };

    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-box" style={{ width: 340, textAlign: 'center' }}>

                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, margin: '0 auto 12px',
                        boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                    }}>🔲</div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--color-text-primary)', marginBottom: 3 }}>
                        My QR Code
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                        Show this to your manager to mark attendance
                    </div>
                </div>

                {/* QR Code Canvas */}
                <div style={{
                    display: 'inline-block',
                    background: '#fff',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                    <QRCodeCanvas
                        id="emp-qr-canvas"
                        value={qrValue}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#0d0d1a"
                        level="H"
                        includeMargin={false}
                        ref={canvasRef}
                    />
                </div>

                {/* Employee Info */}
                <div style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 18,
                }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                        {employee.name}
                    </div>
                    {employee.employeeId && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                            ID: <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{employee.employeeId}</span>
                        </div>
                    )}
                    {employee.department && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                            {employee.department}
                            {employee.designation ? ` · ${employee.designation}` : ''}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="btn-primary"
                        onClick={handleDownload}
                        style={{ flex: 1, padding: '9px 0', fontSize: 13 }}
                    >
                        ⬇ Download PNG
                    </button>
                    <button
                        className="btn-ghost"
                        onClick={onClose}
                        style={{ padding: '9px 16px', fontSize: 13 }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
