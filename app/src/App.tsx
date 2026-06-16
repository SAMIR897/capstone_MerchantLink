import { useState } from 'react';
import type { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { Home, Search, Activity, User, ArrowUpRight, ArrowDownLeft, Wallet, Shield, History, MapPin } from 'lucide-react';

const App: FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { connected } = useWallet();

  const renderTabContent = () => {
    // Home tab ALWAYS shows MerchantDashboard (since it handles its own wallet connection state)
    if (activeTab === 'home') return <MerchantDashboard />;

    // For all other tabs, if wallet is not connected, show Connect Wallet button in the middle
    if (!connected) {
      return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
          <Wallet size={56} color="var(--primary)" style={{ opacity: 0.3 }} />
          <h3 style={{ color: 'var(--accent)', textAlign: 'center', fontWeight: 700 }}>
            Connect to view {activeTab}
          </h3>
          <p style={{ color: 'var(--primary)', textAlign: 'center', fontSize: '0.9rem', maxWidth: '250px', fontWeight: 500 }}>
            Please connect your Solana wallet to access your profile and activity.
          </p>
          <div style={{ marginTop: '10px' }}>
            <WalletMultiButton />
          </div>
        </div>
      );
    }

    // Connected States for other tabs
    if (activeTab === 'explore') {
      return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ marginBottom: '8px' }}>Explore Deals</h2>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#e88a1a' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Sushi Master</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>10% off Gift Cards</p>
            </div>
            <MapPin size={20} color="var(--primary)" />
          </div>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#ff6b2c' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Coffee Co.</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Double Loyalty Pts</p>
            </div>
            <MapPin size={20} color="var(--primary)" />
          </div>
        </div>
      );
    }

    if (activeTab === 'activity') {
      return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ marginBottom: '8px' }}>Recent Activity</h2>
          <div className="glass-panel" style={{ padding: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--primary-dim)', padding: '10px', borderRadius: '12px' }}><ArrowUpRight size={20} color="var(--primary)" /></div>
                <div>
                  <div style={{ fontWeight: 600 }}>Purchased Gift Card</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To: 8xDf...9kQ2</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>- 25 USDC</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 229, 255, 0.12)', padding: '10px', borderRadius: '12px' }}><ArrowDownLeft size={20} color="var(--secondary)" /></div>
                <div>
                  <div style={{ fontWeight: 600 }}>Received Gift Card</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From: Bob's Cafe</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>+ $10 Card</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--accent-dim)', padding: '10px', borderRadius: '12px' }}><History size={20} color="var(--accent)" /></div>
                <div>
                  <div style={{ fontWeight: 600 }}>Redeemed Points</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sushi Master</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>- 500 Pts</div>
            </div>

          </div>
        </div>
      );
    }

    if (activeTab === 'profile') {
      return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ marginBottom: '4px' }}>Your Profile</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', border: '2px solid var(--primary)' }} />
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Merchant User</div>
              <div style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '2px' }}>Connected</div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Account Settings</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', cursor: 'pointer' }}>
              <Shield size={20} color="var(--text-main)" /> 
              <span style={{ flex: 1, fontWeight: 500 }}>Security & Privacy</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', cursor: 'pointer' }}>
              <Wallet size={20} color="var(--text-main)" /> 
              <span style={{ flex: 1, fontWeight: 500 }}>Manage Wallets</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
              <User size={20} color="var(--text-main)" /> 
              <span style={{ flex: 1, fontWeight: 500 }}>Personal Details</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {/* Ambient Background */}
      <div className="ambient-bg">
        <div className="ambient-orb" />
        <div className="ambient-orb" />
        <div className="ambient-orb" />
      </div>

      {/* Phone Frame */}
      <div className="phone-frame">
        {/* Header */}
        <div className="phone-header">
          <div className="phone-header-brand">
            <div className="phone-header-logo">M</div>
            <span className="phone-header-title">MerchantLink</span>
          </div>
          <WalletMultiButton />
        </div>

        {/* Scrollable Body */}
        <div className="phone-body">
          {renderTabContent()}
        </div>

        {/* Bottom Navigation */}
        <div className="phone-bottom-nav">
          <button
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={20} />
            Home
            <span className="nav-tab-dot" />
          </button>
          <button
            className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Search size={20} />
            Explore
            <span className="nav-tab-dot" />
          </button>
          <button
            className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={20} />
            Activity
            <span className="nav-tab-dot" />
          </button>
          <button
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            Profile
            <span className="nav-tab-dot" />
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
