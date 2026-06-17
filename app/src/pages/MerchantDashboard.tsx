import { useState } from 'react';
import type { FC } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Store, Send, CheckCircle2, CreditCard, ShieldCheck, Gift, CircleCheck } from 'lucide-react';
import idl from '../idl/merchant_link.json';
import type { UserProfile } from '../components/UserOnboarding';

const PROGRAM_ID = new PublicKey((idl as any).address || "Do2bnhgFrAxQbGB4woahzBKyQZm4efHaDnk2FQzSVsJh");

// Placeholder for "The Platform" Merchant Admin Wallet
const PLATFORM_ADMIN_PUBKEY = new PublicKey("11111111111111111111111111111111"); 

interface MerchantDashboardProps {
    userProfile: UserProfile | null;
}

export const MerchantDashboard: FC<MerchantDashboardProps> = ({ userProfile }) => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [actionType, setActionType] = useState<'buy' | 'issue'>('buy');
    
    // Buy State
    const [buySource, setBuySource] = useState<'platform' | 'merchant'>('platform');
    const [merchantAddress, setMerchantAddress] = useState('');
    const [inputAmount, setInputAmount] = useState<number | ''>('');
    const [flashCoupons, setFlashCoupons] = useState<number[] | null>(null);

    const getCouponBreakdown = (amount: number) => {
        let remaining = amount;
        const breakdown: number[] = [];
        const denoms = [100, 50, 20, 10, 5, 2, 1];
        for (const d of denoms) {
            while (remaining >= d) {
                breakdown.push(d);
                remaining -= d;
            }
        }
        return breakdown;
    };

    // Removed unused coupons array
    
    // Issue State
    const [issueAddress, setIssueAddress] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [mockUser, setMockUser] = useState<{username: string, loyaltyScore: number} | null>(null);
    const [issueSource, setIssueSource] = useState<'collection' | 'buy_merchant' | 'buy_platform'>('collection');
    const [issueMerchantAddress, setIssueMerchantAddress] = useState('');
    
    // Common State
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [txHash, setTxHash] = useState<string | null>(null);

    const verifyUser = () => {
        if (!issueAddress) return;
        setIsLoading(true);
        // Mocking an API call for User verification
        setTimeout(() => {
            setMockUser({ username: 'CryptoKing', loyaltyScore: 450 });
            setIsVerified(true);
            setIsLoading(false);
        }, 600);
    };

    const handleTransaction = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) return;

        try {
            setIsLoading(true);
            setSuccessMsg('');
            setTxHash(null);

            const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: 'confirmed' });
            const program = new Program(idl as any, provider);

            if (actionType === 'buy') {
                if (!inputAmount || inputAmount <= 0) {
                    alert("Please enter a valid amount");
                    setIsLoading(false);
                    return;
                }
                
                const breakdown = getCouponBreakdown(Number(inputAmount));

                // Determine Merchant Admin Pubkey
                let adminPubkey: PublicKey;
                try {
                    adminPubkey = buySource === 'platform' ? PLATFORM_ADMIN_PUBKEY : new PublicKey(merchantAddress);
                } catch (e) {
                    alert("Invalid Merchant Address!");
                    setIsLoading(false);
                    return;
                }

                try {
                    // Fetch Merchant State
                    const [merchantStatePda] = PublicKey.findProgramAddressSync(
                        [Buffer.from("merchant"), adminPubkey.toBuffer()],
                        PROGRAM_ID
                    );
                    
                    const merchantState = await (program.account as any).merchantState.fetch(merchantStatePda);

                    // ATAs
                    const consumerUsdcAta = getAssociatedTokenAddressSync(merchantState.usdcMint, wallet.publicKey, false, TOKEN_PROGRAM_ID);
                    const consumerGiftCardAta = getAssociatedTokenAddressSync(merchantState.giftCardMint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
                    const consumerLoyaltyAta = getAssociatedTokenAddressSync(merchantState.loyaltyMint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);

                    // Execute buy_gift_card on the blockchain!
                    const tx = await program.methods.buyGiftCard()
                        .accounts({
                            consumer: wallet.publicKey,
                            merchantState: merchantStatePda,
                            usdcMint: merchantState.usdcMint,
                            consumerUsdcAta: consumerUsdcAta,
                            merchantUsdcAta: merchantState.usdcTokenAccount,
                            giftCardMint: merchantState.giftCardMint,
                            consumerGiftCardAta: consumerGiftCardAta,
                            loyaltyMint: merchantState.loyaltyMint,
                            consumerLoyaltyAta: consumerLoyaltyAta,
                            tokenProgram: TOKEN_PROGRAM_ID,
                            tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                            systemProgram: SystemProgram.programId,
                        })
                        .rpc();

                    setTxHash(tx);
                    setSuccessMsg(`Purchase complete! Breaking down into: ${breakdown.join(', ')} SOL`);
                    setFlashCoupons(breakdown);
                    setTimeout(() => { setSuccessMsg(''); setFlashCoupons(null); }, 4000);
                } catch (e: any) {
                    console.error("Transaction failed:", e);
                    alert("Transaction failed: " + e.message);
                } finally {
                    setIsLoading(false);
                }
                return;
            }

            // Mock Issue Flow
            if (actionType === 'issue') {
                setTimeout(() => {
                    setSuccessMsg('Gift card issued successfully!');
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setIsLoading(false);
                }, 1000);
            }


        } catch (error: any) {
            console.error("Tx Failed:", error);
            alert(`Transaction failed! ${error.message || 'Ensure the merchant address is correct and you have Devnet USDC.'}`);
        } finally {
            setIsLoading(false);
        }
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
                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1px solid ${actionType === 'buy' ? 'var(--primary)' : 'var(--border)'}`, background: actionType === 'buy' ? 'var(--primary-dim)' : 'transparent', color: actionType === 'buy' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Buy Giftcard
                    </button>
                    <button 
                        onClick={() => { setActionType('issue'); setSuccessMsg(''); }}
                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1px solid ${actionType === 'issue' ? 'var(--secondary)' : 'var(--border)'}`, background: actionType === 'issue' ? 'rgba(51,255,170,0.1)' : 'transparent', color: actionType === 'issue' ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        Issue a Gift Card
                    </button>
                </div>

                {/* BUY FLOW */}
                {actionType === 'buy' && (
                    <div className="animate-slide-up">
                        <p style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
                            Purchase a new gift card for yourself. Choose the source below.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '10px', background: buySource === 'platform' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
                                <input type="radio" checked={buySource === 'platform'} onChange={() => setBuySource('platform')} style={{ accentColor: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-main)', fontWeight: 400, fontSize: '0.8rem' }}>Buy from The Platform</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '10px', background: buySource === 'merchant' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
                                <input type="radio" checked={buySource === 'merchant'} onChange={() => setBuySource('merchant')} style={{ accentColor: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-main)', fontWeight: 400, fontSize: '0.8rem' }}>Buy from Any Merchant</span>
                            </label>
                        </div>

                        {buySource === 'platform' && (
                            <div className="animate-slide-up form-group" style={{ marginBottom: '20px' }}>
                                <label className="input-label" style={{ color: '#FFFFFF', fontWeight: 'bold', marginBottom: '12px', display: 'block' }}>Enter Amount (SOL)</label>
                                <div className="input-group">
                                    <input 
                                        type="number" 
                                        className="input-field" 
                                        placeholder="e.g. 13"
                                        value={inputAmount}
                                        onChange={(e) => setInputAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                        min="1"
                                    />
                                </div>
                                {userProfile?.role === 'merchant' && inputAmount && (
                                    <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Price: </span>
                                        <span style={{ textDecoration: 'line-through', color: 'var(--error)', opacity: 0.8, marginRight: '8px' }}>{inputAmount} SOL</span>
                                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{(Number(inputAmount) * 0.8).toFixed(2)} SOL</span>
                                    </div>
                                )}
                            </div>
                        )}

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
                            className={`btn ${(!wallet.connected && false) ? 'btn-disabled' : 'btn-primary'}`} 
                            style={{ width: '100%', height: '44px', fontSize: '0.85rem', marginTop: '4px' }}
                            onClick={handleTransaction}
                            disabled={isLoading || !inputAmount}
                        >
                            {isLoading ? 'Processing...' : 'Complete Purchase'}
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
                                style={{ width: '100%', height: '38px', background: 'var(--bg-card-elevated)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                                onClick={verifyUser}
                                disabled={!issueAddress || isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify User'}
                            </button>
                        )}

                        {isVerified && mockUser && (
                            <div className="animate-slide-up" style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(51,255,170,0.08)', border: '1px solid rgba(51,255,170,0.2)', borderRadius: '12px', marginBottom: '24px' }}>
                                    <CircleCheck size={24} color="var(--secondary)" />
                                    <div>
                                        <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>@{mockUser.username}</div>
                                        <div style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>Loyalty Score: {mockUser.loyaltyScore} pts</div>
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', lineHeight: 1.5 }}>
                                    Where would you like to issue the gift card from?
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 0' }}>
                                        <input type="radio" checked={issueSource === 'collection'} onChange={() => setIssueSource('collection')} style={{ accentColor: 'var(--secondary)' }} />
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>From my Collection</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 0' }}>
                                        <input type="radio" checked={issueSource === 'buy_platform'} onChange={() => setIssueSource('buy_platform')} style={{ accentColor: 'var(--secondary)' }} />
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>Buy from The Platform</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 0' }}>
                                        <input type="radio" checked={issueSource === 'buy_merchant'} onChange={() => setIssueSource('buy_merchant')} style={{ accentColor: 'var(--secondary)' }} />
                                        <span style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>Buy from Any Merchant</span>
                                    </label>
                                </div>

                                {issueSource === 'buy_merchant' && (
                                    <div className="form-group animate-slide-up" style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Merchant Address</label>
                                        <div className="input-group">
                                            <Store className="input-icon" size={16} />
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                placeholder="Enter Merchant Address"
                                                value={issueMerchantAddress}
                                                onChange={(e) => setIssueMerchantAddress(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <button 
                                    className={`btn ${!wallet.connected ? 'btn-disabled' : 'btn-primary'}`} 
                                    style={{ width: '100%', height: '44px', fontSize: '0.85rem', background: 'linear-gradient(135deg, var(--secondary), #00e5ff)', color: '#002211', fontWeight: 600, border: 'none' }}
                                    onClick={handleTransaction}
                                    disabled={!wallet.connected || isLoading || (issueSource === 'buy_merchant' && !issueMerchantAddress)}
                                >
                                    {isLoading ? 'Processing Tx...' : !wallet.connected ? 'Connect Wallet First' : (issueSource === 'collection' ? 'Issue Giftcard' : 'Pay & Issue Giftcard')}
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
                            {txHash && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-all' }}>
                                    Hash: {txHash}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Success Flash Overlay */}
            {flashCoupons && (
                <div className="flash-overlay">
                    <div className="flash-content animate-slide-up">
                        <div className="flash-header">
                            <CircleCheck size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
                            <h2 style={{ color: 'white', margin: 0 }}>Success!</h2>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '8px' }}>
                                You purchased {flashCoupons.reduce((a,b)=>a+b,0)} SOL worth of coupons
                            </p>
                        </div>
                        <div className="flash-coupons">
                            {flashCoupons.map((val, idx) => (
                                <img 
                                    key={idx} 
                                    src={`/${val}sol.png`} 
                                    alt={`${val} SOL`} 
                                    className="flash-coupon-img" 
                                    style={{ animationDelay: `${idx * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
