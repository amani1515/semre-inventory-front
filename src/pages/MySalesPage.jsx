import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import Layout from '../components/Layout';
import { getSales } from '../api/sales';

const statusStyle = {
  completed:        { background: '#dcfce7', color: '#16a34a' },
  pending_approval: { background: '#fef9c3', color: '#92400e' },
  approved:         { background: '#dbeafe', color: '#1d4ed8' },
  rejected:         { background: '#fee2e2', color: '#dc2626' },
};

export default function MySalesPage() {
  const [data, setData]       = useState({ data: [], current_page: 1, last_page: 1 });
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    getSales(page).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [page]);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <Layout>
      <div style={s.header}>
        <h1 style={s.title}>My Sales</h1>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              {['#', 'Date', 'Items', 'Subtotal', 'Discount', 'VAT', 'Total', 'Status', ''].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={s.center}>Loading...</td></tr>
            ) : data.data.length === 0 ? (
              <tr><td colSpan={9} style={s.center}>No sales found.</td></tr>
            ) : data.data.map(sale => (
              <>
                <tr key={sale.id} style={s.tr}>
                  <td style={s.td}>#{sale.id}</td>
                  <td style={s.td}>{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td style={s.td}>{sale.items?.length ?? '—'}</td>
                  <td style={s.td}>{parseFloat(sale.subtotal).toLocaleString()}</td>
                  <td style={s.td}>{parseFloat(sale.discount)}%</td>
                  <td style={s.td}>{parseFloat(sale.vat_amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td style={{ ...s.td, fontWeight: '700' }}>{parseFloat(sale.total).toLocaleString(undefined, { maximumFractionDigits: 2 })} Birr</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(statusStyle[sale.status] ?? {}) }}>
                      {sale.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button style={s.expandBtn} onClick={() => toggle(sale.id)}>
                      {expanded === sale.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                </tr>

                {expanded === sale.id && (
                  <tr key={`${sale.id}-detail`}>
                    <td colSpan={9} style={s.detailCell}>
                      <table style={s.innerTable}>
                        <thead>
                          <tr>
                            {['Product', 'SKU', 'Qty', 'Unit Price', 'Line Total'].map(h => (
                              <th key={h} style={s.innerTh}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(sale.items ?? []).map(item => (
                            <tr key={item.id}>
                              <td style={s.innerTd}>{item.product?.name ?? '—'}</td>
                              <td style={{ ...s.innerTd, fontFamily: 'monospace', color: '#6b7280' }}>{item.product?.sku ?? '—'}</td>
                              <td style={s.innerTd}>{item.quantity}</td>
                              <td style={s.innerTd}>{parseFloat(item.unit_price).toLocaleString()} Birr</td>
                              <td style={s.innerTd}>{parseFloat(item.subtotal).toLocaleString()} Birr</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {sale.note && <p style={s.note}>Note: {sale.note}</p>}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        <div style={s.pagination}>
          <button style={s.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={16} />
          </button>
          <span style={s.pageInfo}>Page {data.current_page} of {data.last_page}</span>
          <button style={s.pageBtn} disabled={page === data.last_page} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </Layout>
  );
}

const s = {
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  title:      { fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 },
  card:       { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  tr:         { borderBottom: '1px solid #f3f4f6' },
  td:         { padding: '0.85rem 1rem', fontSize: '0.88rem', color: '#111827' },
  center:     { padding: '2rem', textAlign: 'center', color: '#6b7280' },
  badge:      { padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '600', textTransform: 'capitalize' },
  expandBtn:  { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' },
  detailCell: { padding: '0', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
  innerTable: { width: '100%', borderCollapse: 'collapse' },
  innerTh:    { padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' },
  innerTd:    { padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#374151' },
  note:       { padding: '0.5rem 1rem', fontSize: '0.82rem', color: '#6b7280', margin: 0, borderTop: '1px solid #e5e7eb' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' },
  pageBtn:    { background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  pageInfo:   { fontSize: '0.85rem', color: '#6b7280' },
};
