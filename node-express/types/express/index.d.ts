/**
 * @author DiZed Team
 * @copyright Copyright (c) DiZed Team (https://github.com/di-zed/)
 */
import { CurrentUser } from '../../src/middlewares/authMiddleware';

export {};

/**
 * Extend Express Properties.
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * The Request ID Property.
       */
      requestId: string;

      /**
       * The Current User Property.
       */
      currentUser: CurrentUser;
    }
  }
}
