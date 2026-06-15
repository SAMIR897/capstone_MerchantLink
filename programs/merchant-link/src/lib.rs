#![allow(clippy::diverging_sub_expression)]
pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Do2bnhgFrAxQbGB4woahzBKyQZm4efHaDnk2FQzSVsJh");

#[program]
pub mod merchant_link {
    use super::*;

    /// Initialize a new merchant profile with gift card and loyalty mints
    pub fn initialize_merchant(
        ctx: Context<InitializeMerchant>,
        gift_card_price: u64,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, gift_card_price)
    }

    /// Consumer purchases a gift card with USDC and receives a loyalty point
    pub fn buy_gift_card(ctx: Context<BuyGiftCard>) -> Result<()> {
        instructions::buy_gift_card::handler(ctx)
    }

    /// Consumer redeems a gift card in-store (burns token, emits event)
    pub fn redeem_gift_card(ctx: Context<RedeemGiftCard>) -> Result<()> {
        instructions::redeem_gift_card::handler(ctx)
    }
}
