use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    burn, Burn, Mint, TokenAccount, TokenInterface,
};

use crate::events::GiftCardRedeemed;
use crate::state::MerchantState;

/// Consumer redeems their gift card in-store by burning the token.
/// Emits a GiftCardRedeemed event for off-chain webhook notification.
pub fn handler(ctx: Context<RedeemGiftCard>) -> Result<()> {
    // --- 1. Burn 1 Gift Card token from consumer's wallet ---
    burn(
        CpiContext::new(
            ctx.accounts.token_program_2022.key(),
            Burn {
                mint: ctx.accounts.gift_card_mint.to_account_info(),
                from: ctx.accounts.consumer_gift_card_ata.to_account_info(),
                authority: ctx.accounts.consumer.to_account_info(),
            },
        ),
        1, // Burn exactly 1 gift card
    )?;

    // --- 2. Update analytics ---
    let merchant_state = &mut ctx.accounts.merchant_state;
    merchant_state.cards_redeemed += 1;

    // --- 3. Emit event for off-chain webhook ---
    let clock = Clock::get()?;
    emit!(GiftCardRedeemed {
        merchant: merchant_state.admin,
        consumer: ctx.accounts.consumer.key(),
        timestamp: clock.unix_timestamp,
    });

    msg!("MerchantLink: Gift card redeemed successfully!");
    msg!("Consumer: {}", ctx.accounts.consumer.key());
    msg!("Merchant: {}", merchant_state.admin);

    Ok(())
}

#[derive(Accounts)]
pub struct RedeemGiftCard<'info> {
    /// The consumer redeeming the gift card
    #[account(mut)]
    pub consumer: Signer<'info>,

    /// The merchant state PDA
    #[account(
        mut,
        seeds = [b"merchant", merchant_state.admin.as_ref()],
        bump = merchant_state.bump,
    )]
    pub merchant_state: Account<'info, MerchantState>,

    /// Gift card mint (Token-2022) — supply decreases on burn
    #[account(
        mut,
        constraint = gift_card_mint.key() == merchant_state.gift_card_mint,
    )]
    pub gift_card_mint: InterfaceAccount<'info, Mint>,

    /// Consumer's gift card token account (being burned from)
    #[account(
        mut,
        associated_token::mint = gift_card_mint,
        associated_token::authority = consumer,
        associated_token::token_program = token_program_2022,
    )]
    pub consumer_gift_card_ata: InterfaceAccount<'info, TokenAccount>,

    /// Token-2022 program
    pub token_program_2022: Interface<'info, TokenInterface>,
}
