import { InlineKeyboardMarkup } from 'typescript-telegram-bot-api/dist/types';

import { BaseCommand, TelegramBot } from '../TelegramBot';
import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { InlineKeyboard } from '../inlineKeyboard';
import { isTruthy } from './is';

const BUTTON_TEXT_LIMIT = 120;

export function prepareInlineKeyboard<CommandType extends BaseCommand, CallbackData, UserData>(
  bot: TelegramBot<CommandType, CallbackData, UserData>,
  keyboard: InlineKeyboard<CallbackData>,
): InlineKeyboardMarkup {
  return {
    inline_keyboard: keyboard
      .filter(isTruthy)
      .map((row) =>
        row.filter(isTruthy).map((button) => {
          if (!button.text) {
            throw new TelegramBotError(TelegramBotErrorCode.EmptyButtonText);
          }

          const buttonText =
            button.text.length > BUTTON_TEXT_LIMIT ? `${button.text.slice(0, BUTTON_TEXT_LIMIT - 1)}…` : button.text;

          if (button.type === 'url') {
            return {
              text: buttonText,
              url: button.url,
            };
          }

          const callbackDataString = bot.callbackDataProvider?.stringifyData(button.callbackData);

          if (callbackDataString && callbackDataString.length > 64) {
            throw new TelegramBotError(TelegramBotErrorCode.LongCallbackData, {
              message: `Callback data too long: (${JSON.stringify(callbackDataString)})`,
            });
          }

          return {
            text: buttonText,
            callback_data: callbackDataString,
          };
        }),
      )
      .filter((row) => row.length > 0),
  };
}
