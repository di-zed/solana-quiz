/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import nodeCron from 'node-cron';

/**
 * Executor Abstract class.
 */
export default abstract class JobAbstract {
  /**
   * The Executor Schedule.
   *
   * @protected
   */
  protected schedule: string;

  /**
   * The Executor Options.
   *
   * @protected
   */
  protected options: ExecutorOptions;

  /**
   * Executor constructor.
   *
   * @param schedule
   * @param options
   */
  public constructor(schedule: string, options: ExecutorOptions = {}) {
    this.schedule = schedule;
    this.options = options;

    nodeCron.schedule(this.schedule, this.execute);
  }

  /**
   * Execute the Action.
   *
   * @returns Promise<boolean>
   */
  public async execute(): Promise<boolean>;
}

export type ExecutorOptions = Record<string, unknown>;
