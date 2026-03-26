import { Request } from 'express';
import { User } from '../../schemas/userSchema/user.schema';

export interface RequestWithUser extends Request {
  user: User;
}
