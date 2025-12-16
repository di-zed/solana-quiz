import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExecutionTimeInterceptor } from '../common/interceptors/execution-time.interceptor';
import { CurrentUserDto } from '../user/dto/current-user.dto';
import { AnswerService } from './answer.service';
import { AnswerBodyDto } from './dto/answer-body.dto';
import { AnswerResponseDto } from './dto/answer-response.dto';
import { QuestionsResponseDto } from './dto/questions-response.dto';
import { RewardsResponseDto } from './dto/rewards-response.dto';
import { QuestionService } from './question.service';
import { QuizAnswerService } from './quiz-answer.service';
import { QuizService } from './quiz.service';
import { RewardService } from './reward.service';

@Controller('quiz')
@ApiTags('quiz')
@ApiCookieAuth('auth_token')
export class QuizController {
  public constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private answerService: AnswerService,
    private rewardService: RewardService,
    private quizAnswerService: QuizAnswerService,
  ) {}

  @Get('questions')
  @ApiOperation({ summary: 'Get quiz questions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the quiz data for the current user',
    type: QuestionsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: invalid or missing auth token',
  })
  @UseInterceptors(new ExecutionTimeInterceptor())
  public async questions(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<QuestionsResponseDto> {
    const quizData = await this.quizService.getUserQuizData(
      user.id,
      this.quizService.getQuizId(),
    );

    return { quizData };
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Get user reward data' })
  @ApiResponse({
    status: 200,
    description: 'Returns the reward data for the current user',
    type: RewardsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: invalid or missing auth token',
  })
  @UseInterceptors(new ExecutionTimeInterceptor())
  public async rewards(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RewardsResponseDto> {
    const rewardData = await this.rewardService.getUserRewardData(user.id);

    return { rewardData };
  }

  @Post('answer')
  @HttpCode(200)
  @ApiOperation({ summary: 'Submit an answer to a quiz question' })
  @ApiBody({
    description: 'User answer payload',
    type: AnswerBodyDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Answer processed successfully',
    type: AnswerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: invalid question or option',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: invalid or missing auth token',
  })
  @UseInterceptors(new ExecutionTimeInterceptor())
  public async answer(
    @CurrentUser() user: CurrentUserDto,
    @Body() answer: AnswerBodyDto,
  ): Promise<AnswerResponseDto> {
    return this.quizAnswerService.processUserAnswer(user, answer);
  }
}
