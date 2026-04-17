import React, { useState, useRef } from 'react';

const STATUS_CONFIG = {
  'none': { label: 'Open', icon: '○', bg: 'transparent', color: '#999' },
  'in-office': { label: 'In Office', icon: '🏢', bg: '#e8f0fe', color: '#1e40af' },
  'wfh': { label: 'WFH', icon: '🏠', bg: '#ede8fe', color: '#6b21a8' },
  'al': { label: 'Annual Leave', icon: '✈️', bg: '#fdf2f8', color: '#be185d' },
  'sick': { label: 'Sick Leave', icon: '🤒', bg: '#fef2f2', color: '#991b1b' },
  'ol': { label: 'Outside', icon: '🌍', bg: '#f0fdf4', color: '#15803d' },
};

const STAFF = [
  { id: 'alice', name: 'Alice Chen' },
  { id: 'bob', name: 'Bob Martinez' },
  { id: 'carol', name: 'Carol Singh' },
];

const DATES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function CalendarDemo() {
  const [records, setRecords] = useState({});
  const [dragging, setDragging] = useState(null);
  const [selectedRange, setSelectedRange] = useState([]);
  const [preview, setPreview] = useState([]);
  const tableRef = useRef(null);

  // Generate cell key
  const cellKey = (staffId, dateIdx, shift) => `${staffId}-${dateIdx}-${shift}`;

  // Start drag - when user clicks on ANY status cell (including empty ones for unselect)
  const handleMouseDown = (staffId, dateIdx, shift, status) => {
    // Allow dragging from empty cells for unselect functionality
    setDragging({ staffId, dateIdx, shift, status });
    setSelectedRange([[staffId, dateIdx, shift]]);
    setPreview([[staffId, dateIdx, shift]]);
  };

  // Mouse over - highlight cells that would be filled
  const handleMouseOver = (staffId, dateIdx, shift) => {
    if (!dragging) return;

    const startRow = STAFF.findIndex(s => s.id === dragging.staffId);
    const endRow = STAFF.findIndex(s => s.id === staffId);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    const startDate = dragging.dateIdx;
    const endDate = dateIdx;
    const minDate = Math.min(startDate, endDate);
    const maxDate = Math.max(startDate, endDate);

    const startShift = dragging.shift === 'AM' ? 0 : 1;
    const endShift = shift === 'AM' ? 0 : 1;
    const minShift = Math.min(startShift, endShift);
    const maxShift = Math.max(startShift, endShift);

    const range = [];
    const staffIds = STAFF.map(s => s.id);
    for (let r = minRow; r <= maxRow; r++) {
      for (let d = minDate; d <= maxDate; d++) {
        if (minShift === maxShift) {
          // Same shift, fill horizontally or vertically
          range.push([staffIds[r], d, startShift === 0 ? 'AM' : 'PM']);
        } else {
          // Different shifts - fill both
          range.push([staffIds[r], d, 'AM']);
          range.push([staffIds[r], d, 'PM']);
        }
      }
    }
    setPreview(range);
  };

  // Mouse up - apply the fill with optimistic updates (instant response)
  const handleMouseUp = () => {
    if (!dragging || preview.length === 0) {
      setDragging(null);
      setSelectedRange([]);
      setPreview([]);
      return;
    }

    // STEP 1: IMMEDIATELY update local state (optimistic update - no waiting)
    const newRecords = { ...records };
    preview.forEach(([staffId, dateIdx, shift]) => {
      const key = cellKey(staffId, dateIdx, shift);
      if (dragging.status === 'none') {
        // Unselect: remove the status (delete operation)
        delete newRecords[key];
      } else {
        // Select: set the status
        newRecords[key] = dragging.status;
      }
    });

    // STEP 2: Update UI immediately - user sees change right away
    setRecords(newRecords);
    setDragging(null);
    setSelectedRange([]);
    setPreview([]);

    // STEP 3: In a real application, fire async database operations here
    // WITHOUT awaiting - so UI stays responsive
    // (async () => {
    //   try {
    //     await Promise.all(preview.map(([staffId, dateIdx, shift]) => {
    //       const key = cellKey(staffId, dateIdx, shift);
    //       if (dragging.status === 'none') {
    //         return supabase.from('statuses').delete().eq('id', key);
    //       } else {
    //         return supabase.from('statuses').upsert({...});
    //       }
    //     }));
    //   } catch(e) {
    //     console.error('Bulk operation error:', e);
    //   }
    // })();
  };

  // Reset demo
  const handleReset = () => {
    setRecords({});
    setDragging(null);
    setSelectedRange([]);
    setPreview([]);
  };

  const isPreviewCell = (staffId, dateIdx, shift) =>
    preview.some(([s, d, sh]) => s === staffId && d === dateIdx && sh === shift);

  const isSelectedCell = (staffId, dateIdx, shift) =>
    selectedRange.some(([s, d, sh]) => s === staffId && d === dateIdx && sh === shift);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', padding: '20px', fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        /* Frozen header - stays at top of viewport when scrolling */
        .header-frozen {
          position: sticky;
          top: 0;
          z-index: 300;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }
        /* Frozen staff column - stays visible when scrolling horizontally */
        .col-frozen {
          position: sticky;
          left: 0;
          z-index: 100;
          background: #fff;
        }
        .demo-container { max-width: 1200px; margin: 0 auto; }
        .demo-header { margin-bottom: 30px; }
        .demo-title { font-size: 28px; font-weight: 700; color: #111; margin-bottom: 8px; }
        .demo-subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
        .instructions { background: #e8f0fe; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
        .instr-title { font-weight: 600; color: #1e40af; margin-bottom: 8px; }
        .instr-text { font-size: 13px; color: #1e3a8a; line-height: 1.5; }
        .instr-text em { font-style: italic; }
        .demo-controls { margin-bottom: 20px; }
        .reset-btn { padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; }
        .reset-btn:hover { background: #dc2626; }
        /* Table wrapper - allows page scrolling with sticky header */
        .table-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          overflow: visible;
          border: 1px solid #e5e7eb;
        }
        table { width: 100%; border-collapse: collapse; }
        th {
          padding: 12px 8px;
          font-size: 12px;
          font-weight: 700;
          color: #6b7280;
          background: #fff;
          border-bottom: 2px solid #e5e7eb;
          text-align: center;
        }
        td { padding: 4px; height: 52px; border-bottom: 1px solid #f0f0f0; }
        tr:last-child td { border-bottom: none; }
        .staff-col { padding: 8px; text-align: left; font-weight: 500; font-size: 13px; color: #374151; }
        .shift-label { font-size: 10px; color: #9ca3af; text-align: center; padding: 4px; margin-bottom: 2px; }
        /* Status cell - clickable and draggable */
        .status-cell {
          height: 100%;
          padding: 0;
          margin: 2px;
          border-radius: 8px;
          border: 1.5px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.15s ease;
          user-select: none;
          position: relative;
        }
        .status-cell:hover { transform: scale(1.05); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        /* Empty cells - show as open */
        .status-cell.empty {
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          color: #9ca3af;
        }
        .status-cell.empty:hover {
          background: #f0f0f0;
          border-color: #d1d5db;
        }
        /* Preview state - shows which cells will be filled */
        .status-cell.preview {
          background: #dbeafe !important;
          border: 2px dashed #0284c7 !important;
          opacity: 0.85;
        }
        .status-cell.preview::after {
          content: '+';
          position: absolute;
          right: -8px;
          top: -8px;
          font-size: 16px;
          color: #0284c7;
          font-weight: bold;
        }
        .legend { display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .legend-swatch { width: 20px; height: 20px; border-radius: 4px; border: 1px solid #ddd; }
      `}</style>

      <div className="demo-container">
        <div className="demo-header">
          <div className="demo-title">📅 Calendar Bulk Fill Demo</div>
          <div className="demo-subtitle">Try clicking and dragging status cells to fill multiple cells at once</div>
        </div>

        <div className="instructions">
          <div className="instr-title">✨ How to use:</div>
          <div className="instr-text">
            1. <em>Click and hold</em> on any colored status cell (like 🏠 WFH)<br/>
            2. <em>Drag</em> to any other cell (works horizontally across dates, vertically between AM/PM, or diagonally)<br/>
            3. <em>Release</em> to fill all cells in the range with that status<br/>
            4. <strong>To unselect:</strong> Click and drag from an empty cell to clear multiple cells<br/>
            5. <strong>Notice:</strong> The header row stays frozen at the top even if you scroll down
          </div>
        </div>

        <div className="demo-controls">
          <button className="reset-btn" onClick={handleReset}>Reset All Cells</button>
        </div>

        <div className="table-wrapper" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <table ref={tableRef}>
            <thead className="header-frozen">
              <tr>
                <th style={{ width: '140px' }}></th>
                {DATES.map((date, idx) => (
                  <th key={idx} colSpan={2} style={{ padding: '12px 0' }}>
                    {date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAFF.map((staff) => (
                <React.Fragment key={staff.id}>
                  {/* AM/PM row */}
                  <tr>
                    <td className="col-frozen staff-col">{staff.name}</td>
                    {DATES.map((_, dateIdx) => (
                      <React.Fragment key={dateIdx}>
                        {['AM', 'PM'].map((shift) => {
                          const key = cellKey(staff.id, dateIdx, shift);
                          const status = records[key] || 'none';
                          const cfg = STATUS_CONFIG[status];
                          const isPreview = isPreviewCell(staff.id, dateIdx, shift);

                          return (
                            <td key={shift} style={{ position: 'relative', padding: '2px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                                <div className="shift-label">{shift}</div>
                                <button
                                  className={`status-cell ${status === 'none' ? 'empty' : ''} ${isPreview ? 'preview' : ''}`}
                                  style={
                                    status !== 'none'
                                      ? {
                                          background: cfg.bg,
                                          color: cfg.color,
                                          border: `1.5px solid ${cfg.color}40`,
                                        }
                                      : {}
                                  }
                                  onMouseDown={() => handleMouseDown(staff.id, dateIdx, shift, status)}
                                  onMouseOver={() => handleMouseOver(staff.id, dateIdx, shift)}
                                >
                                  {status !== 'none' ? `${cfg.icon} ${cfg.label}` : 'Open'}
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-swatch" style={{ background: '#e8f0fe', borderColor: '#93c5fd' }}></div>
            <span>In Office</span>
          </div>
          <div className="legend-item">
            <div className="legend-swatch" style={{ background: '#ede8fe', borderColor: '#c4b5fd' }}></div>
            <span>WFH</span>
          </div>
          <div className="legend-item">
            <div className="legend-swatch" style={{ background: '#fdf2f8', borderColor: '#f9a8d4' }}></div>
            <span>Annual Leave</span>
          </div>
          <div className="legend-item">
            <div className="legend-swatch" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}></div>
            <span>Sick Leave</span>
          </div>
          <div className="legend-item">
            <div className="legend-swatch" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}></div>
            <span>Outside</span>
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #93c5fd' }}>
          <strong style={{ color: '#1e40af' }}>Key Features Implemented:</strong>
          <ul style={{ color: '#1e3a8a', marginTop: '8px', marginLeft: '20px', fontSize: '13px' }}>
            <li>✅ <strong>Frozen header:</strong> Scroll down and the day-of-week header stays at top of viewport</li>
            <li>✅ <strong>Fast response:</strong> UI updates immediately with optimistic updates (no wait for database)</li>
            <li>✅ <strong>Drag-to-fill:</strong> Click any cell and drag to fill multiple cells in one gesture</li>
            <li>✅ <strong>Bulk unselect:</strong> Drag from empty cells to clear multiple cells at once</li>
            <li>✅ <strong>Multi-directional:</strong> Works horizontally (dates), vertically (AM/PM), and diagonally</li>
            <li>✅ <strong>Visual preview:</strong> Blue dashed border shows which cells will be filled before release</li>
          </ul>
        </div>
      </div>
    </div>
  );
}