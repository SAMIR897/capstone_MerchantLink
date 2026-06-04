use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MerchantState {
    /// The merchant's admin wallet (signer for admin actions)
    pub admin: Pubkey,
    /// The accepted USDC mint
    pub usdc_mint: Pubkey,
    /// The merchant's USDC token account to receive payments
    pub usdc_token_account: Pubkey,
    /// The Token-2022 mint for gift cards
    pub gift_card_mint: Pubkey,
    /// The Token-2022 mint for loyalty points (NonTransferable)
    pub loyalty_mint: Pubkey,
    /// Price of a gift card in USDC (6 decimals, e.g. 5_000_000 = $5)
    pub gift_card_price: u64,
    /// Total gift cards sold
    pub cards_sold: u64,
    /// Total gift cards redeemed
    pub cards_redeemed: u64,
    /// PDA bump seed
    pub bump: u8,
}
