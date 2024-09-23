import { z } from 'zod';

import {
  JsonCallbackDataProvider,
  ImmediateMessageResponse as LibImmediateMessageResponse,
  NotificationResponse,
  ReplyKeyboard,
  TelegramBot,
} from '../../lib';
import { CreateBot } from '../runExample';

const commands = {
  '/start': undefined,
  '/simple_inline': 'Simple reply keyboard',
  '/simple_reply': 'Simple reply keyboard',
};

type BotCommand = keyof typeof commands;

const callbackData = z.object({
  type: z.literal('simpleButton'),
});

type CallbackData = z.TypeOf<typeof callbackData>;

const ImmediateMessageResponse = LibImmediateMessageResponse<BotCommand, CallbackData>;

const createBot: CreateBot<BotCommand, CallbackData> = (token) => {
  const callbackDataProvider = new JsonCallbackDataProvider<BotCommand, CallbackData>({
    parseJson: (json) => callbackData.parse(JSON.parse(json)),
  });
  const bot = new TelegramBot({
    token,
    commands,
    callbackDataProvider,
  });

  bot.handleCommand('/start', async () => {
    return new ImmediateMessageResponse({
      content: {
        type: 'text',
        text: 'Hi',
      },
    });
  });

  bot.handleCommand('/simple_inline', async () => {
    return new ImmediateMessageResponse({
      content: {
        type: 'text',
        text: 'Simple inline keyboard',
      },
      replyMarkup: [
        [
          {
            type: 'callbackData',
            text: 'Simple inline button',
            callbackData: {
              type: 'simpleButton',
            },
          },
        ],
      ],
    });
  });

  bot.handleCommand('/simple_reply', async () => {
    return new ImmediateMessageResponse({
      content: {
        type: 'text',
        text: 'Simple reply keyboard',
      },
      replyMarkup: new ReplyKeyboard({
        buttons: [['Simple reply button']],
        resize: true,
        oneTime: true,
      }),
    });
  });

  callbackDataProvider.handle('simpleButton', async () => {
    return new NotificationResponse({
      text: 'Simple button response',
    });
  });

  return bot;
};

export default createBot;
