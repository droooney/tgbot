import { ReplyKeyboardMarkup } from 'typescript-telegram-bot-api/dist/types';
import { KeyboardButton } from 'typescript-telegram-bot-api/dist/types/KeyboardButton';

import { isTruthy } from './utils/is';

export type BaseReplyKeyboardButton = {
  text: string;
};

export type TextReplyKeyboardButton = BaseReplyKeyboardButton & {
  type: 'text';
};

export type RequestUsersReplyKeyboardButton = BaseReplyKeyboardButton & {
  type: 'requestUsers';
  requestId: number;
  isBot?: boolean;
  isPremium?: boolean;
  maxQuantity?: number;
  requestName?: string;
  requestUsername?: string;
  requestPhoto?: string;
};

// TODO: request chat button

export type RequestContactReplyKeyboardButton = BaseReplyKeyboardButton & {
  type: 'requestContact';
};

export type RequestLocationReplyKeyboardButton = BaseReplyKeyboardButton & {
  type: 'requestLocation';
};

export type RequestPollReplyKeyboardButton = BaseReplyKeyboardButton & {
  type: 'requestPoll';
  pollType?: 'quiz' | 'regular';
};

export type WebAppReplyKeyboardButton = BaseReplyKeyboardButton & {
  type: 'webApp';
  url: string;
};

export type ReplyKeyboardButton =
  | TextReplyKeyboardButton
  | RequestUsersReplyKeyboardButton
  | RequestContactReplyKeyboardButton
  | RequestLocationReplyKeyboardButton
  | RequestPollReplyKeyboardButton
  | WebAppReplyKeyboardButton;

export type ReplyKeyboardOptions = {
  buttons: ((ReplyKeyboardButton | null | undefined | false | '')[] | null | undefined | false | '')[];
  isPersistent?: boolean;
  resize?: boolean;
  oneTime?: boolean;
  inputFieldPlaceholder?: string;
  selective?: boolean;
};

export class ReplyKeyboard {
  readonly buttons: ReplyKeyboardButton[][];
  readonly isPersistent?: boolean;
  readonly resize?: boolean;
  readonly oneTime?: boolean;
  readonly inputFieldPlaceholder?: string;
  readonly selective?: boolean;

  constructor(options: ReplyKeyboardOptions) {
    this.buttons = options.buttons
      .filter(isTruthy)
      .map((row) => row.filter(isTruthy))
      .filter((row) => row.length > 0);
    this.isPersistent = options.isPersistent;
    this.resize = options.resize;
    this.oneTime = options.oneTime;
    this.inputFieldPlaceholder = options.inputFieldPlaceholder;
    this.selective = options.selective;
  }

  getMarkup(): ReplyKeyboardMarkup {
    return {
      keyboard: this.buttons.map((row) =>
        row.map((button) => {
          if (button.type === 'requestUsers') {
            return {
              text: button.text,
              request_users: {
                request_id: button.requestId,
                user_is_bot: button.isBot,
                user_is_premium: button.isPremium,
                max_quantity: button.maxQuantity,
                request_name: button.requestName,
                request_username: button.requestUsername,
                request_photo: button.requestPhoto,
              },
            };
          }

          if (button.type === 'requestContact') {
            return {
              text: button.text,
              request_contact: true,
            };
          }

          if (button.type === 'requestLocation') {
            return {
              text: button.text,
              request_location: true,
            };
          }

          if (button.type === 'requestPoll') {
            return {
              text: button.text,
              request_poll: {
                // FIXME: remove when typings are fixed
                type: button.type as 'regular',
              },
            };
          }

          if (button.type === 'webApp') {
            return {
              text: button.text,
              web_app: {
                url: button.url,
              },
            };
          }

          return {
            text: button.text,
            // FIXME: remove when typings are fixed
          } as KeyboardButton;
        }),
      ),
      is_persistent: this.isPersistent,
      resize_keyboard: this.resize,
      one_time_keyboard: this.oneTime,
      input_field_placeholder: this.inputFieldPlaceholder,
      selective: this.selective,
    };
  }
}
