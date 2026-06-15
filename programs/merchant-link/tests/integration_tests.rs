use anchor_lang::{solana_program, InstructionData, ToAccountMetas};
use anchor_spl::{
    associated_token::{get_associated_token_address_with_program_id, spl_associated_token_account},
    token::{spl_token, ID as TOKEN_PROGRAM_ID},
    token_2022::{ID as TOKEN_2022_PROGRAM_ID},
};
use litesvm::LiteSVM;
use merchant_link::{
    accounts::{BuyGiftCard, InitializeMerchant, RedeemGiftCard},
    instruction::{
        BuyGiftCard as BuyGiftCardIx, InitializeMerchant as InitializeMerchantIx,
        RedeemGiftCard as RedeemGiftCardIx,
    },
    MERCHANT_SEED,
};
use solana_keypair::Keypair;
use solana_message::Message;
use solana_signer::Signer;
use solana_transaction::Transaction;
use std::fs;
use anchor_lang::solana_program::program_pack::Pack;

fn read_program_bytes() -> Vec<u8> {
    // anchor build output
    let path = "../../target/deploy/merchant_link.so";
    fs::read(path).expect("Failed to read program .so file. Did you run `anchor build`?")
}

#[test]
fn test_merchant_link_flow() {
    let mut svm = LiteSVM::new();

    // The program ID
    let program_id = merchant_link::id();
    
    // Add the program to LiteSVM
    let program_bytes = read_program_bytes();
    svm.add_program(program_id, &program_bytes).unwrap();

    // Keypairs
    let merchant_admin = Keypair::new();
    let consumer = Keypair::new();
    let usdc_mint_authority = Keypair::new();
    
    // Gift card and Loyalty mints (created by the program during initialize)
    let gift_card_mint = Keypair::new();
    let loyalty_mint = Keypair::new();

    // Airdrop SOL to merchant admin and consumer
    svm.airdrop(&merchant_admin.pubkey(), 10_000_000_000).unwrap();
    svm.airdrop(&consumer.pubkey(), 10_000_000_000).unwrap();
    svm.airdrop(&usdc_mint_authority.pubkey(), 1_000_000_000).unwrap();

    // Let's create a "USDC" mint
    let usdc_mint = Keypair::new();
    let space = spl_token::state::Mint::LEN as u64;
    let rent = svm.get_sysvar::<solana_program::rent::Rent>().minimum_balance(space as usize);
    let create_usdc_mint_ix = solana_program::system_instruction::create_account(
        &usdc_mint_authority.pubkey(),
        &usdc_mint.pubkey(),
        rent,
        space,
        &TOKEN_PROGRAM_ID,
    );
    let init_usdc_mint_ix = spl_token::instruction::initialize_mint(
        &TOKEN_PROGRAM_ID,
        &usdc_mint.pubkey(),
        &usdc_mint_authority.pubkey(),
        None,
        6,
    ).unwrap();

    let tx = Transaction::new(
        &[&usdc_mint_authority, &usdc_mint],
        Message::new(&[create_usdc_mint_ix, init_usdc_mint_ix], Some(&usdc_mint_authority.pubkey())),
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();

    // 1. Initialize Merchant
    let (merchant_state_pda, _bump) =
        solana_program::pubkey::Pubkey::find_program_address(
            &[MERCHANT_SEED, merchant_admin.pubkey().as_ref()],
            &program_id,
        );

    let merchant_usdc_ata = get_associated_token_address_with_program_id(
        &merchant_admin.pubkey(),
        &usdc_mint.pubkey(),
        &TOKEN_PROGRAM_ID,
    );

    // Create Merchant's USDC ATA
    let create_merchant_ata_ix = spl_associated_token_account::instruction::create_associated_token_account(
        &merchant_admin.pubkey(),
        &merchant_admin.pubkey(),
        &usdc_mint.pubkey(),
        &TOKEN_PROGRAM_ID,
    );
    let tx = Transaction::new(
        &[&merchant_admin],
        Message::new(&[create_merchant_ata_ix], Some(&merchant_admin.pubkey())),
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();

    let init_ix = solana_program::instruction::Instruction {
        program_id,
        accounts: InitializeMerchant {
            merchant_admin: merchant_admin.pubkey(),
            merchant_state: merchant_state_pda,
            gift_card_mint: gift_card_mint.pubkey(),
            loyalty_mint: loyalty_mint.pubkey(),
            usdc_mint: usdc_mint.pubkey(),
            merchant_usdc_ata,
            token_program_2022: TOKEN_2022_PROGRAM_ID,
            token_program: TOKEN_PROGRAM_ID,
            associated_token_program: anchor_spl::associated_token::ID,
            system_program: solana_program::system_program::ID,
        }
        .to_account_metas(None),
        data: InitializeMerchantIx {
            gift_card_price: 10_000_000, // 10 USDC
        }
        .data(),
    };

    let tx = Transaction::new(
        &[&merchant_admin, &gift_card_mint, &loyalty_mint],
        Message::new(&[init_ix], Some(&merchant_admin.pubkey())),
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();

    // Verify state
    let _state_account = svm.get_account(&merchant_state_pda).unwrap();
    // Assuming works if no error

    // 2. Setup Consumer USDC
    let consumer_usdc_ata = get_associated_token_address_with_program_id(
        &consumer.pubkey(),
        &usdc_mint.pubkey(),
        &TOKEN_PROGRAM_ID,
    );
    let create_consumer_ata_ix = spl_associated_token_account::instruction::create_associated_token_account(
        &consumer.pubkey(),
        &consumer.pubkey(),
        &usdc_mint.pubkey(),
        &TOKEN_PROGRAM_ID,
    );
    // Mint USDC to consumer
    let mint_to_consumer_ix = spl_token::instruction::mint_to(
        &TOKEN_PROGRAM_ID,
        &usdc_mint.pubkey(),
        &consumer_usdc_ata,
        &usdc_mint_authority.pubkey(),
        &[],
        20_000_000, // 20 USDC
    ).unwrap();

    let tx = Transaction::new(
        &[&consumer, &usdc_mint_authority],
        Message::new(&[create_consumer_ata_ix, mint_to_consumer_ix], Some(&consumer.pubkey())),
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();

    // 3. Buy Gift Card
    let consumer_gift_card_ata = get_associated_token_address_with_program_id(
        &consumer.pubkey(),
        &gift_card_mint.pubkey(),
        &TOKEN_2022_PROGRAM_ID,
    );
    let consumer_loyalty_ata = get_associated_token_address_with_program_id(
        &consumer.pubkey(),
        &loyalty_mint.pubkey(),
        &TOKEN_2022_PROGRAM_ID,
    );

    let buy_ix = solana_program::instruction::Instruction {
        program_id,
        accounts: BuyGiftCard {
            consumer: consumer.pubkey(),
            merchant_state: merchant_state_pda,
            usdc_mint: usdc_mint.pubkey(),
            consumer_usdc_ata,
            merchant_usdc_ata,
            gift_card_mint: gift_card_mint.pubkey(),
            consumer_gift_card_ata,
            loyalty_mint: loyalty_mint.pubkey(),
            consumer_loyalty_ata,
            token_program: TOKEN_PROGRAM_ID,
            token_program_2022: TOKEN_2022_PROGRAM_ID,
            associated_token_program: anchor_spl::associated_token::ID,
            system_program: solana_program::system_program::ID,
        }
        .to_account_metas(None),
        data: BuyGiftCardIx {}.data(),
    };

    let tx = Transaction::new(
        &[&consumer],
        Message::new(&[buy_ix], Some(&consumer.pubkey())),
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();

    // 4. Redeem Gift Card
    let redeem_ix = solana_program::instruction::Instruction {
        program_id,
        accounts: RedeemGiftCard {
            consumer: consumer.pubkey(),
            merchant_state: merchant_state_pda,
            gift_card_mint: gift_card_mint.pubkey(),
            consumer_gift_card_ata,
            token_program_2022: TOKEN_2022_PROGRAM_ID,
        }
        .to_account_metas(None),
        data: RedeemGiftCardIx {}.data(),
    };

    let tx = Transaction::new(
        &[&consumer],
        Message::new(&[redeem_ix], Some(&consumer.pubkey())),
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();

    println!("All tests passed!");
}
