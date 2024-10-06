import { BaseCommand, MessageHandler } from '../TelegramBot';
import { MaybePromise } from '../types';
import { UserDataProvider } from './UserDataProvider';

export type StringUserDataProviderOptions<UserData extends string> = {
  getOrCreateUserData: (userId: number) => MaybePromise<UserData>;
  setUserData: (userId: number, data: UserData) => MaybePromise<void>;
};

/* eslint-disable brace-style */
export class StringUserDataProvider<
  CommandType extends BaseCommand = never,
  CallbackData = never,
  UserData extends string = never,
> implements UserDataProvider<CommandType, CallbackData, UserData>
{
  /* eslint-enable brace-style */
  private readonly _handlers: {
    [Data in UserData]?: MessageHandler<CommandType, CallbackData, UserData, Data, true>;
  } = {};

  getOrCreateUserData: (userId: number) => MaybePromise<UserData>;
  setUserData: (userId: number, data: UserData) => MaybePromise<void>;

  constructor(options: StringUserDataProviderOptions<UserData>) {
    this.getOrCreateUserData = options.getOrCreateUserData;
    this.setUserData = options.setUserData;
  }

  getUserDataHandler<Data extends UserData>(
    userData: Data,
  ): MessageHandler<CommandType, CallbackData, UserData, Data, true> | null {
    return this._handlers[userData] ?? null;
  }

  handle<Data extends UserData>(
    data: Data | Data[],
    handler: MessageHandler<CommandType, CallbackData, UserData, Data, true>,
  ): this {
    for (const dataString of typeof data === 'string' ? [data] : data) {
      this._handlers[dataString] = handler;
    }

    return this;
  }
}
