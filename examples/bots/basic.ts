import fs from 'node:fs';
import path from 'node:path';

import {
  MessageAction as LibMessageAction,
  Markdown,
  MessageReactionAction,
  NotificationAction,
  StringCallbackDataProvider,
  TelegramBot,
  WaitingAction,
} from '../../lib';
import { CreateBot } from '../runExample';

const commands = {
  '/start': undefined,
  '/simple': 'Simple text response',
  '/markdown': 'Markdown',
  '/photo': 'Photo',
  '/audio': 'Audio',
  '/document': 'Document',
  '/large_document': 'Large document',
  '/video': 'Video',
  '/voice': 'Voice',
  '/video_note': 'Video note',
  '/contact': 'Contact',
  '/dice': 'Dice',
  '/sticker': 'Sticker',
  '/reaction': 'Random reaction',
  '/notification_showcase': 'Notification showcase',
};

type BotCommand = keyof typeof commands;

type CallbackData =
  | 'editSimpleText'
  | 'editPhoto'
  | 'editAudio'
  | 'editDocument'
  | 'editDocumentWithPhoto'
  | 'editVideo'
  | 'responseWithNotification'
  | 'responseWithNotificationAlert';

const MessageAction = LibMessageAction<BotCommand, CallbackData>;

const reactionsPool = ['👍', '👎', '❤', '🔥', '🥰', '👏', '😁', '🤔', '🤯', '😱', '🤬', '😢', '🎉'] as const;
const dicePool = ['🎲', '🎯', '🏀', '⚽', '🎳', '🎰'] as const;

