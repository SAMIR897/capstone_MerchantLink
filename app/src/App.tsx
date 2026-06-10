import type { FC } from 'react';
import { Navbar } from './components/Navbar';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { LayoutDashboard, Store, Settings, LogOut } from 'lucide-react';

const App: FC = () => {
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px' }}>
          <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '24px', color: '#000',
              boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)'
          }}>
              M
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>MerchantLink</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
            <LayoutDashboard size={20} color="var(--secondary)" />
            <span style={{ fontWeight: 500 }}>Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} className="sidebar-link">
            <Store size={20} />
            <span style={{ fontWeight: 500 }}>My Storefront</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} className="sidebar-link">
            <Settings size={20} />
            <span style={{ fontWeight: 500 }}>Settings</span>
          </div>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <LogOut size={20} />
            <span style={{ fontWeight: 500 }}>Disconnect</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Navbar />
        <MerchantDashboard />
      </main>
    </div>
  );
}

export default App;
