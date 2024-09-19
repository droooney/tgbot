import { BaseCommand, TextHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export abstract class UserDataProvider<CommandType extends BaseCommand, CallbackData, UserData> {
  abstract getOrCreateUserData: (userId: number) => MaybePromise<UserData>;
  abstract getUserDataHandler: <Data extends UserData>(
    userData: Data,
  ) => TextHandler<CommandType, CallbackData, UserData, Data> | null;
}
