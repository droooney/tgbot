export type InlineKeyboard<CallbackData> = (
  | (InlineKeyboardButton<CallbackData> | null | undefined | false)[]
  | null
  | undefined
  | false
)[];

export type BaseInlineKeyboardButton = {
  text: string;
};

export type CallbackInlineKeyboardButton<CallbackData> = BaseInlineKeyboardButton & {
  type: 'callback';
  callbackData: CallbackData;
};

export type UrlInlineKeyboardButton = BaseInlineKeyboardButton & {
  type: 'url';
  url: string;
};

export type InlineKeyboardButton<CallbackData> = CallbackInlineKeyboardButton<CallbackData> | UrlInlineKeyboardButton;
