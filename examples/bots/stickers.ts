import * as fs from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import { ImmediateMessageResponse, JsonCallbackDataProvider, MultipleMessageResponse, TelegramBot } from '../../lib';
import { CreateBot } from '../runExample';

const commands = {
  '/create_sticker_set': 'Create sticker set',
};

type BotCommand = keyof typeof commands;

const callbackData = z.object({
  type: z.literal('deleteSet'),
  id: z.string(),
});

type CallbackData = z.TypeOf<typeof callbackData>;

const createBot: CreateBot<BotCommand, CallbackData> = (token) => {
  const callbackDataProvider = new JsonCallbackDataProvider<BotCommand, CallbackData>({
    parseJson: (json) => callbackData.parse(JSON.parse(json)),
  });
  const bot = new TelegramBot({
    token,
    commands,
    callbackDataProvider,
  });

  const getTestSetName = async (id: string): Promise<string> => {
    const info = await bot.api.getMe();

    return `test_${id}_by_${info.username}`;
  };

  bot.handleCommand('/create_sticker_set', async (ctx) => {
    const user = ctx.message.from;

    if (!user) {
      return;
    }

    const id = Math.random().toString().slice(2);
    const name = await getTestSetName(id);

    await bot.api.createNewStickerSet({
      user_id: user.id,
      name,
      title: 'Test Sticker Set',
      stickers: [
        {
          format: 'static',
          sticker: fs.createReadStream(path.resolve('./examples/assets/tree.png')),
          emoji_list: ['😁', '😃', '😅'],
        },
      ],
    });

    const stickerSet = await bot.api.getStickerSet({
      name,
    });

    const sticker = stickerSet.stickers.at(0)?.file_id;

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
      sticker &&
        new ImmediateMessageResponse({
          content: {
            type: 'sticker',
            sticker,
          },
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
