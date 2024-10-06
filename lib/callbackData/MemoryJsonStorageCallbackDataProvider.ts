import { BaseCommand } from '../TelegramBot';
import { BaseJsonCallbackData, BaseJsonCallbackDataType } from './JsonCallbackDataProvider';
import { JsonStorageCallbackDataProvider } from './JsonStorageCallbackDataProvider';

export class MemoryJsonStorageCallbackDataProvider<
  CommandType extends BaseCommand = never,
  CallbackData extends BaseJsonCallbackData<BaseJsonCallbackDataType> = never,
  UserData = never,
> extends JsonStorageCallbackDataProvider<CommandType, CallbackData, UserData> {
  private readonly _callbackDataMap = new Map<string, CallbackData>();

  constructor() {
    super({
      getData: (dataId) => this._callbackDataMap.get(dataId) ?? null,
      setData: (dataId, data) => {
        if (data) {
          this._callbackDataMap.set(dataId, data);
        } else {
          this._callbackDataMap.delete(dataId);
        }
      },
      clearData: () => {
        this._callbackDataMap.clear();
      },
    });
  }
}
