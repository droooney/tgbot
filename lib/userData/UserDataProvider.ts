import { BaseCommand, MessageHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export abstract class UserDataProvider<in out CommandType extends BaseCommand, in out CallbackData, in out UserData> {
  abstract getOrCreateUserData: (userId: number) => MaybePromise<UserData>;
  abstract getUserDataHandler: <Data extends UserData>(
    userData: Data,
  ) => MessageHandler<NoInfer<CommandType>, NoInfer<CallbackData>, UserData, Data> | null;
}
