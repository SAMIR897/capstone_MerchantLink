import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { InitializeProtocol } from './components/InitializeProtocol';
import { LoginScreen } from './components/LoginScreen';
import { UserOnboarding } from './components/UserOnboarding';
import type { UserProfile } from './components/UserOnboarding';
import { Home, Search, Activity, User, Wallet, Shield, MapPin, Settings } from 'lucide-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import type { ConfirmedSignatureInfo } from '@solana/web3.js';
import idl from './idl/merchant_link.json';

const App: FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { connected, publicKey } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { connection } = useConnection();
  const [realMerchants, setRealMerchants] = useState<any[]>([]);
  const [realActivity, setRealActivity] = useState<ConfirmedSignatureInfo[]>([]);

  useEffect(() => {
    if (activeTab === 'explore' && connected) {
      try {
        const provider = new AnchorProvider(connection, {} as any, {});
        const program = new Program(idl as any, provider);
        (program.account as any).merchantState.all().then((data: any[]) => {
          setRealMerchants(data);
        }).catch(console.error);
      } catch (e) { console.error(e) }
    } else if (activeTab === 'activity' && connected && publicKey) {
      connection.getSignaturesForAddress(publicKey, { limit: 10 })
        .then(sigs => setRealActivity(sigs))
        .catch(console.error);
    }
  }, [activeTab, connected, publicKey, connection]);


  // Load user profile from localStorage when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const savedProfile = localStorage.getItem(`merchant_link_user_${publicKey.toBase58()}`);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, [connected, publicKey]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    localStorage.setItem(`merchant_link_user_${profile.wallet}`, JSON.stringify(profile));
    setUserProfile(profile);
  };

  // If wallet is NOT connected, show the Login Screen
  if (!connected) {
    return (
      <>
        <div className="ambient-bg">
          <div className="ambient-orb" />
          <div className="ambient-orb" />
          <div className="ambient-orb" />
        </div>
        <div className="phone-frame">
          <LoginScreen />
        </div>
      </>
    );
  }

  // If connected but no profile, show Onboarding Screen
  if (connected && !userProfile) {
    return (
      <>
        <div className="ambient-bg">
          <div className="ambient-orb" />
          <div className="ambient-orb" />
          <div className="ambient-orb" />
        </div>
        <div className="phone-frame">
          <UserOnboarding onComplete={handleOnboardingComplete} />
        </div>
      </>
    );
  }

  const renderTabContent = () => {
    // Home tab ALWAYS shows MerchantDashboard and passes the user profile down
    if (activeTab === 'home') return <MerchantDashboard userProfile={userProfile} />;

    // Connected States for other tabs
    if (activeTab === 'explore') {
      return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ marginBottom: '8px' }}>Explore Deals</h2>
          {realMerchants.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No registered merchants found on Devnet.</div>
          ) : (
            realMerchants.map((merchant, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--primary-dim)' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {merchant.account.merchantAdmin.toString().slice(0, 12)}...
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Cards Sold: {merchant.account.cardsSold.toString()}
                  </p>
                </div>
                <MapPin size={20} color="var(--primary)" />
              </div>
            ))
          )}
        </div>
      );
    }

    if (activeTab === 'activity') {
      return (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ marginBottom: '8px' }}>Recent Activity</h2>
          <div className="glass-panel" style={{ padding: '16px' }}>
            {realActivity.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No recent activity found.</div>
            ) : (
              realActivity.map((tx, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: idx !== realActivity.length - 1 ? '16px' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ border: '1px solid white', padding: '10px', borderRadius: '12px', background: 'transparent' }}>
                      <Activity size={20} color="var(--text-main)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Transaction</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {tx.signature.slice(0, 16)}...
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.8rem' }}>
                    {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
              ))
            )}
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
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{userProfile?.username || 'User'}</div>
              <div style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '2px', textTransform: 'capitalize' }}>
                {userProfile?.role || 'Customer'}
              </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ marginBottom: '16px', color: '#FFD700', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} color="#FFD700" /> Account Settings</h4>
            
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
          
          {userProfile?.role === 'merchant' && <InitializeProtocol />}
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
            <Home size={18} />
            Home
            <span className="nav-tab-dot" />
          </button>
          <button
            className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            <Search size={18} />
            Explore
            <span className="nav-tab-dot" />
          </button>
          <button
            className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={18} />
            Activity
            <span className="nav-tab-dot" />
          </button>
          <button
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Profile
            <span className="nav-tab-dot" />
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
