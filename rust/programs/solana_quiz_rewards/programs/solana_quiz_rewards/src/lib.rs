use anchor_lang::prelude::*;
use anchor_spl::token::{self, TransferChecked, Mint, Token, TokenAccount};

declare_id!("Ej4LLtFBrg8SXuSusmm5nHyqaMn4BZ31hyPGtLfQmA1P");

#[program]
pub mod solana_quiz_rewards {
    use super::*;

    // Initialize a user's quiz data account
    pub fn initialize(ctx: Context<InitializeUser>) -> Result<()> {
        let user_data = &mut ctx.accounts.quiz_user_data;

        // Only set defaults if not yet initialized
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

    // Update quiz results and manage streak
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

        // Prevent multiple quizzes in one day
        if user_data.last_quiz_day == current_day {
            msg!(
                "User {:?} already finished quiz today ({})",
                user_data.user_wallet,
                current_day,
            );
            return Err(error!(QuizError::AlreadyPlayedToday));
        }

        // Update overall quiz stats
        user_data.total_quizzes += 1;
        user_data.total_questions += total_questions;
        user_data.correct_answers += correct_answers;
        user_data.earned_tokens += earned_tokens;

        // Reset streak if goal reached
        if user_data.streak == streak_days {
            user_data.streak = 0;
        }

        // Increment streak if consecutive day, else reset to 1
        if user_data.last_quiz_day + 1 == current_day {
            user_data.streak += 1;
        } else {
            user_data.streak = 1;
        }

        // Emit event if streak goal achieved
        if user_data.streak == streak_days {
            emit!(StreakAchieved {
                user: user_data.user_wallet,
                streak: user_data.streak,
            });
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

    // Transfer SPL tokens via CPI
    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        let decimals = ctx.accounts.mint.decimals;
        let transfer_amount = amount * 10_u64.pow(decimals as u32);

        let cpi_accounts = TransferChecked {
            from: ctx.accounts.sender_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Perform the token transfer
        token::transfer_checked(cpi_ctx, transfer_amount, decimals)?;

        msg!("✅ Transferred {} tokens", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: only pass the user's public key
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
    /// CHECK: only pass the user's public key
    pub user: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"user_data_v2", user.key().as_ref()], bump)]
    pub quiz_user_data: Account<'info, QuizUserData>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub sender_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// On-chain account storing user quiz stats
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
    pub const SIZE: usize = 32 + 8 + 1 + 8 + 8 + 8 + 8; // account byte size
}

#[error_code]
pub enum QuizError {
    #[msg("User already completed quiz today")]
    AlreadyPlayedToday,
}

// Event emitted when streak goal is reached
#[event]
pub struct StreakAchieved {
    pub user: Pubkey,
    pub streak: u8,
}
