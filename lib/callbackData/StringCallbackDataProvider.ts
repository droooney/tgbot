import { BaseCommand, CallbackQueryHandler } from '../TelegramBot';
import { CallbackDataProvider } from './CallbackDataProvider';

export class StringCallbackDataProvider<
  CommandType extends BaseCommand = never,
  CallbackData extends string = never,
  UserData = never,
> extends CallbackDataProvider<CommandType, CallbackData, UserData> {
  private readonly _handlers: {
    [Data in CallbackData]?: CallbackQueryHandler<CommandType, CallbackData, UserData, Data>;
  } = {};

  getCallbackQueryHandler = <Data extends CallbackData>(
    data: Data,
  ): CallbackQueryHandler<CommandType, CallbackData, UserData, Data> | null => {
    return this._handlers[data] ?? null;
  };

  handle<Data extends CallbackData>(
    data: Data | Data[],
    handler: CallbackQueryHandler<CommandType, CallbackData, UserData, Data>,
  ): this {
    for (const dataString of typeof data === 'string' ? [data] : data) {
      this._handlers[dataString] = handler;
    }

    return this;
  }

  parseCallbackData = (dataString: string): CallbackData | null => {
    return dataString as CallbackData;
  };

  stringifyData = (data: CallbackData): string => {
    return data;
  };
}
