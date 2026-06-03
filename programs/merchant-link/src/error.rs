use anchor_lang::prelude::*;

#[error_code]
pub enum MerchantLinkError {
    #[msg("Insufficient USDC balance to purchase gift card.")]
    InsufficientFunds,
    #[msg("No gift card tokens to redeem.")]
    NoGiftCardToRedeem,
    #[msg("Invalid USDC mint address.")]
    InvalidUsdcMint,
    #[msg("Unauthorized: only the merchant admin can perform this action.")]
    Unauthorized,
}
