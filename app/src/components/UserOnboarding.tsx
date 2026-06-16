import type { FC } from 'react';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { User, Store } from 'lucide-react';

export interface UserProfile {
    wallet: string;
    username: string;
    role: 'customer' | 'merchant';
}

interface UserOnboardingProps {
    onComplete: (profile: UserProfile) => void;
}

export const UserOnboarding: FC<UserOnboardingProps> = ({ onComplete }) => {
    const { publicKey } = useWallet();
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<'customer' | 'merchant' | null>(null);

    const handleComplete = () => {
        if (!publicKey || !username.trim() || !role) return;
        
        onComplete({
            wallet: publicKey.toBase58(),
            username: username.trim(),
            role: role
        });
    };

    return (
        <div className="onboarding-screen">
            {/* Corner Frames */}
            <div className="corner-frame top-left" />
            <div className="corner-frame top-right" />
            <div className="corner-frame bottom-left" />
            <div className="corner-frame bottom-right" />

            <div className="onboarding-content animate-slide-up">
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', textAlign: 'center' }}>Welcome to MerchantLink</h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px', fontSize: '0.95rem' }}>
                    Set up your permanent identity on the platform.
                </p>

                <div className="form-group" style={{ width: '100%', marginBottom: '24px' }}>
                    <label className="input-label">Choose a Username</label>
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. CryptoKing99"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ height: '54px', fontSize: '1.1rem' }}
                    />
                </div>

                <label className="input-label" style={{ alignSelf: 'flex-start', marginBottom: '12px' }}>Select Your Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginBottom: '32px' }}>
                    
                    {/* Customer Card */}
                    <div 
                        className={`role-card ${role === 'customer' ? 'selected' : ''}`}
                        onClick={() => setRole('customer')}
                    >
                        <User size={32} className="role-icon" />
                        <h4 style={{ margin: '8px 0 4px 0' }}>Customer</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                            Buy and redeem gift cards
                        </p>
                    </div>

                    {/* Merchant Card */}
                    <div 
                        className={`role-card ${role === 'merchant' ? 'selected' : ''}`}
                        onClick={() => setRole('merchant')}
                    >
                        <Store size={32} className="role-icon" />
                        <h4 style={{ margin: '8px 0 4px 0' }}>Merchant</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                            Resell cards & get 20% off
                        </p>
                    </div>
                </div>

                <button 
                    className={`btn ${(!username.trim() || !role) ? 'btn-disabled' : 'btn-primary'}`}
                    style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
                    onClick={handleComplete}
                    disabled={!username.trim() || !role}
                >
                    Complete Registration
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
                    * Roles are permanently tied to your wallet.
                </p>
            </div>
        </div>
    );
};
