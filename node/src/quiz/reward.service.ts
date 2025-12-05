import { Injectable } from '@nestjs/common';
import { getRequiredEnv } from '../common/utils/config.utils';
import { PrismaService } from '../prisma/prisma.service';
import { QuizReward } from '../../generated/prisma/client';
import { UserQuizDataDto } from './dto/user-quiz-data.dto';
import { UserRewardDataDto } from './dto/user-reward-data.dto';
import { UserRewardDto } from './dto/user-reward.dto';

@Injectable()
export class RewardService {
  public constructor(private prisma: PrismaService) {}

  /**
   * Get User Reward.
   *
   * @param userId
   * @param quizId
   * @returns Promise<QuizReward | null>
   */
  public async getUserReward(
    userId: number,
    quizId: number,
  ): Promise<QuizReward | null> {
    return this.prisma.quizReward.findFirst({
      where: { userId, quizId },
    });
  }

  /**
   * Set User Reward.
   *
   * @param userId
   * @param quizId
   * @param prevQuizId
   * @param quizData
   * @returns Promise<QuizReward | null>
   */
  public async setUserReward(
    userId: number,
    quizId: number,
    prevQuizId: number,
    quizData: UserQuizDataDto,
  ): Promise<QuizReward | null> {
    if (
      quizData.totalQuestions !==
      quizData.correctAnswers + quizData.wrongAnswers
    ) {
      return null;
    }

    // A user cannot be awarded for the same quiz twice.
    if (await this.getUserReward(userId, quizId)) {
      return null;
    }

    return this.prisma.quizReward.create({
      data: {
        userId,
        quizId,
        totalQuestions: quizData.totalQuestions,
        correctAnswers: quizData.correctAnswers,
        wrongAnswers: quizData.wrongAnswers,
        earnedTokens: this.calculateQuizReward(quizData),
        streakDays: await this.calculateQuizStreakDays(
          userId,
          prevQuizId,
          quizData,
        ),
        isSent: false,
      },
    });
  }

  /**
   * Get User Rewards.
   *
   * @param userId
   * @returns Promise<QuizReward[]>
   */
  public async getUserRewards(userId: number): Promise<QuizReward[]> {
    return this.prisma.quizReward.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Mark Reward As Sent.
   *
   * @param userId
   * @param quizId
   * @returns Promise<QuizReward | null>
   */
  public async markRewardAsSent(
    userId: number,
    quizId: number,
  ): Promise<QuizReward | null> {
    const quizReward = await this.prisma.quizReward.findFirst({
      where: { userId, quizId },
    });

    // The reward cannot be sent twice.
    if (quizReward && quizReward.isSent) {
      return null;
    }

    return this.prisma.quizReward.update({
      where: { userId_quizId: { userId, quizId } },
      data: { isSent: true, sentAt: new Date() },
    });
  }

  /**
   * Get User Reward Data.
   *
   * @param userId
   * @returns Promise<UserRewardDataDto>
   */
  public async getUserRewardData(userId: number): Promise<UserRewardDataDto> {
    const result: UserRewardDataDto = {
      totalQuizzes: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      earnedTokens: 0,
      streaks: 0,
      rewards: [],
    };

    const rewards = await this.getUserRewards(userId);

    for (const reward of rewards) {
      const goalStreakDays = parseInt(getRequiredEnv('SOLANA_STREAK_DAYS'));

      const userReward: UserRewardDto = {
        date: new Date(reward.createdAt).toISOString().split('T')[0],
        totalQuestions: reward.totalQuestions,
        correctAnswers: reward.correctAnswers,
        wrongAnswers: reward.wrongAnswers,
        earnedTokens: reward.earnedTokens,
        streakDays: reward.streakDays,
        isSent: reward.isSent,
      };

      result.totalQuizzes++;

      result.totalQuestions += userReward.totalQuestions;
      result.correctAnswers += userReward.correctAnswers;
      result.wrongAnswers += userReward.wrongAnswers;
      result.earnedTokens += userReward.earnedTokens;
      result.streaks += userReward.streakDays === goalStreakDays ? 1 : 0;

      result.rewards.push(userReward);
    }

    return result;
  }

  /**
   * Calculate Quiz Reward.
   *
   * @param quizData
   * @returns number
   */
  public calculateQuizReward(quizData: UserQuizDataDto): number {
    if (
      quizData.totalQuestions !==
      quizData.correctAnswers + quizData.wrongAnswers
    ) {
      return 0;
    }

    // One token to one correct answer
    let reward = quizData.correctAnswers;

    // If all answers are correct, the reward will be doubled
    if (quizData.totalQuestions === quizData.correctAnswers) {
      reward *= 2;
    }

    return reward;
  }

  /**
   * Calculate Quiz Streak Days.
   *
   * @param userId
   * @param prevQuizId
   * @param quizData
   * @returns Promise<number>
   */
  public async calculateQuizStreakDays(
    userId: number,
    prevQuizId: number,
    quizData: UserQuizDataDto,
  ): Promise<number> {
    if (quizData.totalQuestions !== quizData.correctAnswers) {
      return 0;
    }

    let streakDays = 1;

    const prevReward = await this.getUserReward(userId, prevQuizId);
    if (prevReward) {
      streakDays += prevReward.streakDays;
      const goalStreakDays = parseInt(getRequiredEnv('SOLANA_STREAK_DAYS'));

      if (streakDays > goalStreakDays) {
        streakDays = 1;
      }
    }

    return streakDays;
  }
}
