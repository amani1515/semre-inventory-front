import { useEffect, useState } from 'react';
import { Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { getProducts } from '../api/products';
import { getSales } from '../api/sales';
import useAuthStore from '../store/authStore';

export default function HomePage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ products: 0, todaySales: 0, todayRevenue: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getSales()])
      .then(([prodRes, salesRes]) => {
        const products = prodRes.data.total ?? prodRes.data.data?.length ?? 0;
        const sales = salesRes.data.data ?? [];
        const today = new Date().toISOString().slice(0, 10);
        const todaySales = sales.filter(s => s.created_at?.slice(0, 10) === today);
        setStats({
          products,
          todaySales: todaySales.length,
          todayRevenue: todaySales.filter(s => s.status === 'completed').reduce((sum, s) => sum + parseFloat(s.total), 0),
          pending: sales.filter(s => s.status === 'pending_approval').length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Products',   value: loading ? '...' : stats.products,                                          icon: Package,      color: '#dcfce7', iconColor: '#16a34a' },
    { label: "Today's Sales",    value: loading ? '...' : stats.todaySales,                                        icon: ShoppingCart, color: '#dbeafe', iconColor: '#2563eb' },
    { label: "Today's Revenue",  value: loading ? '...' : `${stats.todayRevenue.toLocaleString()} Birr`,           icon: TrendingUp,   color: '#f3e8ff', iconColor: '#9333ea' },
    { label: 'Pending Approval', value: loading ? '...' : stats.pending,                                           icon: Clock,        color: '#fef9c3', iconColor: '#ca8a04' },
  ];

  return (
    <Layout>
      <div style={s.header}>
        <h1 style={s.title}>Dashboard</h1>
        <span style={s.badge}>Sales Officer</span>
      </div>

      <div style={s.grid}>
        {cards.map(({ label, value, icon: Icon, color, iconColor }) => (
          <div key={label} style={s.card}>
            <div style={{ ...s.iconBox, background: color }}>
              <Icon size={22} color={iconColor} />
            </div>
            <div>
              <div style={s.cardLabel}>{label}</div>
              <div style={s.cardValue}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.welcome}>
        <h2 style={s.welcomeTitle}>Welcome back, {user?.name}</h2>
        <p style={s.welcomeSub}>Use the sidebar to manage sales and view products.</p>
      </div>
    </Layout>
  );
}

const s = {
  header:       { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  title:        { fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 },
  badge:        { background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card:         { background: '#fff', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  iconBox:      { width: '46px', height: '46px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardLabel:    { fontSize: '0.78rem', color: '#6b7280', marginBottom: '2px' },
  cardValue:    { fontSize: '1.3rem', fontWeight: '700', color: '#111827' },
  welcome:      { background: 'linear-gradient(135deg,#0f4c2a,#1a7a4a)', borderRadius: '12px', padding: '1.5rem 2rem' },
  welcomeTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: '0 0 4px' },
  welcomeSub:   { color: '#bbf7d0', fontSize: '0.88rem', margin: 0 },
};
