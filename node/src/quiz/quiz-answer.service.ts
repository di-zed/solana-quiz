import { BadRequestException, Injectable } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { REWARD_TOPICS } from '../kafka/topics/reward-topics';
import { SolanaQuizReward } from './types/solana-quiz-reward.type';
import { CurrentUserDto } from '../user/dto/current-user.dto';
import { AnswerService } from './answer.service';
import { AnswerBodyDto } from './dto/answer-body.dto';
import { AnswerResponseDto } from './dto/answer-response.dto';
import { QuestionService } from './question.service';
import { QuizService } from './quiz.service';
import { RewardService } from './reward.service';

@Injectable()
export class QuizAnswerService {
  public constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private rewardService: RewardService,
    private kafkaProducerService: KafkaProducerService,
  ) {}

  /**
   * Processes a user's answer to a quiz question.
   *
   * This method:
   * - saves the user's answer
   * - determines whether the answer is correct
   * - finds the correct option if the answer is wrong
   * - checks whether the quiz is completed
   * - calculates earned tokens and streaks if the quiz is finished
   * - returns a response DTO with the result
   *
   * @param user - Current authenticated user
   * @param answer - The submitted answer payload
   * @returns AnswerResponseDto with correctness, reward info, and completion status
   */
  public async processUserAnswer(
    user: CurrentUserDto,
    answer: AnswerBodyDto,
  ): Promise<AnswerResponseDto> {
    // Get the active quiz ID
    const quizId = this.quizService.getQuizId();

    // Save the user's answer; throw if something goes wrong
    const quizAnswer = await this.answerService.setUserAnswer(
      user.id,
      quizId,
      answer.questionId,
      answer.optionId,
    );

    if (!quizAnswer) {
      throw new BadRequestException('The answer could not be processed');
    }

    // Determine the correct option ID (default to selected if answer is correct)
    let correctOptionId = answer.optionId;

    if (!quizAnswer.isCorrect) {
      const correctQuestionOption =
        await this.questionService.getCorrectQuestionOption(answer.questionId);
      correctOptionId = correctQuestionOption ? correctQuestionOption.id : 0;
    }

    // Variables for reward calculation
    let earnedTokens = 0;
    let streakDays = 0;

    // Check if the quiz is completed after the submitted answer
    const isQuizCompleted = await this.quizService.isQuizCompleted(
      user.id,
      quizId,
    );

    // If quiz is complete, calculate rewards and streaks
    if (isQuizCompleted) {
      const quizData = await this.quizService.getUserQuizData(user.id, quizId);

      const quizReward = await this.rewardService.setUserReward(
        user.id,
        quizId,
        this.quizService.getPrevQuizId(),
        quizData,
      );

      // Apply rewards only if tokens were actually earned
      if (quizReward && quizReward.earnedTokens > 0) {
        earnedTokens = quizReward.earnedTokens;
        streakDays = quizReward.streakDays;

        this.kafkaProducerService.emit(
          REWARD_TOPICS.REWARD_GRANTED,
          <SolanaQuizReward>{
            user_id: user.id,
            user_wallet: user.wallet,
            quiz_id: quizId,
            total_questions: quizReward.totalQuestions,
            correct_answers: quizReward.correctAnswers,
            earned_tokens: quizReward.earnedTokens,
            streak_days: quizReward.streakDays,
          },
          `user_${user.id}`,
        );
      }
    }

    // Return the final response DTO
    return {
      isCorrectAnswer: quizAnswer.isCorrect,
      correctOptionId,
      selectedOptionId: answer.optionId,
      isQuizCompleted,
      earnedTokens,
      streakDays,
    };
  }
}
