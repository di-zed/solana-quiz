import { Controller, Get } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserDto } from '../user/dto/current-user.dto';
import { QuestionsResponseDto } from './dto/questions-response.dto';
import { RewardsResponseDto } from './dto/rewards-response.dto';
import { QuizService } from './quiz.service';
import { RewardService } from './reward.service';

@Controller('quiz')
@ApiTags('quiz')
@ApiCookieAuth('auth_token')
export class QuizController {
  public constructor(
    private quizService: QuizService,
    private rewardService: RewardService,
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
  public async rewards(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RewardsResponseDto> {
    const rewardData = await this.rewardService.getUserRewardData(user.id);

    return { rewardData };
  }

  public answer() {}
}
