import { MaybePromise } from '../types';

import { BaseCommand, TextHandler } from '../TelegramBot';

export abstract class UserDataProvider<CommandType extends BaseCommand, UserData> {
  abstract getUserDataHandler(userData: UserData): TextHandler<CommandType, UserData> | null;
  abstract getOrCreateUserData(userId: number): MaybePromise<UserData>;
}
