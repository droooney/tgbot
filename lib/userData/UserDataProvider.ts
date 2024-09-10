import { BaseCommand, TextHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export abstract class UserDataProvider<CommandType extends BaseCommand, UserData> {
  abstract getUserDataHandler(userData: UserData): TextHandler<CommandType, UserData> | null;
  abstract getOrCreateUserData(userId: number): MaybePromise<UserData>;
}
