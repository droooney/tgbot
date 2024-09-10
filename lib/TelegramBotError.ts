export const TelegramBotErrorCode = {
  EditSameContent: 'EditSameContent',
  EmptyButtonText: 'EmptyButtonText',
  LongCallbackData: 'LongCallbackData',
  UnsupportedCallbackData: 'UnsupportedCallbackData',
  UnsupportedContent: 'UnsupportedContent',
} as const;

export type TelegramBotErrorCode = (typeof TelegramBotErrorCode)[keyof typeof TelegramBotErrorCode];

export type TelegramBotErrorOptions = ErrorOptions & {
  message?: string;
};

export class TelegramBotError extends Error {
  readonly code: TelegramBotErrorCode;

  constructor(code: TelegramBotErrorCode, options?: TelegramBotErrorOptions) {
    super(options?.message ?? code, options);

    this.code = code;
  }
}
