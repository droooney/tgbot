import { ImmediateTextResponse, Markdown, TelegramBot } from '../../lib';
import { CreateBot } from '../runExample';

const commands = {
  '/simple': 'Simple response',
  '/markdown': 'Markdown',
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

  bot.handleCommand('/markdown', async () => {
    return new ImmediateTextResponse({
      text: Markdown.create`plain text

${Markdown.bold('bold')}

${Markdown.italic('italic')}

${Markdown.bold(Markdown.italic('bold italic'))}

${Markdown.italic(Markdown.bold('italic bold'))}

${Markdown.italic(Markdown.underline('italic underline'))}

${Markdown.underline(Markdown.italic('underline italic'))}

${Markdown.strikethrough('strikethrough')}

${Markdown.fixedWidth('*fixed width*')}

${Markdown.code(
  null,
  `no language code
with multiple rows`,
)}

${Markdown.code(
  'json',
  `{
  "json": "code",
  "key": 0
}`,
)}

${Markdown.spoiler(Markdown.create`123 ${Markdown.bold(456)} 789`)}

${Markdown.url('https://google.com', 'Google')}

${Markdown.telegramUser(493571366, 'tg:droooney')}

${Markdown.blockquote(`blockqute start
blockqute row 1
blockqute row 2
blockqute row 3
blockqute row 4
blockqute row 5
blockqute row 6
blockqute row 7
blockqute row 8
blockqute row 9`)}

${Markdown.blockquote(
  `expandable blockqute start
blockqute row 1
blockqute row 2
blockqute row 3
blockqute row 4
blockqute row 5
blockqute row 6
blockqute row 7
blockqute row 8
blockqute row 9`,
  true,
)}
`,
    });
  });

  return bot;
};

export default createBot;
