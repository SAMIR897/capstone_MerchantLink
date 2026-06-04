use anchor_lang::prelude::*;
use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_signer::Signer;

#[test]
fn test_sanity() {
    let mut svm = LiteSVM::new();
    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();
    assert_eq!(svm.get_balance(&payer.pubkey()).unwrap(), 1_000_000_000);
}
