import { BaseCommand, CallbackQueryHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export abstract class CallbackDataProvider<
  in out CommandType extends BaseCommand,
  in out CallbackData,
  in out UserData,
> {
  abstract getCallbackQueryHandler: <Data extends CallbackData>(
    data: Data,
  ) => CallbackQueryHandler<NoInfer<CommandType>, CallbackData, NoInfer<UserData>, Data> | null;
  abstract parseCallbackData: (dataString: string) => MaybePromise<CallbackData | null>;
  abstract stringifyData: (data: CallbackData) => MaybePromise<string>;
}
