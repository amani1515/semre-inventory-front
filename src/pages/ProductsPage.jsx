import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import { getProducts } from '../api/products';

export default function ProductsPage() {
  const [data, setData]     = useState({ data: [], current_page: 1, last_page: 1 });
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts(page)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Layout>
      <div style={s.header}>
        <h1 style={s.title}>Products</h1>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Name', 'Category', 'SKU', 'Cost Price', 'Selling Price', 'Stock'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={s.center}>Loading...</td></tr>
            ) : data.data.length === 0 ? (
              <tr><td colSpan={6} style={s.center}>No products found.</td></tr>
            ) : data.data.map(p => (
              <tr key={p.id} style={s.tr}>
                <td style={s.td}>{p.name}</td>
                <td style={s.td}>{p.category}</td>
                <td style={{ ...s.td, ...s.sku }}>{p.sku}</td>
                <td style={s.td}>{parseFloat(p.cost_price).toLocaleString()} Birr</td>
                <td style={s.td}>{parseFloat(p.selling_price).toLocaleString()} Birr</td>
                <td style={s.td}>
                  <span style={{ ...s.stockBadge, ...(p.stock_quantity < 10 ? s.lowStock : s.okStock) }}>
                    {p.stock_quantity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
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
  td:         { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#111827' },
  sku:        { fontFamily: 'monospace', color: '#6b7280' },
  center:     { padding: '2rem', textAlign: 'center', color: '#6b7280' },
  stockBadge: { padding: '2px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '600' },
  lowStock:   { background: '#fee2e2', color: '#dc2626' },
  okStock:    { background: '#dcfce7', color: '#16a34a' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' },
  pageBtn:    { background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  pageInfo:   { fontSize: '0.85rem', color: '#6b7280' },
};
