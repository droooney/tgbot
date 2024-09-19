import { BaseCommand, CallbackQueryHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export abstract class CallbackDataProvider<CommandType extends BaseCommand, CallbackData, UserData> {
  abstract getCallbackQueryHandler: <Data extends CallbackData>(
    data: Data,
  ) => CallbackQueryHandler<CommandType, CallbackData, UserData, Data> | null;
  abstract parseCallbackData: (dataString: string) => MaybePromise<CallbackData | null>;
  abstract stringifyData: (data: CallbackData) => MaybePromise<string>;
}
