import { CallbackQueryHandler } from '../TelegramBot';

export abstract class CallbackDataProvider<CallbackData, UserData> {
  abstract getCallbackQueryHandler<CbData extends CallbackData>(
    data: CbData,
  ): CallbackQueryHandler<CbData, UserData> | null;
  abstract parseCallbackData(dataString: string): CallbackData | null;
  abstract stringifyData(data: CallbackData): string;
}
