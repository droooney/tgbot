import { BaseCommand } from '../TelegramBot';
import { MaybePromise } from '../types';
import { upsertInMap } from '../utils';
import { BaseJsonUserData, BaseJsonUserDataState, JsonUserDataProvider } from './JsonUserDataProvider';

export type MemoryJsonUserDataProviderOptions<UserData extends BaseJsonUserData<BaseJsonUserDataState>> = {
  defaultValue: UserData | ((userId: number) => UserData);
};

export class MemoryJsonUserDataProvider<
  CommandType extends BaseCommand,
  CallbackData,
  UserData extends BaseJsonUserData<BaseJsonUserDataState>,
> extends JsonUserDataProvider<CommandType, CallbackData, UserData> {
  private readonly _userDataMap = new Map<number, UserData>();
  private readonly _getDefaultValue: (userId: number) => MaybePromise<UserData>;

  constructor(options: MemoryJsonUserDataProviderOptions<UserData>) {
    super({
      getOrCreateUserData: (userId) => upsertInMap(this._userDataMap, userId, () => this._getDefaultValue(userId)),
      setUserData: (userId, data) => {
        this._userDataMap.set(userId, data);
      },
    });

    const { defaultValue } = options;

    this._getDefaultValue = typeof defaultValue === 'function' ? defaultValue : () => defaultValue;
  }
}
