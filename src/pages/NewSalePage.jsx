import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, ShoppingCart } from 'lucide-react';
import Layout from '../components/Layout';
import { getProducts } from '../api/products';
import { createSale } from '../api/sales';

const VAT = 0.15;

export default function NewSalePage() {
  const [products, setProducts]   = useState([]);
  const [search, setSearch]       = useState('');
  const [cart, setCart]           = useState([]);
  const [discount, setDiscount]   = useState(0);
  const [note, setNote]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');

  useEffect(() => {
    getProducts(1).then(r => setProducts(r.data.data ?? []));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.product_id === product.id);
      if (exists) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: product.id, name: product.name, sku: product.sku, unit_price: parseFloat(product.selling_price), quantity: 1, stock: product.stock_quantity }];
    });
  };

  const updateQty = (product_id, qty) => {
    const val = Math.max(1, parseInt(qty) || 1);
    setCart(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity: val } : i));
  };

  const removeItem = (product_id) => setCart(prev => prev.filter(i => i.product_id !== product_id));

  const subtotal       = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const discountAmt    = subtotal * (discount / 100);
  const afterDiscount  = subtotal - discountAmt;
  const vatAmt         = afterDiscount * VAT;
  const total          = afterDiscount + vatAmt;

  const handleSubmit = async () => {
    if (cart.length === 0) return setError('Add at least one product.');
    const overStock = cart.find(i => i.quantity > i.stock);
    if (overStock) return setError(`Not enough stock for "${overStock.name}". Available: ${overStock.stock}`);
    setError('');
    setSubmitting(true);
    try {
      const { data } = await createSale({
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        discount: parseFloat(discount),
        note,
      });
      setResult(data);
      setCart([]);
      setDiscount(0);
      setNote('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sale.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) return (
    <Layout>
      <div style={s.successBox}>
        <ShoppingCart size={40} color="#16a34a" />
        <h2 style={s.successTitle}>
          {result.status === 'pending_approval' ? 'Sale Submitted — Pending Approval' : 'Sale Completed!'}
        </h2>
        <p style={s.successSub}>Sale #{result.id} · Total: {parseFloat(result.total).toLocaleString()} Birr</p>
        {result.status === 'pending_approval' && (
          <p style={s.pendingNote}>This sale exceeds 50,000 Birr and requires manager approval.</p>
        )}
        <button style={s.newBtn} onClick={() => setResult(null)}>Create Another Sale</button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <h1 style={s.title}>New Sale</h1>

      <div style={s.layout}>
        {/* Product Search */}
        <div style={s.left}>
          <div style={s.searchWrap}>
            <Search size={16} style={s.searchIcon} />
            <input
              style={s.searchInput}
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={s.productList}>
            {filtered.length === 0 ? (
              <div style={s.empty}>No products found.</div>
            ) : filtered.map(p => (
              <div key={p.id} style={s.productRow}>
                <div>
                  <div style={s.productName}>{p.name}</div>
                  <div style={s.productMeta}>{p.sku} · Stock: {p.stock_quantity}</div>
                </div>
                <div style={s.productRight}>
                  <span style={s.price}>{parseFloat(p.selling_price).toLocaleString()} Birr</span>
                  <button
                    style={{ ...s.addBtn, ...(p.stock_quantity === 0 ? s.addBtnDisabled : {}) }}
                    disabled={p.stock_quantity === 0}
                    onClick={() => addToCart(p)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart & Summary */}
        <div style={s.right}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Cart</h3>
            {cart.length === 0 ? (
              <div style={s.empty}>No items added yet.</div>
            ) : cart.map(item => (
              <div key={item.product_id} style={s.cartRow}>
                <div style={s.cartInfo}>
                  <div style={s.cartName}>{item.name}</div>
                  <div style={s.cartSub}>{item.unit_price.toLocaleString()} Birr each</div>
                </div>
                <input
                  type="number" min={1} max={item.stock}
                  value={item.quantity}
                  onChange={e => updateQty(item.product_id, e.target.value)}
                  style={s.qtyInput}
                />
                <span style={s.lineTotal}>{(item.unit_price * item.quantity).toLocaleString()}</span>
                <button style={s.removeBtn} onClick={() => removeItem(item.product_id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Discount */}
            <div style={s.discountRow}>
              <label style={s.label}>Discount (%)</label>
              <input
                type="number" min={0} max={100}
                value={discount}
                onChange={e => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                style={s.discountInput}
              />
            </div>

            {/* Totals */}
            <div style={s.totals}>
              <div style={s.totalRow}><span>Subtotal</span><span>{subtotal.toLocaleString()} Birr</span></div>
              <div style={s.totalRow}><span>Discount ({discount}%)</span><span>- {discountAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })} Birr</span></div>
              <div style={s.totalRow}><span>VAT (15%)</span><span>{vatAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })} Birr</span></div>
              <div style={{ ...s.totalRow, ...s.totalFinal }}>
                <span>Total</span>
                <span>{total.toLocaleString(undefined, { maximumFractionDigits: 2 })} Birr</span>
              </div>
              {total > 50000 && (
                <div style={s.approvalNote}>This sale requires manager approval (over 50,000 Birr)</div>
              )}
            </div>

            {/* Note */}
            <textarea
              placeholder="Note (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              style={s.textarea}
              rows={2}
            />

            {error && <div style={s.errorBox}>{error}</div>}

            <button
              style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
              disabled={submitting || cart.length === 0}
              onClick={handleSubmit}
            >
              {submitting ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const s = {
  title:          { fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0 0 1.5rem' },
  layout:         { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' },
  left:           { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' },
  searchWrap:     { position: 'relative', padding: '1rem', borderBottom: '1px solid #e5e7eb' },
  searchIcon:     { position: 'absolute', left: '1.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  searchInput:    { width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  productList:    { maxHeight: '520px', overflowY: 'auto' },
  productRow:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' },
  productName:    { fontWeight: '600', fontSize: '0.9rem', color: '#111827' },
  productMeta:    { fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' },
  productRight:   { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  price:          { fontSize: '0.88rem', fontWeight: '600', color: '#1a7a4a' },
  addBtn:         { background: '#1a7a4a', border: 'none', borderRadius: '6px', color: '#fff', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  addBtnDisabled: { background: '#d1d5db', cursor: 'not-allowed' },
  empty:          { padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' },
  right:          {},
  card:           { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  cardTitle:      { fontSize: '1rem', fontWeight: '700', color: '#111827', margin: '0 0 1rem' },
  cartRow:        { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' },
  cartInfo:       { flex: 1, minWidth: 0 },
  cartName:       { fontSize: '0.85rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cartSub:        { fontSize: '0.75rem', color: '#6b7280' },
  qtyInput:       { width: '52px', padding: '4px 6px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', outline: 'none' },
  lineTotal:      { fontSize: '0.85rem', fontWeight: '600', color: '#111827', minWidth: '70px', textAlign: 'right' },
  removeBtn:      { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex' },
  discountRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0 0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' },
  label:          { fontSize: '0.85rem', fontWeight: '600', color: '#374151' },
  discountInput:  { width: '80px', padding: '4px 8px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', textAlign: 'center' },
  totals:         { borderTop: '1px solid #e5e7eb', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' },
  totalRow:       { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' },
  totalFinal:     { fontWeight: '700', fontSize: '1rem', color: '#111827', paddingTop: '6px', borderTop: '1px solid #e5e7eb', marginTop: '4px' },
  approvalNote:   { background: '#fef9c3', color: '#92400e', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', marginTop: '6px' },
  textarea:       { width: '100%', marginTop: '1rem', padding: '0.6rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', resize: 'none', boxSizing: 'border-box' },
  errorBox:       { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.82rem', marginTop: '0.75rem' },
  submitBtn:      { width: '100%', marginTop: '1rem', padding: '0.75rem', background: 'linear-gradient(135deg,#1a7a4a,#22c55e)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  successBox:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center' },
  successTitle:   { fontSize: '1.4rem', fontWeight: '700', color: '#111827', margin: 0 },
  successSub:     { color: '#6b7280', margin: 0 },
  pendingNote:    { background: '#fef9c3', color: '#92400e', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.88rem' },
  newBtn:         { marginTop: '0.5rem', padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#1a7a4a,#22c55e)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
};
