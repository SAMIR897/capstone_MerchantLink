import type { FC } from 'react';
import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import idl from '../idl/merchant_link.json';
import { Coins, Wallet, Rocket, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

const PROGRAM_ID = new PublicKey((idl as any).address || "Do2bnhgFrAxQbGB4woahzBKyQZm4efHaDnk2FQzSVsJh");

export const MerchantDashboard: FC = () => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [usdcMint, setUsdcMint] = useState<string>('');
    const [price, setPrice] = useState<string>('5');
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const initializeProtocol = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            setIsLoading(true);
            setTxHash(null);

            const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: 'confirmed' });
            const program = new Program(idl as any, provider);

            const usdcMintPubkey = new PublicKey(usdcMint);
            const giftCardMint = Keypair.generate();
            const loyaltyMint = Keypair.generate();

            // Derive PDAs
            const [merchantStatePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("merchant"), wallet.publicKey.toBuffer()],
                PROGRAM_ID
            );

            // Get ATAs
            const merchantUsdcAta = getAssociatedTokenAddressSync(
                usdcMintPubkey,
                wallet.publicKey,
                false,
                TOKEN_PROGRAM_ID
            );

            // Gift card price in smallest units (assume 6 decimals for USDC)
            const priceInUnits = new BN(parseFloat(price) * 1_000_000);

            const tx = await program.methods.initializeMerchant(priceInUnits)
                .accounts({
                    merchantAdmin: wallet.publicKey,
                    merchantState: merchantStatePda,
                    giftCardMint: giftCardMint.publicKey,
                    loyaltyMint: loyaltyMint.publicKey,
                    usdcMint: usdcMintPubkey,
                    merchantUsdcAta: merchantUsdcAta,
                    tokenProgram2022: TOKEN_2022_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .signers([giftCardMint, loyaltyMint])
                .rpc();

            setTxHash(tx);
            console.log("Tx Successful: ", tx);
            
        } catch (error) {
            console.error("Initialization Failed:", error);
            alert("Failed to initialize protocol. See console for details.");
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

            {/* Initialize Protocol */}
            <div className="glass-panel animate-slide-up stagger-4" style={{ padding: '24px' }}>
                <div className="section-header">
                    <Rocket size={20} color="var(--primary)" />
                    <h3 className="section-title">Initialize Protocol</h3>
                    <span className="section-badge">On-chain</span>
                </div>

                <p className="section-desc">
                    Deploy your MerchantLink instance with a custom Gift Card Mint and
                    Non-Transferable Loyalty Mint on Solana.
                </p>

                <div className="form-group">
                    <label className="input-label">Token Mint (USDC)</label>
                    <div className="input-group">
                        <Coins className="input-icon" size={18} />
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Devnet Mint Address"
                            value={usdcMint}
                            onChange={(e) => setUsdcMint(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="input-label">Gift Card Price (USDC)</label>
                    <div className="input-group">
                        <Wallet className="input-icon" size={18} />
                        <input 
                            type="number" 
                            className="input-field" 
                            placeholder="e.g. 5"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    className={`btn ${!wallet.connected ? 'btn-disabled' : 'btn-primary'}`} 
                    style={{ width: '100%', height: '50px', fontSize: '0.95rem', marginTop: '4px' }}
                    onClick={initializeProtocol}
                    disabled={!wallet.connected || isLoading}
                >
                    {isLoading ? (
                        <>Processing...</>
                    ) : !wallet.connected ? (
                        <>Connect Wallet First</>
                    ) : (
                        <><Sparkles size={18} /> Launch Protocol</>
                    )}
                </button>

                {txHash && (
                    <div className="success-banner">
                        <CheckCircle2 color="var(--primary)" size={22} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <div>
                            <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                Initialization Successful!
                            </strong>
                            <div style={{ marginTop: '4px' }}>
                                <a 
                                    href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                >
                                    View on Solana Explorer ↗
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
