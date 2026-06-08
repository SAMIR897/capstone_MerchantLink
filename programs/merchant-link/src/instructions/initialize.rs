use anchor_lang::prelude::*;
use anchor_lang::system_program::{create_account, CreateAccount};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022_extensions::non_transferable_mint_initialize,
    token_interface::{
        initialize_mint2, InitializeMint2, TokenAccount, TokenInterface,
    },
};

use anchor_spl::token_2022::spl_token_2022::{extension::ExtensionType, state::Mint as TokenMint};
use anchor_lang::solana_program::program_pack::Pack;

use crate::state::MerchantState;
use crate::constants::MERCHANT_SEED;

/// Initializes a new merchant profile with two Token-2022 mints:
/// - A standard gift card mint
/// - A loyalty point mint with the NonTransferable extension (soulbound)
pub fn handler(
    ctx: Context<InitializeMerchant>,
    gift_card_price: u64,
) -> Result<()> {
    let merchant_state_key = ctx.accounts.merchant_state.key();
    let rent = Rent::get()?;

    // --- 1. Initialize the Gift Card Mint (standard Token-2022, no extensions) ---
    let gift_card_lamports = rent.minimum_balance(TokenMint::LEN);

    create_account(
        CpiContext::new(
            ctx.accounts.system_program.key(),
            CreateAccount {
                from: ctx.accounts.merchant_admin.to_account_info(),
                to: ctx.accounts.gift_card_mint.to_account_info(),
            },
        ),
        gift_card_lamports,
        TokenMint::LEN as u64,
        &ctx.accounts.token_program_2022.key(),
    )?;

    initialize_mint2(
        CpiContext::new(
            ctx.accounts.token_program_2022.key(),
            InitializeMint2 {
                mint: ctx.accounts.gift_card_mint.to_account_info(),
            },
        ),
        0, // 0 decimals — each gift card is 1 whole token
        &merchant_state_key,
        None, // No freeze authority
    )?;

    // --- 2. Initialize the Loyalty Mint (Token-2022 + NonTransferable) ---
    let loyalty_size = ExtensionType::try_calculate_account_len::<TokenMint>(
        &[ExtensionType::NonTransferable]
    ).unwrap();
    let loyalty_lamports = rent.minimum_balance(loyalty_size);

    create_account(
        CpiContext::new(
            ctx.accounts.system_program.key(),
            CreateAccount {
                from: ctx.accounts.merchant_admin.to_account_info(),
                to: ctx.accounts.loyalty_mint.to_account_info(),
            },
        ),
        loyalty_lamports,
        loyalty_size as u64,
        &ctx.accounts.token_program_2022.key(),
    )?;

    // IMPORTANT: Initialize the NonTransferable extension BEFORE initialize_mint2
    non_transferable_mint_initialize(
        CpiContext::new(
            ctx.accounts.token_program_2022.key(),
            anchor_spl::token_2022_extensions::NonTransferableMintInitialize {
                mint: ctx.accounts.loyalty_mint.to_account_info(),
                token_program_id: ctx.accounts.token_program_2022.to_account_info(),
            },
        ),
    )?;

    initialize_mint2(
        CpiContext::new(
            ctx.accounts.token_program_2022.key(),
            InitializeMint2 {
                mint: ctx.accounts.loyalty_mint.to_account_info(),
            },
        ),
        0, // 0 decimals
        &merchant_state_key,
        None,
    )?;

    // --- 3. Populate the MerchantState PDA ---
    let merchant_state = &mut ctx.accounts.merchant_state;
    merchant_state.admin = ctx.accounts.merchant_admin.key();
    merchant_state.usdc_mint = ctx.accounts.usdc_mint.key();
    merchant_state.usdc_token_account = ctx.accounts.merchant_usdc_ata.key();
    merchant_state.gift_card_mint = ctx.accounts.gift_card_mint.key();
    merchant_state.loyalty_mint = ctx.accounts.loyalty_mint.key();
    merchant_state.gift_card_price = gift_card_price;
    merchant_state.cards_sold = 0;
    merchant_state.cards_redeemed = 0;
    merchant_state.bump = ctx.bumps.merchant_state;

    msg!("MerchantLink: Merchant initialized successfully!");
    msg!("Gift Card Mint: {}", ctx.accounts.gift_card_mint.key());
    msg!("Loyalty Mint (Soulbound): {}", ctx.accounts.loyalty_mint.key());

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeMerchant<'info> {
    /// The merchant admin wallet — pays for account creation
    #[account(mut)]
    pub merchant_admin: Signer<'info>,

    /// The merchant state PDA — stores all merchant config
    #[account(
        init,
        payer = merchant_admin,
        space = 8 + MerchantState::INIT_SPACE,
        seeds = [MERCHANT_SEED, merchant_admin.key().as_ref()],
        bump,
    )]
    pub merchant_state: Box<Account<'info, MerchantState>>,

    /// The gift card mint (Token-2022). New keypair, created in handler.
    /// CHECK: We create and initialize this account manually via CPI.
    #[account(mut)]
    pub gift_card_mint: Signer<'info>,

    /// The loyalty point mint (Token-2022 + NonTransferable). New keypair, created in handler.
    /// CHECK: We create and initialize this account manually via CPI.
    #[account(mut)]
    pub loyalty_mint: Signer<'info>,

    /// The USDC mint (used for validation only)
    /// CHECK: Validated by the merchant's ATA constraint below.
    pub usdc_mint: UncheckedAccount<'info>,

    /// The merchant's USDC Associated Token Account to receive payments
    #[account(
        associated_token::mint = usdc_mint,
        associated_token::authority = merchant_admin,
        associated_token::token_program = token_program,
    )]
    pub merchant_usdc_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Token-2022 program (for gift card and loyalty mints)
    pub token_program_2022: Interface<'info, TokenInterface>,

    /// Token program (for USDC)
    pub token_program: Interface<'info, TokenInterface>,

    /// Associated Token Program
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// System Program
    pub system_program: Program<'info, System>,
}
