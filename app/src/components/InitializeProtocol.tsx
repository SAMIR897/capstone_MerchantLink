import type { FC } from 'react';
import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Coins, Wallet, Rocket, Sparkles } from 'lucide-react';
import idl from '../idl/merchant_link.json';

const PROGRAM_ID = new PublicKey((idl as any).address || "Do2bnhgFrAxQbGB4woahzBKyQZm4efHaDnk2FQzSVsJh");

export const InitializeProtocol: FC = () => {
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
        <div className="glass-panel" style={{ padding: '20px', marginTop: '20px' }}>
            <div className="section-header">
                <Rocket size={20} color="var(--primary)" />
                <h3 className="section-title">Initialize Protocol</h3>
                <span className="section-badge">Admin</span>
            </div>

            <p className="section-desc" style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 'bold' }}>
                Deploy your MerchantLink instance. This makes you the owner of a new merchant dApp instance!
            </p>

            <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="input-label" style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 'bold' }}>Token Mint (USDC)</label>
                <div className="input-group">
                    <Coins className="input-icon" size={16} />
                    <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Devnet Mint Address"
                        value={usdcMint}
                        onChange={(e) => setUsdcMint(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '10px 10px 10px 38px' }}
                    />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="input-label" style={{ fontSize: '0.8rem', color: '#FFFFFF', fontWeight: 'bold' }}>Gift Card Price (USDC)</label>
                <div className="input-group">
                    <Wallet className="input-icon" size={16} />
                    <input 
                        type="number" 
                        className="input-field" 
                        placeholder="e.g. 5"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '10px 10px 10px 38px' }}
                    />
                </div>
            </div>

            <button 
                className={`btn ${!wallet.connected ? 'btn-disabled' : 'btn-primary'}`} 
                style={{ width: '100%', height: '44px', fontSize: '0.9rem' }}
                onClick={initializeProtocol}
                disabled={!wallet.connected || isLoading}
            >
                {isLoading ? 'Deploying...' : !wallet.connected ? 'Connect Wallet First' : <><Sparkles size={16} /> Launch Protocol</>}
            </button>
            
            {txHash && (
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#00e676', textAlign: 'center', wordBreak: 'break-all' }}>
                    Success! Hash: {txHash}
                </div>
            )}
        </div>
    );
};
