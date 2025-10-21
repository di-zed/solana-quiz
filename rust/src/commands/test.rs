use crate::utils::solana_util::{get_authority_keypair, get_mint_account};
use anchor_client::{
    Client, Cluster,
    solana_sdk::{commitment_config::CommitmentConfig, signer::Signer, system_program},
};
use anchor_lang::prelude::*;
use std::rc::Rc;

declare_program!(solana_quiz_rewards);
use solana_quiz_rewards::{accounts::QuizUserData, client::accounts, client::args};

pub async fn run() -> anyhow::Result<()> {
    let payer = get_authority_keypair();
    let payer_rc = Rc::new(payer);

    let provider = Client::new_with_options(
        "http://host.docker.internal:8899".parse::<Cluster>()?,
        payer_rc.clone(),
        CommitmentConfig::confirmed(),
    );

    let program_id = solana_quiz_rewards::ID;
    let program = provider.program(program_id)?;

    let user_pubkey = "FzCptggk4znyovWcedjDD75E8ZXSJNWxiBfn1WDJ6FQ5".parse::<Pubkey>()?;
    let user_seeds = &[b"user_data_v2", user_pubkey.as_ref()];
    let (quiz_user_pda, bump) = Pubkey::find_program_address(user_seeds, &program_id);

    // Build and send instructions
    println!("\nSend transaction with initialize and update instructions");

    let initialize_instructions = program
        .request()
        .accounts(accounts::Initialize {
            payer: payer_rc.pubkey(),
            user: user_pubkey.into(),
            quiz_user_data: quiz_user_pda,
            system_program: system_program::ID,
        })
        .args(args::Initialize)
        .instructions()?;

    let update_instructions = program
        .request()
        .accounts(accounts::UpdateQuizResults {
            user: user_pubkey.into(),
            quiz_user_data: quiz_user_pda,
        })
        .args(args::UpdateQuizResults {
            total_questions: 5,
            correct_answers: 4,
            earned_tokens: 4,
            streak_days: 7,
        })
        .instructions()?;

    let mut request = program.request().signer(payer_rc.as_ref());

    for ix in initialize_instructions {
        request = request.instruction(ix);
    }
    for ix in update_instructions {
        request = request.instruction(ix);
    }

    let signature = request.send().await?;

    println!("   Transaction confirmed: {}", signature);

    println!("\nFetch quiz user account data");
    let quiz_user_data_account: QuizUserData = program.account(quiz_user_pda).await?;
    println!("   Value: {:?}", quiz_user_data_account);

    Ok(())
}
