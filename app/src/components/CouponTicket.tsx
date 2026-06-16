import type { FC } from 'react';

interface CouponTicketProps {
    solAmount: number;
}

export const CouponTicket: FC<CouponTicketProps> = ({ solAmount }) => {
    // Determine the color theme of the left pane based on the SOL amount, matching the screenshot's aesthetic
    const getTheme = (amount: number) => {
        if (amount >= 50) return { bg: '#ff4d00', isGradient: false };  // Solid Orange
        if (amount >= 20) return { bg: '#00b0ff', isGradient: false };  // Solid Cyan
        if (amount >= 10) return { bg: '#051221', isGradient: false };  // Deep Navy
        if (amount >= 5) return { bg: '#ff4d00', isGradient: false };   // Solid Orange
        if (amount >= 2) return { bg: '#00b0ff', isGradient: true };    // Split Cyan/Green
        return { bg: '#051221', isGradient: false }; // 1 SOL - Deep Navy
    };

    const theme = getTheme(solAmount);

    return (
        <svg 
            viewBox="0 0 320 180" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
        >
            <defs>
                {/* Outer clipping path for the main rounded rectangle and side cutouts */}
                <clipPath id="ticket-clip">
                    <path d="M 16 0 
                             L 304 0 
                             C 312.8 0 320 7.2 320 16 
                             L 320 75 
                             A 15 15 0 0 0 320 105 
                             L 320 164 
                             C 320 172.8 312.8 180 304 180 
                             L 16 180 
                             C 7.2 180 0 172.8 0 164 
                             L 0 105 
                             A 15 15 0 0 0 0 75 
                             L 0 16 
                             C 0 7.2 7.2 0 16 0 Z" />
                </clipPath>
                
                {/* Gradient for the "M" logo */}
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>

                {/* Gradient for dotted button border */}
                <linearGradient id="btn-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>

                {/* Background gradient if needed (e.g., for 2 SOL) */}
                {theme.isGradient && (
                    <linearGradient id="bg-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#00b0ff" />
                    </linearGradient>
                )}
            </defs>

            {/* Apply the ticket clipping shape to everything inside */}
            <g clipPath="url(#ticket-clip)">
                
                {/* ---- LEFT SIDE (DARK / COLOR PANE) ---- */}
                <rect x="0" y="0" width="100" height="180" fill={theme.isGradient ? "url(#bg-gradient)" : theme.bg} />
                
                {/* The "M" Logo */}
                <g transform="translate(30, 70)">
                    {/* Simplified "M" shape matching the design */}
                    <path d="M 0 20 L 0 5 L 12 15 L 20 2 L 32 15 L 40 5 L 40 20 L 32 12 L 20 20 L 12 12 Z" fill="url(#logo-gradient)" />
                </g>
                <text x="50" y="108" fill="#ffffff" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="700" textAnchor="middle" letterSpacing="0.05em">MerchantLink</text>


                {/* ---- RIGHT SIDE (WHITE PANE) ---- */}
                <rect x="100" y="0" width="220" height="180" fill="#ffffff" />
                
                {/* Solana Icon */}
                <g transform="translate(265, 20)">
                    <circle cx="15" cy="15" r="18" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                    <g transform="translate(9, 10)">
                        <path d="M 0 2 L 10 2 L 12 4 L 2 4 Z" fill="#14F195" />
                        <path d="M 2 7 L 12 7 L 10 9 L 0 9 Z" fill="#9945FF" />
                        <path d="M 0 12 L 10 12 L 12 14 L 2 14 Z" fill="#14F195" />
                    </g>
                </g>

                {/* Text Content */}
                <text x="125" y="65" fill="#0f172a" fontSize="30" fontFamily="Inter, sans-serif" fontWeight="900">{solAmount} SOLANA</text>
                <text x="125" y="85" fill="#64748b" fontSize="12" fontFamily="Inter, sans-serif">Claim your {solAmount} SOL reward.</text>

                {/* Redeem Now Button (Dotted) */}
                <g transform="translate(125, 120)">
                    <rect x="0" y="0" width="160" height="32" rx="16" fill="#ffffff" stroke="url(#btn-gradient)" strokeWidth="1.5" strokeDasharray="4 4" />
                    <text x="80" y="20" fill="#475569" fontSize="11" fontFamily="Inter, sans-serif" fontWeight="600" textAnchor="middle">Redeem Now</text>
                </g>

            </g>

            {/* Dotted Perforation Line (overlays the background to look like a separation) */}
            <line x1="100" y1="0" x2="100" y2="180" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />
        </svg>
    );
};
