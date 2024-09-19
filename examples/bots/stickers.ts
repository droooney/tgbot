import * as fs from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import { ImmediateMessageResponse, JsonCallbackDataProvider, MultipleMessageResponse, TelegramBot } from '../../lib';
import { CreateBot } from '../runExample';

const commands = {
  '/create_sticker_set': 'Create sticker set',
};

type BotCommand = keyof typeof commands;

const createBot: CreateBot = (token) => {
  const callbackData = z.object({
    type: z.literal('deleteSet'),
    id: z.string(),
  });

  type CallbackData = z.TypeOf<typeof callbackData>;

  const callbackDataProvider = new JsonCallbackDataProvider<BotCommand, CallbackData>({
    parseJson: (json) => callbackData.parse(JSON.parse(json)),
  });
  const bot = new TelegramBot({
    token,
    commands,
    callbackDataProvider,
  });

  const getTestSetName = async (id: string) => {
    const info = await bot.api.getMe();

    return `test_${id}_by_${info.username}`;
  };

  bot.handleCommand('/create_sticker_set', async (ctx) => {
    const user = ctx.message.from;

    if (!user) {
      return;
    }

    const id = Math.random().toString().slice(2);

    await bot.api.createNewStickerSet({
      user_id: user.id,
      name: await getTestSetName(id),
      title: 'Test Sticker Set',
      stickers: [
        {
          format: 'static',
          sticker: fs.createReadStream(path.resolve('./examples/assets/tree.png')),
          emoji_list: ['😁', '😃', '😅'],
        },
      ],
    });

    return new MultipleMessageResponse([
      new ImmediateMessageResponse({
        content: {
          type: 'text',
          text: 'Set created',
        },
        replyMarkup: [
          [
            {
              type: 'callbackData',
              text: 'Delete set',
              callbackData: {
                type: 'deleteSet',
                id,
              },
            },
          ],
        ],
      }),
    ]);
  });

  callbackDataProvider.handle('deleteSet', async ({ data: { id } }) => {
    await bot.api.deleteStickerSet({
      name: await getTestSetName(id),
    });

    return new ImmediateMessageResponse({
      content: {
        type: 'text',
        text: 'Set deleted',
      },
    });
  });

  return bot;
};

export default createBot;
