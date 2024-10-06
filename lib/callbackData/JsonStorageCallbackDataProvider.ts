import { randomUUID } from 'node:crypto';

/* eslint-disable brace-style */
import { BaseCommand } from '../TelegramBot';
import { MaybePromise } from '../types';
import { BaseJsonCallbackData, BaseJsonCallbackDataType, JsonCallbackDataProvider } from './JsonCallbackDataProvider';

export type JsonStorageCallbackDataProviderOptions<CallbackData> = {
  getData: (dataId: string) => MaybePromise<CallbackData | null>;
  setData: (dataId: string, data: CallbackData | null) => unknown;
  clearData: () => unknown;
};

export class JsonStorageCallbackDataProvider<
  CommandType extends BaseCommand = never,
  CallbackData extends BaseJsonCallbackData<BaseJsonCallbackDataType> = never,
  UserData = never,
> extends JsonCallbackDataProvider<CommandType, CallbackData, UserData> {
  /* eslint-enable brace-style */

  private readonly _getData: JsonStorageCallbackDataProviderOptions<CallbackData>['getData'];
  private readonly _setData: JsonStorageCallbackDataProviderOptions<CallbackData>['setData'];
  private readonly _clearData: JsonStorageCallbackDataProviderOptions<CallbackData>['clearData'];

  constructor(options: JsonStorageCallbackDataProviderOptions<CallbackData>) {
    super();

    this._getData = options.getData;
    this._setData = options.setData;
    this._clearData = options.clearData;
  }

  async clear(): Promise<void> {
    await this._clearData();
  }

  parseCallbackData(dataString: string): MaybePromise<CallbackData | null> {
    return this._getData(dataString);
  }

  async stringifyData(data: CallbackData): Promise<string> {
    const dataId = randomUUID();

    await this._setData(dataId, data);

    return dataId;
  }
}
