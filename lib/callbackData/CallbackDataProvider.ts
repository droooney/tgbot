import { CallbackQueryHandler } from '../TelegramBot';
import { MaybePromise } from '../types';

export abstract class CallbackDataProvider<CallbackData, UserData> {
  abstract getCallbackQueryHandler<CbData extends CallbackData>(
    data: CbData,
  ): CallbackQueryHandler<CbData, UserData> | null;
  abstract parseCallbackData(dataString: string): MaybePromise<CallbackData | null>;
  abstract stringifyData(data: CallbackData): MaybePromise<string>;
}
