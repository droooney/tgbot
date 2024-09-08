import { CallbackQueryHandler } from '../TelegramBot';

import { CallbackDataProvider } from './CallbackDataProvider';

export type BaseJsonCallbackDataType = string;

export type BaseJsonCallbackData<Type extends BaseJsonCallbackDataType> = {
  type: Type;
};

export type JsonCallbackDataByType<
  Type extends BaseJsonCallbackDataType,
  CallbackData extends BaseJsonCallbackData<Type>,
  T extends Type,
> = Extract<CallbackData, { type: T }>;

export type JsonCallbackDataProviderOptions<
  Type extends BaseJsonCallbackDataType,
  CallbackData extends BaseJsonCallbackData<Type>,
> = {
  parseJson?: (json: string) => CallbackData;
};

export class JsonCallbackDataProvider<
  CallbackDataType extends BaseJsonCallbackDataType,
  CallbackData extends BaseJsonCallbackData<CallbackDataType>,
  UserData,
> extends CallbackDataProvider<CallbackData, UserData> {
  private readonly _handlers: {
    [Type in CallbackDataType]?: CallbackQueryHandler<
      JsonCallbackDataByType<CallbackDataType, CallbackData, Type>,
      UserData
    >;
  } = {};
  private readonly _parseJson: (json: string) => CallbackData;

  constructor(options: JsonCallbackDataProviderOptions<CallbackDataType, CallbackData>) {
    super();

    this._parseJson = options.parseJson ?? JSON.parse;
  }

  getCallbackQueryHandler<CbData extends CallbackData>(data: CbData): CallbackQueryHandler<CbData, UserData> | null {
    return (this._handlers[data.type] as CallbackQueryHandler<CbData, UserData> | undefined) ?? null;
  }

  handle<Type extends CallbackDataType>(
    type: Type,
    handler: CallbackQueryHandler<JsonCallbackDataByType<CallbackDataType, CallbackData, Type>, UserData>,
  ): this {
    for (const dataType of typeof type === 'string' ? [type] : type) {
      this._handlers[dataType] = handler;
    }

    return this;
  }

  parseCallbackData(dataString: string): CallbackData | null {
    let data: CallbackData;

    try {
      data = this._parseJson(dataString);
    } catch {
      return null;
    }

    return data;
  }

  stringifyData(data: CallbackData): string {
    return JSON.stringify(data);
  }
}
