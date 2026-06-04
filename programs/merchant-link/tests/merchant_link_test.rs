use anchor_spl::{
    associated_token::{get_associated_token_address, get_associated_token_address_with_program_id},
    token::spl_token,
    token_2022::spl_token_2022,
};
use litesvm::LiteSVM;
use merchant_link::constants::MERCHANT_SEED;
use solana_keypair::Keypair;
use anchor_lang::solana_program::{
    instruction::Instruction, pubkey::Pubkey, rent::Rent, system_instruction, system_program,
    program_pack::Pack,
};
use solana_signer::Signer;
use solana_transaction::Transaction;
use anchor_lang::{InstructionData, ToAccountMetas};

#[test]
fn test_merchant_link_flow() {
    let mut svm = LiteSVM::new();
    let merchant_link_program_id = merchant_link::ID;

    // Load program into LiteSVM
    svm.add_program_from_file(
        merchant_link_program_id,
        "../../target/deploy/merchant_link.so",
    )
    .expect("Failed to load program");

    let admin = Keypair::new();
    let consumer = Keypair::new();

    // Airdrop SOL
    svm.airdrop(&admin.pubkey(), 10_000_000_000).unwrap();
    svm.airdrop(&consumer.pubkey(), 10_000_000_000).unwrap();

    // 1. Setup mock USDC
    let usdc_mint = Keypair::new();
    let token_program = spl_token::ID;
    
    // Create USDC mint
    let rent = Rent::default();
    let mint_len = spl_token::state::Mint::LEN;
    let create_mint_ix = system_instruction::create_account(
        &admin.pubkey(),
        &usdc_mint.pubkey(),
        rent.minimum_balance(mint_len),
        mint_len as u64,
        &token_program,
    );
    let init_mint_ix = spl_token::instruction::initialize_mint(
        &token_program,
        &usdc_mint.pubkey(),
        &admin.pubkey(),
        None,
        6,
    )
    .unwrap();

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[create_mint_ix, init_mint_ix],
        Some(&admin.pubkey()),
        &[&admin, &usdc_mint],
        blockhash,
    );
    svm.send_transaction(tx).unwrap();

    // 2. Setup ATAs and mint USDC to consumer
    let merchant_usdc_ata = get_associated_token_address(&admin.pubkey(), &usdc_mint.pubkey());
    let consumer_usdc_ata = get_associated_token_address(&consumer.pubkey(), &usdc_mint.pubkey());

    let create_merchant_ata_ix = anchor_spl::associated_token::spl_associated_token_account::instruction::create_associated_token_account(
        &admin.pubkey(),
        &admin.pubkey(),
        &usdc_mint.pubkey(),
        &token_program,
    );
    let create_consumer_ata_ix = anchor_spl::associated_token::spl_associated_token_account::instruction::create_associated_token_account(
        &admin.pubkey(),
        &consumer.pubkey(),
        &usdc_mint.pubkey(),
        &token_program,
    );
    let mint_to_consumer_ix = spl_token::instruction::mint_to(
        &token_program,
        &usdc_mint.pubkey(),
        &consumer_usdc_ata,
        &admin.pubkey(),
        &[],
        50_000_000, // 50 USDC
    )
    .unwrap();

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[
            create_merchant_ata_ix,
            create_consumer_ata_ix,
            mint_to_consumer_ix,
        ],
        Some(&admin.pubkey()),
        &[&admin],
        blockhash,
    );
    svm.send_transaction(tx).unwrap();

    // 3. Initialize Merchant
    let (merchant_state_pda, bump) =
        Pubkey::find_program_address(&[MERCHANT_SEED, admin.pubkey().as_ref()], &merchant_link_program_id);

    let gift_card_mint = Keypair::new();
    let loyalty_mint = Keypair::new();
    let token_program_2022 = spl_token_2022::ID;

    let init_accounts = merchant_link::accounts::InitializeMerchant {
        merchant_admin: admin.pubkey(),
        merchant_state: merchant_state_pda,
        gift_card_mint: gift_card_mint.pubkey(),
        loyalty_mint: loyalty_mint.pubkey(),
        usdc_mint: usdc_mint.pubkey(),
        merchant_usdc_ata,
        token_program_2022,
        token_program,
        associated_token_program: anchor_spl::associated_token::ID,
        system_program: system_program::ID,
    };

    let gift_card_price: u64 = 5_000_000; // 5 USDC
    let init_data = merchant_link::instruction::InitializeMerchant { gift_card_price };

    let init_ix = Instruction {
        program_id: merchant_link_program_id,
        accounts: init_accounts.to_account_metas(Some(true)),
        data: init_data.data(),
    };

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[init_ix],
        Some(&admin.pubkey()),
        &[&admin, &gift_card_mint, &loyalty_mint],
        blockhash,
    );
    svm.send_transaction(tx).expect("Initialize Merchant Failed");

    // Verify State
    let state_account = svm.get_account(&merchant_state_pda).unwrap();
    assert_eq!(state_account.owner, merchant_link_program_id);

    // 4. Buy Gift Card
    let consumer_gift_card_ata = get_associated_token_address_with_program_id(
        &consumer.pubkey(),
        &gift_card_mint.pubkey(),
        &token_program_2022,
    );
    let consumer_loyalty_ata = get_associated_token_address_with_program_id(
        &consumer.pubkey(),
        &loyalty_mint.pubkey(),
        &token_program_2022,
    );

    let buy_accounts = merchant_link::accounts::BuyGiftCard {
        consumer: consumer.pubkey(),
        merchant_state: merchant_state_pda,
        usdc_mint: usdc_mint.pubkey(),
        consumer_usdc_ata,
        merchant_usdc_ata,
        gift_card_mint: gift_card_mint.pubkey(),
        consumer_gift_card_ata,
        loyalty_mint: loyalty_mint.pubkey(),
        consumer_loyalty_ata,
        token_program,
        token_program_2022,
        associated_token_program: anchor_spl::associated_token::ID,
        system_program: system_program::ID,
    };

    let buy_data = merchant_link::instruction::BuyGiftCard {};
    let buy_ix = Instruction {
        program_id: merchant_link_program_id,
        accounts: buy_accounts.to_account_metas(Some(true)),
        data: buy_data.data(),
    };

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[buy_ix],
        Some(&consumer.pubkey()),
        &[&consumer],
        blockhash,
    );
    svm.send_transaction(tx).expect("Buy Gift Card Failed");

    // Verify USDC was deducted from consumer (50 USDC - 5 USDC = 45 USDC)
    let consumer_usdc_account = svm.get_account(&consumer_usdc_ata).unwrap();
    let consumer_usdc_state = spl_token::state::Account::unpack(&consumer_usdc_account.data).unwrap();
    assert_eq!(consumer_usdc_state.amount, 45_000_000);

    // Verify Merchant received USDC
    let merchant_usdc_account = svm.get_account(&merchant_usdc_ata).unwrap();
    let merchant_usdc_state = spl_token::state::Account::unpack(&merchant_usdc_account.data).unwrap();
    assert_eq!(merchant_usdc_state.amount, 5_000_000);

    // Verify Consumer received 1 Gift Card token
    let consumer_gc_account = svm.get_account(&consumer_gift_card_ata).unwrap();
    let consumer_gc_state = spl_token_2022::state::Account::unpack(&consumer_gc_account.data).unwrap();
    assert_eq!(consumer_gc_state.amount, 1);

    // Verify Consumer received 1 Loyalty token
    let consumer_loyalty_account = svm.get_account(&consumer_loyalty_ata).unwrap();
    let consumer_loyalty_state = spl_token_2022::state::Account::unpack(&consumer_loyalty_account.data).unwrap();
    assert_eq!(consumer_loyalty_state.amount, 1);
}
