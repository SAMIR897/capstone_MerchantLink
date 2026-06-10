import type { FC } from 'react';
import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import idl from '../idl/merchant_link.json';

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
            alert(`Success! Tx Hash: ${tx}`);
            
        } catch (error) {
            console.error("Initialization Failed:", error);
            alert("Failed to initialize protocol. See console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
            
            {/* Left Column: Form */}
            <div className="glass-panel">
                <h2 style={{ marginBottom: '8px' }}>Merchant Setup</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                    Initialize your MerchantLink profile to start issuing gift cards and soulbound loyalty points.
                </p>

                <div style={{ marginBottom: '20px' }}>
                    <label className="input-label">Devnet USDC Mint Address</label>
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Enter Token Mint Address..."
                        value={usdcMint}
                        onChange={(e) => setUsdcMint(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <label className="input-label">Gift Card Price (in USDC)</label>
                    <input 
                        type="number" 
                        className="input-field" 
                        placeholder="e.g. 5"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                <button 
                    className={`btn ${!wallet.connected ? 'btn-disabled' : 'btn-primary'}`} 
                    style={{ width: '100%' }}
                    onClick={initializeProtocol}
                    disabled={!wallet.connected || isLoading}
                >
                    {isLoading ? 'Processing...' : (!wallet.connected ? 'Connect Wallet First' : 'Initialize Protocol')}
                </button>

                {txHash && (
                    <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0, 245, 255, 0.1)', border: '1px solid var(--secondary)', borderRadius: '8px', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                        <strong style={{ color: 'var(--secondary)' }}>Success!</strong><br />
                        <a href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                            View on Solana Explorer ↗
                        </a>
                    </div>
                )}
            </div>

            {/* Right Column: Stats (Mocked for Phase 1) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Gift Cards Sold</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '700', marginTop: '10px' }} className="text-gradient">
                        --
                    </div>
                </div>

                <div className="glass-panel">
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Loyalty Points Issued</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '700', marginTop: '10px' }} className="text-gradient">
                        --
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Soulbound (Non-Transferable)
                    </div>
                </div>
            </div>

        </div>
    );
};
