import { BaseCommand, TextHandler } from '../TelegramBot';
import { UserDataProvider } from './UserDataProvider';

export abstract class StringUserDataProvider<
  CommandType extends BaseCommand,
  UserData extends string,
> extends UserDataProvider<CommandType, UserData> {
  private readonly _handlers: {
    [Data in UserData]?: TextHandler<CommandType, Data>;
  } = {};

  getUserDataHandler(userData: UserData): TextHandler<CommandType, UserData> | null {
    return this._handlers[userData] ?? null;
  }

  handle<Data extends UserData>(data: Data | Data[], handler: TextHandler<CommandType, Data>): this {
    for (const dataString of typeof data === 'string' ? [data] : data) {
      this._handlers[dataString] = handler;
    }

    return this;
  }
}
