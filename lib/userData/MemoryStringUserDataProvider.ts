import { BaseCommand } from '../TelegramBot';
import { MaybePromise } from '../types';
import { StringUserDataProvider } from './StringUserDataProvider';

export type MemoryStringUserDataProviderOptions<UserData extends string> = {
  defaultValue: UserData | ((userId: number) => UserData);
};

export class MemoryStringUserDataProvider<
  CommandType extends BaseCommand,
  CallbackData,
  UserData extends string,
> extends StringUserDataProvider<CommandType, CallbackData, UserData> {
  private readonly _getDefaultValue: (userId: number) => MaybePromise<UserData>;

  constructor(options: MemoryStringUserDataProviderOptions<UserData>) {
    super();

    const { defaultValue } = options;

    this._getDefaultValue = typeof defaultValue === 'string' ? () => defaultValue : defaultValue;
  }

  getOrCreateUserData(userId: number): MaybePromise<UserData> {
    return this._getDefaultValue(userId);
  }
}
