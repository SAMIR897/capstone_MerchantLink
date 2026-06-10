import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const Navbar: FC = () => {
    return (
        <nav style={{ padding: '24px 0', marginBottom: '40px' }}>
            <div className="container flex-between animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '20px', color: 'black'
                    }}>
                        M
                    </div>
                    <h2 className="text-gradient" style={{ margin: 0 }}>MerchantLink</h2>
                </div>
                
                <WalletMultiButton />
            </div>
        </nav>
    );
};
