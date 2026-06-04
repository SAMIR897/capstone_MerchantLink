use anchor_lang::prelude::*;

/// Emitted when a consumer redeems a gift card in-store.
/// Off-chain webhooks listen for this event to notify the merchant's POS tablet.
#[event]
pub struct GiftCardRedeemed {
    pub merchant: Pubkey,
    pub consumer: Pubkey,
    pub gift_card_mint: Pubkey,
    pub timestamp: i64,
}
