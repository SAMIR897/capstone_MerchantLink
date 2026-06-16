import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const LoginScreen: FC = () => {
    return (
        <div className="login-screen">
            {/* Corner Frames */}
            <div className="corner-frame top-left" />
            <div className="corner-frame top-right" />
            <div className="corner-frame bottom-left" />
            <div className="corner-frame bottom-right" />

            <img 
                src="/additionallog.png" 
                alt="Additional Logo" 
                className="login-top-logo"
            />

            {/* Center Content */}
            <div className="login-content">
                <img 
                    src="/loading1.png" 
                    alt="MerchantLink" 
                    className="login-logo"
                />
                <p className="login-tagline">Your decentralized gift card platform on Solana</p>
                <WalletMultiButton />
            </div>
        </div>
    );
};

