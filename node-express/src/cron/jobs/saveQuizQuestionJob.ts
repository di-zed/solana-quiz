/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import JobAbstract from './jobAbstract';
import quizService from '../../services/quizService';

/**
 * Save Quiz Question Job.
 */
export default class SaveQuizQuestionJob extends JobAbstract {
  /**
   * @inheritDoc
   */
  public async execute(): Promise<boolean> {
    await quizService.getQuestions();

    return true;
  }
}
