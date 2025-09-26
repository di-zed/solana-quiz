/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import JobAbstract from './jobAbstract';

export default class SaveQuizQuestionJob extends JobAbstract {
  /**
   * @inheritDoc
   */
  public async execute(): Promise<boolean> {
    return true;
  }
}
