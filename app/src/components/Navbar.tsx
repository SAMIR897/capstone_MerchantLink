import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const Navbar: FC = () => {
    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div className="animate-fade-in stagger-1">
                <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Overview</h1>
                <p className="subtitle">Welcome back! Here's what's happening with your protocol today.</p>
            </div>
            
            <div className="animate-fade-in stagger-2">
                <WalletMultiButton />
            </div>
        </nav>
    );
};
