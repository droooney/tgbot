import { BaseCommand, TextHandler } from '../TelegramBot';
import { UserDataProvider } from './UserDataProvider';

export abstract class StringUserDataProvider<
  CommandType extends BaseCommand,
  CallbackData,
  UserData extends string,
> extends UserDataProvider<CommandType, CallbackData, UserData> {
  private readonly _handlers: {
    [Data in UserData]?: TextHandler<CommandType, CallbackData, UserData, Data>;
  } = {};

  getUserDataHandler = <Data extends UserData>(
    userData: Data,
  ): TextHandler<CommandType, CallbackData, UserData, Data> | null => {
    return this._handlers[userData] ?? null;
  };

  handle<Data extends UserData>(
    data: Data | Data[],
    handler: TextHandler<CommandType, CallbackData, UserData, Data>,
  ): this {
    for (const dataString of typeof data === 'string' ? [data] : data) {
      this._handlers[dataString] = handler;
    }

    return this;
  }
}
