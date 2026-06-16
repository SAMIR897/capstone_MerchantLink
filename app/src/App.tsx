import { useState } from 'react';
import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { Home, Search, Activity, User } from 'lucide-react';

const App: FC = () => {
  const [activeTab, setActiveTab] = useState('home');

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
          {activeTab === 'home' && <MerchantDashboard />}

          {activeTab === 'explore' && (
            <div className="placeholder-tab animate-slide-up">
              <div className="placeholder-tab-icon">
                <Search size={26} />
              </div>
              <h3>Explore</h3>
              <p>Discover merchants and gift card deals near you</p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="placeholder-tab animate-slide-up">
              <div className="placeholder-tab-icon">
                <Activity size={26} />
              </div>
              <h3>Activity</h3>
              <p>Your transaction history and loyalty rewards</p>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="placeholder-tab animate-slide-up">
              <div className="placeholder-tab-icon">
                <User size={26} />
              </div>
              <h3>Profile</h3>
              <p>Manage your wallet and account settings</p>
            </div>
          )}
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
