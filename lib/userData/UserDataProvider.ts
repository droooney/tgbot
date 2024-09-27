import { BaseCommand, MessageHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export type UserDataProvider<in out CommandType extends BaseCommand, in out CallbackData, in out UserData> = {
  getOrCreateUserData(userId: number): MaybePromise<UserData>;
  getUserDataHandler<Data extends UserData>(
    userData: Data,
  ): MessageHandler<NoInfer<CommandType>, NoInfer<CallbackData>, UserData, Data> | null;
  setUserData(userId: number, data: UserData): MaybePromise<void>;
};
