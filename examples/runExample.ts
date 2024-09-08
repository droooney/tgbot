import { TelegramBot } from '../lib';

export type CreateBot = (token: string) => TelegramBot<any, any, any>;

const example = process.argv.at(2);

if (!example) {
  throw new Error('No example');
}

(async () => {
  try {
    const token = process.env.TOKEN;

    if (!token) {
      throw new Error('No token');
    }

    const { default: createBot }: { default: CreateBot } = await import(`./bots/${example}`);
    const bot = createBot(token);

    await bot.start();

    console.log('Bot started');
  } catch (err) {
    console.log(err);

    process.exit(1);
  }
})();
