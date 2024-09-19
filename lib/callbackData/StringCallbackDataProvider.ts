import { CallbackQueryHandler } from '../TelegramBot';
import { CallbackDataProvider } from './CallbackDataProvider';

export class StringCallbackDataProvider<CallbackData extends string, UserData> extends CallbackDataProvider<
  CallbackData,
  UserData
> {
  private readonly _handlers: {
    [Data in CallbackData]?: CallbackQueryHandler<Data, UserData>;
  } = {};

  getCallbackQueryHandler<Data extends CallbackData>(data: Data): CallbackQueryHandler<Data, UserData> | null {
    return this._handlers[data] ?? null;
  }

  handle<Data extends CallbackData>(data: Data | Data[], handler: CallbackQueryHandler<Data, UserData>): this {
    for (const dataString of typeof data === 'string' ? [data] : data) {
      this._handlers[dataString] = handler;
    }

    return this;
  }

  parseCallbackData(dataString: string): CallbackData | null {
    return dataString as CallbackData;
  }

  stringifyData(data: CallbackData): string {
    return data;
  }
}
