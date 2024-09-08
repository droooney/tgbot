import { TelegramBot } from '../../lib';
import ImmediateTextResponse from '../../lib/response/ImmediateTextResponse';
import { CreateBot } from '../runExample';

const commands = {
  '/simple': 'Simple response',
};

type BotCommand = keyof typeof commands | '/start';

const createBot: CreateBot = (token) => {
  const bot = new TelegramBot<BotCommand>({
    token: process.env.TOKEN ?? '',
    commands,
  });

  bot.handleCommand('/start', async () => {
    return new ImmediateTextResponse({
      text: 'Hi',
    });
  });

  bot.handleCommand('/simple', async () => {
    return new ImmediateTextResponse({
      text: 'Simple response',
    });
  });

  return bot;
};

export default createBot;
