use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        mint_to, transfer_checked, Mint, MintTo, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::state::MerchantState;
use crate::error::MerchantLinkError;
use crate::constants::MERCHANT_SEED;

/// Consumer pays USDC and receives a gift card + soulbound loyalty point.
/// This maps to User Stories 1, 2, and 3 in one atomic transaction.
pub fn handler(ctx: Context<BuyGiftCard>) -> Result<()> {
    let merchant_state = &ctx.accounts.merchant_state;
    let price = merchant_state.gift_card_price;

    require!(
        ctx.accounts.consumer_usdc_ata.amount >= price,
        MerchantLinkError::InsufficientFunds
    );

    // --- 1. Transfer USDC from consumer → merchant ---
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.consumer_usdc_ata.to_account_info(),
                mint: ctx.accounts.usdc_mint.to_account_info(),
                to: ctx.accounts.merchant_usdc_ata.to_account_info(),
                authority: ctx.accounts.consumer.to_account_info(),
            },
        ),
        price,
        6, // USDC has 6 decimals
    )?;

    // --- 2. Mint 1 Gift Card token to consumer ---
    let seeds = &[
        MERCHANT_SEED,
        merchant_state.admin.as_ref(),
        &[merchant_state.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program_2022.key(),
            MintTo {
                mint: ctx.accounts.gift_card_mint.to_account_info(),
                to: ctx.accounts.consumer_gift_card_ata.to_account_info(),
                authority: ctx.accounts.merchant_state.to_account_info(),
            },
            signer_seeds,
        ),
        1, // Mint exactly 1 gift card
    )?;

    // --- 3. Mint 1 Loyalty Point token to consumer (soulbound) ---
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program_2022.key(),
            MintTo {
                mint: ctx.accounts.loyalty_mint.to_account_info(),
                to: ctx.accounts.consumer_loyalty_ata.to_account_info(),
                authority: ctx.accounts.merchant_state.to_account_info(),
            },
            signer_seeds,
        ),
        1, // Mint exactly 1 loyalty point
    )?;

    // --- 4. Update analytics ---
    let merchant_state = &mut ctx.accounts.merchant_state;
    merchant_state.cards_sold += 1;

    msg!("MerchantLink: Gift card purchased successfully!");
    msg!("Consumer: {}", ctx.accounts.consumer.key());
    msg!("USDC paid: {}", price);

    Ok(())
}

#[derive(Accounts)]
pub struct BuyGiftCard<'info> {
    /// The consumer buying the gift card
    #[account(mut)]
    pub consumer: Signer<'info>,

    /// The merchant state PDA (mint authority for gift cards and loyalty points)
    #[account(
        mut,
        seeds = [MERCHANT_SEED, merchant_state.admin.as_ref()],
        bump = merchant_state.bump,
    )]
    pub merchant_state: Box<Account<'info, MerchantState>>,

    // --- USDC accounts ---

    /// USDC mint
    #[account(
        constraint = usdc_mint.key() == merchant_state.usdc_mint @ MerchantLinkError::InvalidUsdcMint,
    )]
    pub usdc_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Consumer's USDC token account (source of payment)
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = consumer,
        associated_token::token_program = token_program,
    )]
    pub consumer_usdc_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Merchant's USDC token account (destination of payment)
    #[account(
        mut,
        constraint = merchant_usdc_ata.key() == merchant_state.usdc_token_account,
    )]
    pub merchant_usdc_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    // --- Gift Card accounts (Token-2022) ---

    /// Gift card mint (Token-2022)
    #[account(
        mut,
        constraint = gift_card_mint.key() == merchant_state.gift_card_mint,
    )]
    pub gift_card_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Consumer's gift card token account — created if it doesn't exist
    #[account(
        init_if_needed,
        payer = consumer,
        associated_token::mint = gift_card_mint,
        associated_token::authority = consumer,
        associated_token::token_program = token_program_2022,
    )]
    pub consumer_gift_card_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    // --- Loyalty Point accounts (Token-2022 + NonTransferable) ---

    /// Loyalty point mint (Token-2022, NonTransferable)
    #[account(
        mut,
        constraint = loyalty_mint.key() == merchant_state.loyalty_mint,
    )]
    pub loyalty_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Consumer's loyalty point token account — created if it doesn't exist
    #[account(
        init_if_needed,
        payer = consumer,
        associated_token::mint = loyalty_mint,
        associated_token::authority = consumer,
        associated_token::token_program = token_program_2022,
    )]
    pub consumer_loyalty_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    // --- Programs ---

    /// Token program for USDC transfers
    pub token_program: Interface<'info, TokenInterface>,

    /// Token-2022 program for gift card + loyalty minting
    pub token_program_2022: Interface<'info, TokenInterface>,

    /// Associated Token Program
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// System Program
    pub system_program: Program<'info, System>,
}
