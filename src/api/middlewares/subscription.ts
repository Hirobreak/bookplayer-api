import { inject, injectable } from 'inversify';
import { IRequest, IResponse, INext } from '../../interfaces/IRequest';
import { ISubscriptionMiddleware } from '../../interfaces/ISubscriptionMiddleware';
import { TYPES } from '../../ContainerTypes';
import { IUserService } from '../../interfaces/IUserService';
import { SubscriptionEventType, SubscriptionTier } from '../../types/user';

@injectable()
export class SubscriptionMiddleware implements ISubscriptionMiddleware {
  @inject(TYPES.UserServices) private _userService: IUserService;
  async checkSubscription(
    req: IRequest,
    res: IResponse,
    next: INext,
  ): Promise<void> {
    try {
      const user = req.user;
      if (user) {
        const userState = await this._userService.getUserSubscriptionState(
          user.id_user,
        );
        if (!userState || userState.type === SubscriptionEventType.EXPIRATION) {
          return res.status(400).json({ message: 'You are not subscribed' });
        }
        req.user.subscriptions = userState.entitlement_ids
        next();
      } else {
        return res.status(400).json({ message: 'the user is invalid' });
      }
    } catch (error) {
      next(error);
    }
  }

  public requireSubscription(allowedTypes: SubscriptionTier[]) {
    return async (req: IRequest, res: IResponse, next: INext): Promise<void> => {
      
      if (!req.user) {
        res.status(400).json({ error: "User data missing." });
        return;
      }

      if (allowedTypes.includes(req.user.subscription_type)) {
        next();
      } else {
        res.status(403).json({ 
          error: `Requires one of: ${allowedTypes.join(', ')}` 
        });
      }
    };
  }
}
