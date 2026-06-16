import type { FC } from 'react';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Store, Send, CheckCircle2, CreditCard, ShieldCheck, Gift, CircleCheck } from 'lucide-react';

export const MerchantDashboard: FC = () => {
    const wallet = useWallet();

    const [actionType, setActionType] = useState<'buy' | 'issue'>('buy');
    
    // Buy State
    const [buySource, setBuySource] = useState<'platform' | 'merchant'>('platform');
    const [merchantAddress, setMerchantAddress] = useState('');
    
    // Issue State
    const [issueAddress, setIssueAddress] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [mockUser, setMockUser] = useState<{username: string, loyaltyScore: number} | null>(null);
    const [issueSource, setIssueSource] = useState<'collection' | 'buy_merchant' | 'buy_platform'>('collection');
    
    // Common State
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const verifyUser = () => {
        if (!issueAddress) return;
        setIsLoading(true);
        // Mocking an API call
        setTimeout(() => {
            setMockUser({ username: 'CryptoKing', loyaltyScore: 450 });
            setIsVerified(true);
            setIsLoading(false);
        }, 600);
    };

    const handleTransaction = () => {
        setIsLoading(true);
        // Mocking transaction delay
        setTimeout(() => {
            setIsLoading(false);
            setSuccessMsg('Transaction Successful!');
            setTimeout(() => setSuccessMsg(''), 4000);
        }, 1500);
    };

    return (
        <div className="animate-slide-up stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Stats Row */}
            <div className="stats-scroll animate-slide-up stagger-3">
                <div className="glass-panel stat-card">
                    <div className="stat-icon primary">
                        <CreditCard size={22} />
                    </div>
                    <div>
                        <div className="stat-label">Gift Cards</div>
                        <div className="stat-value">0</div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div className="stat-icon secondary">
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <div className="stat-label">Loyalty Pts</div>
                        <div className="stat-value">0</div>
                    </div>
                </div>
            </div>

            {/* Get a New Gift */}
            <div className="glass-panel animate-slide-up stagger-4" style={{ padding: '24px' }}>
                <div className="section-header" style={{ marginBottom: '20px' }}>
                    <Gift size={22} color="var(--primary)" />
                    <h3 className="section-title">Get a New Gift</h3>
                </div>

                {/* Primary Action Toggle */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                    <button 
                        onClick={() => { setActionType('buy'); setSuccessMsg(''); }}
                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1px solid ${actionType === 'buy' ? 'var(--primary)' : 'var(--border)'}`, background: actionType === 'buy' ? 'var(--primary-dim)' : 'transparent', color: actionType === 'buy' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Buy Giftcard
                    </button>
                    <button 
                        onClick={() => { setActionType('issue'); setSuccessMsg(''); }}
                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1px solid ${actionType === 'issue' ? 'var(--secondary)' : 'var(--border)'}`, background: actionType === 'issue' ? 'rgba(0,229,255,0.1)' : 'transparent', color: actionType === 'issue' ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Issue a Gift Card
                    </button>
                </div>

                {/* BUY FLOW */}
                {actionType === 'buy' && (
                    <div className="animate-slide-up">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Purchase a new gift card for yourself. Choose the source below.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', border: '1px solid var(--border)', borderRadius: '12px', background: buySource === 'platform' ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'all 0.2s' }}>
                                <input type="radio" checked={buySource === 'platform'} onChange={() => setBuySource('platform')} style={{ accentColor: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Buy from The Platform</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', border: '1px solid var(--border)', borderRadius: '12px', background: buySource === 'merchant' ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'all 0.2s' }}>
                                <input type="radio" checked={buySource === 'merchant'} onChange={() => setBuySource('merchant')} style={{ accentColor: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Buy from Any Merchant</span>
                            </label>
                        </div>

                        {buySource === 'merchant' && (
                            <div className="form-group animate-slide-up" style={{ marginBottom: '20px' }}>
                                <label className="input-label">Merchant Address</label>
                                <div className="input-group">
                                    <Store className="input-icon" size={18} />
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        placeholder="Enter Merchant Wallet Address"
                                        value={merchantAddress}
                                        onChange={(e) => setMerchantAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <button 
                            className={`btn ${!wallet.connected ? 'btn-disabled' : 'btn-primary'}`} 
                            style={{ width: '100%', height: '50px', fontSize: '1rem', marginTop: '4px' }}
                            onClick={handleTransaction}
                            disabled={!wallet.connected || isLoading || (buySource === 'merchant' && !merchantAddress)}
                        >
                            {isLoading ? 'Processing...' : !wallet.connected ? 'Connect Wallet First' : 'Pay & Buy Giftcard'}
                        </button>
                    </div>
                )}

                {/* ISSUE FLOW */}
                {actionType === 'issue' && (
                    <div className="animate-slide-up">
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="input-label">Recipient Address</label>
                            <div className="input-group">
                                <Send className="input-icon" size={18} />
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Enter person's wallet address"
                                    value={issueAddress}
                                    onChange={(e) => {
                                        setIssueAddress(e.target.value);
                                        setIsVerified(false);
                                        setMockUser(null);
                                    }}
                                />
                            </div>
                        </div>

                        {!isVerified && (
                            <button 
                                className="btn" 
                                style={{ width: '100%', height: '44px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                                onClick={verifyUser}
                                disabled={!issueAddress || isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify User'}
                            </button>
                        )}

                        {isVerified && mockUser && (
                            <div className="animate-slide-up" style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '12px', marginBottom: '24px' }}>
                                    <CircleCheck size={24} color="var(--secondary)" />
                                    <div>
                                        <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>@{mockUser.username}</div>
                                        <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Loyalty Score: {mockUser.loyaltyScore} pts</div>
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
                                    Where would you like to issue the gift card from?
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0' }}>
                                        <input type="radio" checked={issueSource === 'collection'} onChange={() => setIssueSource('collection')} style={{ accentColor: 'var(--secondary)' }} />
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>From my Collection</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0' }}>
                                        <input type="radio" checked={issueSource === 'buy_platform'} onChange={() => setIssueSource('buy_platform')} style={{ accentColor: 'var(--secondary)' }} />
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Buy from The Platform</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 0' }}>
                                        <input type="radio" checked={issueSource === 'buy_merchant'} onChange={() => setIssueSource('buy_merchant')} style={{ accentColor: 'var(--secondary)' }} />
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Buy from Any Merchant</span>
                                    </label>
                                </div>

                                {issueSource === 'buy_merchant' && (
                                    <div className="form-group animate-slide-up" style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <label className="input-label" style={{ fontSize: '0.85rem' }}>Merchant Address</label>
                                        <div className="input-group">
                                            <Store className="input-icon" size={16} />
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                placeholder="Enter Merchant Address"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button 
                                    className={`btn ${!wallet.connected ? 'btn-disabled' : 'btn-primary'}`} 
                                    style={{ width: '100%', height: '50px', fontSize: '1rem', background: 'linear-gradient(135deg, var(--secondary), #00b0ff)' }}
                                    onClick={handleTransaction}
                                    disabled={!wallet.connected || isLoading}
                                >
                                    {isLoading ? 'Processing...' : !wallet.connected ? 'Connect Wallet First' : (issueSource === 'collection' ? 'Issue Giftcard' : 'Pay & Issue Giftcard')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {successMsg && (
                    <div className="success-banner animate-slide-up" style={{ marginTop: '20px' }}>
                        <CheckCircle2 color="var(--primary)" size={22} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <div>
                            <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                {successMsg}
                            </strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
