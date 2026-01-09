import { Request } from 'express';

import { UserAuth } from '@qnoffice/shared';

export type AppRequest = {
  user: UserAuth;
} & Request;
