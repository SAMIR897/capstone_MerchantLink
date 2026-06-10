import type { FC } from 'react';
import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import idl from '../idl/merchant_link.json';
import { Coins, CreditCard, Rocket, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';

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
        <div className="animate-slide-up stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Top Stats Row */}
            <div className="grid-2">
                <div className="glass-panel stat-card">
                    <div className="stat-icon">
                        <CreditCard size={32} />
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Gift Cards Sold</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '4px' }} className="text-gradient">
                            0
                        </div>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div className="stat-icon secondary">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Soulbound Points Issued</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', marginTop: '4px' }} className="text-gradient">
                            0
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.6rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Rocket color="var(--primary)" /> Initialize Protocol
                    </h2>
                    <p className="subtitle">
                        Deploy your custom MerchantLink instance. This creates your exclusive Gift Card Mint and Non-Transferable Loyalty Mint directly on the Solana blockchain.
                    </p>
                </div>

                <div className="grid-2" style={{ marginBottom: '32px' }}>
                    <div>
                        <label className="input-label">Accepted Token Mint (USDC)</label>
                        <div className="input-group">
                            <Coins className="input-icon" size={20} />
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Devnet Mint Address"
                                value={usdcMint}
                                onChange={(e) => setUsdcMint(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Gift Card Price (USDC)</label>
                        <div className="input-group">
                            <Wallet className="input-icon" size={20} />
                            <input 
                                type="number" 
                                className="input-field" 
                                placeholder="e.g. 5"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    className={`btn ${!wallet.connected ? 'btn-disabled' : 'btn-primary'}`} 
                    style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
                    onClick={initializeProtocol}
                    disabled={!wallet.connected || isLoading}
                >
                    {isLoading ? (
                        <>Processing Transaction...</>
                    ) : !wallet.connected ? (
                        <>Connect Wallet First</>
                    ) : (
                        <>Launch Protocol on Solana</>
                    )}
                </button>

                {txHash && (
                    <div className="animate-slide-up" style={{ marginTop: '24px', padding: '16px 20px', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <CheckCircle2 color="var(--secondary)" size={28} />
                        <div>
                            <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>Initialization Successful!</strong>
                            <div style={{ marginTop: '4px' }}>
                                <a href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>
                                    View Transaction on Explorer ↗
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