const createBot: CreateBot<BotCommand, CallbackData> = (token) => {
  const callbackDataProvider = new StringCallbackDataProvider<BotCommand, CallbackData>();
  const bot = new TelegramBot({
    token,
    commands,
    callbackDataProvider,
  });

  bot.handleCommand('/start', async () => {
    return new MessageAction({
      content: {
        type: 'text',
        text: 'Hi',
      },
    });
  });

  bot.handleCommand('/simple', async () => {
    return new MessageAction({
      content: {
        type: 'text',
        text: 'Simple text response',
      },
      replyMarkup: [
        [
          {
            type: 'callbackData',
            text: 'Edit text',
            callbackData: 'editSimpleText',
          },
        ],
      ],
    });
  });

  bot.handleCommand('/markdown', async () => {
    return new MessageAction({
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

  bot.handleCommand('/photo', async () => {
    return new MessageAction({
      content: {
        type: 'photo',
        photo: fs.createReadStream(path.resolve('./examples/assets/house.png')),
        text: Markdown.create`caption with ${Markdown.bold('bold')} text`,
      },
      replyMarkup: [
        [
          {
            type: 'callbackData',
            text: 'Edit photo',
            callbackData: 'editPhoto',
          },
        ],
      ],
    });
  });

  bot.handleCommand('/audio', async () => {
    return new MessageAction({
      content: {
        type: 'audio',
        audio: fs.createReadStream(path.resolve('./examples/assets/audio1.mp3')),
        text: Markdown.create`caption with ${Markdown.bold('bold')} text`,
        performer: 'Cool performer',
        title: 'Cool title',
        thumbnail: fs.createReadStream(path.resolve('./examples/assets/thumb1.png')),
      },
      replyMarkup: [
        [
          {
            type: 'callbackData',
            text: 'Edit audio',
            callbackData: 'editAudio',
          },
        ],
      ],
    });
  });

  bot.handleCommand('/document', async () => {
    return new MessageAction({
      content: {
        type: 'document',
        document: fs.createReadStream(path.resolve('./examples/assets/file1.txt')),
        text: Markdown.create`caption with ${Markdown.bold('bold')} text`,
      },
      replyMarkup: [
        [
          {
            type: 'callbackData',
            text: 'Edit document',
            callbackData: 'editDocument',
          },
        ],
        [
          {
            type: 'callbackData',
            text: 'Edit document with photo',
            callbackData: 'editDocumentWithPhoto',
          },
        ],
      ],
    });
  });

  bot.handleCommand('/large_document', async () => {
    return new WaitingAction({
      type: 'upload_document',
      getAction: () =>
        new MessageAction({
          content: {
            type: 'document',
            document: fs.createReadStream(path.resolve('./examples/assets/video0.mp4')),
          },
        }),
    });
  });

  bot.handleCommand('/video', async () => {
    return new WaitingAction({
      type: 'upload_video',
      getAction: () =>
        new MessageAction({
          content: {
            type: 'video',
            video: fs.createReadStream(path.resolve('./examples/assets/video1.mp4')),
            text: Markdown.create`caption with ${Markdown.bold('bold')} text`,
            thumbnail: fs.createReadStream(path.resolve('./examples/assets/thumb1.png')),
          },
          replyMarkup: [
            [
              {
                type: 'callbackData',
                text: 'Edit video',
                callbackData: 'editVideo',
              },
            ],
          ],
        }),
    });
  });

  bot.handleCommand('/voice', async () => {
    return new MessageAction({
      content: {
        type: 'voice',
        voice: fs.createReadStream(path.resolve('./examples/assets/audio1.mp3')),
        text: Markdown.create`caption with ${Markdown.bold('bold')} text`,
      },
    });
  });

  bot.handleCommand('/video_note', async () => {
    return new WaitingAction({
      type: 'upload_video_note',
      getAction: () =>
        new MessageAction({
          content: {
            type: 'videoNote',
            videoNote: fs.createReadStream(path.resolve('./examples/assets/video_note.mp4')),
            thumbnail: fs.createReadStream(path.resolve('./examples/assets/thumb1.png')),
          },
        }),
    });
  });

  bot.handleCommand('/contact', async () => {
    return new MessageAction({
      content: {
        type: 'contact',
        phoneNumber: '+71234567890',
        firstName: 'Jimmy',
        lastName: 'Baxter',
      },
    });
  });

  bot.handleCommand('/dice', async () => {
    return new MessageAction({
      content: {
        type: 'dice',
        emoji: dicePool[Math.floor(Math.random() * dicePool.length)],
      },
    });
  });

  bot.handleCommand('/sticker', async () => {
    return new MessageAction({
      content: {
        type: 'sticker',
        sticker: 'CAACAgIAAxkBAAO8Zu4QdD3371GUb8FesINmN-A8pWcAAgEAA8A2TxMYLnMwqz8tUTYE',
      },
    });
  });

  bot.handleCommand('/reaction', async () => {
    return new MessageReactionAction({
      reaction: {
        type: 'emoji',
        emoji: reactionsPool[Math.floor(Math.random() * reactionsPool.length)],
      },
    });
  });

  bot.handleCommand('/notification_showcase', async () => {
    return new MessageAction({
      content: {
        type: 'text',
        text: 'Notification showcase',
      },
      replyMarkup: [
        [
          {
            type: 'callbackData',
            text: 'Notification response',
            callbackData: 'responseWithNotification',
          },
        ],
        [
          {
            type: 'callbackData',
            text: 'Alert response',
            callbackData: 'responseWithNotificationAlert',
          },
        ],
      ],
    });
  });

  callbackDataProvider.handle('editSimpleText', async () => {
    return new MessageAction({
      content: {
        type: 'text',
        text: 'edited text',
      },
    });
  });

  callbackDataProvider.handle(['editPhoto', 'editDocumentWithPhoto'], async () => {
    return new MessageAction({
      content: {
        type: 'photo',
        photo: fs.createReadStream(path.resolve('./examples/assets/house_heart.png')),
        text: Markdown.create`edited caption with ${Markdown.bold('bold')} text`,
      },
    });
  });

  callbackDataProvider.handle('editAudio', async () => {
    return new MessageAction({
      content: {
        type: 'audio',
        audio: fs.createReadStream(path.resolve('./examples/assets/audio2.mp3')),
        text: Markdown.create`edited caption with ${Markdown.bold('bold')} text`,
        performer: 'New performer',
        title: 'New title',
        thumbnail: fs.createReadStream(path.resolve('./examples/assets/thumb2.png')),
      },
    });
  });

  callbackDataProvider.handle('editDocument', async () => {
    return new MessageAction({
      content: {
        type: 'document',
        document: fs.createReadStream(path.resolve('./examples/assets/file2.txt')),
        text: Markdown.create`edited caption with ${Markdown.bold('bold')} text`,
      },
    });
  });

  callbackDataProvider.handle('editVideo', async () => {
    return new MessageAction({
      content: {
        type: 'video',
        video: fs.createReadStream(path.resolve('./examples/assets/video2.mp4')),
        text: Markdown.create`edited caption with ${Markdown.bold('bold')} text`,
        thumbnail: fs.createReadStream(path.resolve('./examples/assets/thumb2.png')),
      },
    });
  });

  callbackDataProvider.handle('responseWithNotification', async () => {
    return new NotificationAction({
      text: 'Notification response',
    });
  });

  callbackDataProvider.handle('responseWithNotificationAlert', async () => {
    return new NotificationAction({
      text: 'Alert response',
      showAlert: true,
    });
  });

  return bot;
};

export default createBot;
