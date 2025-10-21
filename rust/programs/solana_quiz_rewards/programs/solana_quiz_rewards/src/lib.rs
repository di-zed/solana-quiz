use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, transfer_checked, Mint, Token, TokenAccount, Transfer};

declare_id!("Ej4LLtFBrg8SXuSusmm5nHyqaMn4BZ31hyPGtLfQmA1P");

#[program]
pub mod solana_quiz_rewards {
    use super::*;

    pub fn initialize(ctx: Context<InitializeUser>) -> Result<()> {
        let user_data = &mut ctx.accounts.quiz_user_data;

        if user_data.user_wallet == Pubkey::default() {
            user_data.user_wallet = ctx.accounts.user.key();
            user_data.last_quiz_day = 0;
            user_data.streak = 0;
            user_data.total_quizzes = 0;
            user_data.total_questions = 0;
            user_data.correct_answers = 0;
            user_data.earned_tokens = 0;

            msg!("✅ Created QuizUserData for {}", user_data.user_wallet);
        }

        Ok(())
    }

    pub fn update_quiz_results(
        ctx: Context<UpdateQuizResults>,
        total_questions: u64,
        correct_answers: u64,
        earned_tokens: u64,
        streak_days: u8,
    ) -> Result<()> {
        let user_data = &mut ctx.accounts.quiz_user_data;

        let now_ts = Clock::get()?.unix_timestamp;
        let current_day = (now_ts / 86400) as u64;

        if user_data.last_quiz_day == current_day {
            msg!(
                "User {:?} already finished quiz today ({})",
                user_data.user_wallet,
                current_day,
            );
            return Ok(());
        }

        user_data.total_quizzes += 1;
        user_data.total_questions += total_questions;
        user_data.correct_answers += correct_answers;
        user_data.earned_tokens += earned_tokens;

        if user_data.last_quiz_day + 1 == current_day {
            user_data.streak += 1;
        } else {
            user_data.streak = 1;
        }

        if user_data.streak == streak_days {
            // do something ...

            user_data.streak = 0;
        }

        msg!(
            "🎯 User {:?} finished quiz day {} (streak: {})",
            user_data.user_wallet,
            current_day,
            user_data.streak
        );

        user_data.last_quiz_day = current_day;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: We simply pass the user's Pubkey; there is no need to sign the transaction.
    pub user: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + QuizUserData::SIZE,
        seeds = [b"user_data_v2", user.key().as_ref()],
        bump
    )]
    pub quiz_user_data: Account<'info, QuizUserData>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateQuizResults<'info> {
    /// CHECK: We simply pass the user's Pubkey; there is no need to sign the transaction.
    pub user: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"user_data_v2", user.key().as_ref()], bump)]
    pub quiz_user_data: Account<'info, QuizUserData>,
}

#[account]
pub struct QuizUserData {
    pub user_wallet: Pubkey,
    pub last_quiz_day: u64,
    pub streak: u8,
    pub total_quizzes: u64,
    pub total_questions: u64,
    pub correct_answers: u64,
    pub earned_tokens: u64,
}

impl QuizUserData {
    pub const SIZE: usize = 32 + 8 + 1 + 8 + 8 + 8 + 8;
}
