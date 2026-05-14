import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ClipboardList, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/products',  icon: Package,         label: 'Products'   },
  { to: '/new-sale',  icon: ShoppingCart,    label: 'New Sale'   },
  { to: '/my-sales',  icon: ClipboardList,   label: 'My Sales'   },
];

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    logout();
    navigate('/login');
  };

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandIcon}>S</div>
          <span style={s.brandText}>Semre</span>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={s.userSection}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.name}</div>
            <div style={s.userRole}>Sales Officer</div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main style={s.main}>{children}</main>
    </div>
  );
}

const s = {
  root:        { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f3f4f6' },
  sidebar:     { width: '220px', background: 'linear-gradient(180deg,#0f4c2a 0%,#1a7a4a 100%)', display: 'flex', flexDirection: 'column', padding: '1.5rem 0.75rem', position: 'fixed', top: 0, left: 0, bottom: 0 },
  brand:       { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', paddingLeft: '0.5rem' },
  brandIcon:   { width: '34px', height: '34px', borderRadius: '8px', background: '#fff', color: '#1a7a4a', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandText:   { color: '#fff', fontWeight: '700', fontSize: '1.1rem' },
  nav:         { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem:     { display: 'flex', alignItems: 'center', gap: '10px', color: '#bbf7d0', padding: '0.6rem 0.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', transition: 'background 0.15s' },
  navActive:   { background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: '600' },
  userSection: { borderTop: '1px solid #2d9e63', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' },
  avatar:      { width: '32px', height: '32px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 },
  userInfo:    { flex: 1, overflow: 'hidden' },
  userName:    { color: '#fff', fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole:    { color: '#86efac', fontSize: '0.72rem' },
  logoutBtn:   { background: 'none', border: 'none', color: '#86efac', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  main:        { marginLeft: '220px', flex: 1, padding: '2rem' },
};
