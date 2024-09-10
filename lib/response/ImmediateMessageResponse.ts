import {
  EditMessageReplyMarkupOptions,
  InlineKeyboardMarkup,
  Message,
  ParseMode,
  SendBasicOptions,
} from 'node-telegram-bot-api';

import { BaseCommand } from '../TelegramBot';

import { Markdown } from '../Markdown';
import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { EditMessageContext, MessageResponse, MessageResponseOptions, SendMessageContext } from './MessageResponse';

export type MessageResponseTextContent = {
  type: 'text';
  text: string | Markdown;
  parseMode?: ParseMode;
  disableWebPagePreview?: boolean;
};

export type MessageResponseContent = MessageResponseTextContent;

export type ImmediateMessageResponseOptions<CallbackData> = MessageResponseOptions<CallbackData> & {
  content: MessageResponseContent;
};

export class ImmediateMessageResponse<CallbackData> extends MessageResponse<CallbackData> {
  readonly content: MessageResponseContent;

  constructor(options: ImmediateMessageResponseOptions<CallbackData>) {
    super(options);

    this.content = options.content;
  }

  async editMessage<CommandType extends BaseCommand, BotCallbackData, UserData>(
    ctx: CallbackData extends BotCallbackData ? EditMessageContext<CommandType, BotCallbackData, UserData> : never,
  ): Promise<Message> {
    const editBasicOptions: EditMessageReplyMarkupOptions & {
      reply_markup?: InlineKeyboardMarkup;
    } = {
      chat_id: ctx.message.chat.id,
      message_id: ctx.message.message_id,
      reply_markup: this.getReplyMarkup(ctx.bot as never),
    };
    const { content } = this;

    if (content.type === 'text') {
      let editedMessage: Message | null = null;

      try {
        const editResult = await ctx.bot.api.editMessageText(content.text.toString(), {
          chat_id: ctx.message.chat.id,
          message_id: ctx.message.message_id,
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          reply_markup: this.getReplyMarkup(ctx.bot as never),
          disable_web_page_preview: content.disableWebPagePreview,
        });

        if (typeof editResult === 'object') {
          editedMessage = editResult;
        }
      } catch (err) {
        if (!(err instanceof Error) || !/message is not modified/.test(err.message)) {
          throw err;
        }
      }

      if (!editedMessage) {
        throw new TelegramBotError(TelegramBotErrorCode.EditSameContent);
      }

      return editedMessage;
    }

    throw new TelegramBotError(TelegramBotErrorCode.UnsupportedContent);
  }

  async sendMessage<CommandType extends BaseCommand, BotCallbackData, UserData>(
    ctx: CallbackData extends BotCallbackData ? SendMessageContext<CommandType, BotCallbackData, UserData> : never,
  ): Promise<Message> {
    const sendBasicOptions: SendBasicOptions = {
      message_thread_id: ctx.messageThreadId,
      disable_notification: ctx.disableNotification,
      reply_to_message_id: ctx.replyToMessageId,
      reply_markup: this.getReplyMarkup(ctx.bot as never),
      protect_content: ctx.protectContent,
      allow_sending_without_reply: ctx.allowSendingWithoutReply,
    };
    const { content } = this;

    if (content.type === 'text') {
      return ctx.bot.api.sendMessage(ctx.chatId, content.text.toString(), {
        ...sendBasicOptions,
        parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
        // TODO: replace
        disable_web_page_preview: content.disableWebPagePreview,
      });
    }

    throw new TelegramBotError(TelegramBotErrorCode.UnsupportedContent);
  }
}
