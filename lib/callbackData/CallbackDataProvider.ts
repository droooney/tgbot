import { BaseCommand, CallbackQueryHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export type CallbackDataProvider<in out CommandType extends BaseCommand, in out CallbackData, in out UserData> = {
  getCallbackQueryHandler<Data extends CallbackData>(
    data: Data,
  ): CallbackQueryHandler<NoInfer<CommandType>, CallbackData, NoInfer<UserData>, Data> | null;
  parseCallbackData(dataString: string): MaybePromise<CallbackData | null>;
  stringifyData(data: CallbackData): MaybePromise<string>;
};
