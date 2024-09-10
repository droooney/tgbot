import path from 'node:path';

import { ImmediateMessageResponse, TelegramBot } from '../../lib';
import { CreateBot } from '../runExample';

const commands = {
  '/create_sticker_set': 'Create sticker set',
};

type BotCommand = keyof typeof commands;

const createBot: CreateBot = (token) => {
  const bot = new TelegramBot<BotCommand>({
    token: process.env.TOKEN ?? '',
    commands,
  });

  bot.handleCommand('/create_sticker_set', async (ctx) => {
    const user = ctx.message.from;

    if (!user) {
      return;
    }

    const info = await bot.api.getMe();

    await bot.api.createNewStickerSet(
      user.id,
      `test_${Math.random().toString().slice(2)}_by_${info.username}`,
      'Test Sticker Set',
      path.resolve('./examples/assets/tree.png'),
      '😁😃😅',
    );

    return new ImmediateMessageResponse({
      content: {
        type: 'text',
        text: 'Set created',
      },
    });
  });

  return bot;
};

export default createBot;
