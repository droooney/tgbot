import { ImmediateMessageResponse, Markdown, TelegramBot } from '../../lib';
import { CreateBot } from '../runExample';

const commands = {
  '/start': undefined,
  '/simple': 'Simple text response',
  '/markdown': 'Markdown',
};

const createBot: CreateBot<keyof typeof commands> = (token) => {
  const bot = new TelegramBot<keyof typeof commands, never, never>({
    token,
    commands,
  });

  bot.handleCommand('/start', async () => {
    return new ImmediateMessageResponse({
      content: {
        type: 'text',
        text: 'Hi',
      },
    });
  });

  bot.handleCommand('/simple', async () => {
    return new ImmediateMessageResponse({
      content: {
        type: 'text',
        text: 'Simple text response',
      },
    });
  });

  bot.handleCommand('/markdown', async () => {
    return new ImmediateMessageResponse({
      content: {
        type: 'text',
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

${Markdown.blockquote(`blockquote start
blockquote row 1
blockquote row 2
blockquote row 3
blockquote row 4
blockquote row 5
blockquote row 6
blockquote row 7
blockquote row 8
blockquote row 9`)}

${Markdown.blockquote(
  `expandable blockquote start
blockquote row 1
blockquote row 2
blockquote row 3
blockquote row 4
blockquote row 5
blockquote row 6
blockquote row 7
blockquote row 8
blockquote row 9`,
  true,
)}
`,
      },
    });
  });

  return bot;
};

export default createBot;
