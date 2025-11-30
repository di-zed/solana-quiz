/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import SaveQuizQuestionJob from './jobs/saveQuizQuestionJob';

/**
 * Cron class.
 */
export default class Cron {
  /**
   * Run Cron Jobs.
   *
   * @returns boolean
   */
  public run(): boolean {
    new SaveQuizQuestionJob('0 1 * * *');

    return true;
  }
}
