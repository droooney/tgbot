import { BaseCommand, TextHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export abstract class UserDataProvider<CommandType extends BaseCommand, UserData> {
  abstract getOrCreateUserData(userId: number): MaybePromise<UserData>;
  abstract getUserDataHandler(userData: UserData): TextHandler<CommandType, UserData> | null;
}
