import { InlineKeyboardMarkup, Message } from 'node-telegram-bot-api';

import { BaseCommand, TelegramBot } from '../TelegramBot';
import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { InlineKeyboard } from '../inlineKeyboard';
import { prepareInlineKeyboard } from '../utils/keyboard';
import { RespondToCallbackQueryContext, RespondToMessageContext, Response } from './Response';

export type EditMessageContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  message: Message;
};

export type SendMessageContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  chatId: number;
  messageThreadId?: number;
  replyToMessageId?: number;
  disableNotification?: boolean;
  protectContent?: boolean;
  allowSendingWithoutReply?: boolean;
};

export type ReplyMarkup<CallbackData> = InlineKeyboard<CallbackData>;

export type MessageResponseOptions<CallbackData> = {
  disableNotification?: boolean;
  replyMarkup?: ReplyMarkup<CallbackData>;
  protectContent?: boolean;
  allowSendingWithoutReply?: boolean;
};

export abstract class MessageResponse<CallbackData> extends Response {
  readonly disableNotification?: boolean;
  readonly replyMarkup?: ReplyMarkup<CallbackData>;
  readonly protectContent?: boolean;
  readonly allowSendingWithoutReply?: boolean;

  constructor(options?: MessageResponseOptions<CallbackData>) {
    super();

    this.disableNotification = options?.disableNotification;
    this.replyMarkup = options?.replyMarkup;
    this.protectContent = options?.protectContent;
    this.allowSendingWithoutReply = options?.allowSendingWithoutReply;
  }

  abstract editMessage<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: EditMessageContext<CommandType, CallbackData, UserData>,
  ): Promise<Message>;
  abstract sendMessage<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: SendMessageContext<CommandType, CallbackData, UserData>,
  ): Promise<Message>;

  getReplyMarkup<CommandType extends BaseCommand, BotCallbackData, UserData>(
    bot: CallbackData extends BotCallbackData ? TelegramBot<CommandType, BotCallbackData, UserData> : never,
  ): InlineKeyboardMarkup | undefined {
    return this.replyMarkup && prepareInlineKeyboard(bot, this.replyMarkup as InlineKeyboard<BotCallbackData>);
  }

  async respondToCallbackQuery<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: RespondToCallbackQueryContext<CommandType, CallbackData, UserData>,
  ): Promise<void> {
    const { id: queryId, message } = ctx.query;

    if (!message) {
      return;
    }

    try {
      await this.editMessage({
        message,
        bot: ctx.bot,
      });
    } catch (err) {
      if (err instanceof TelegramBotError && err.code === TelegramBotErrorCode.EditSameContent) {
        await ctx.bot.answerCallbackQuery(queryId, '');
      } else {
        throw err;
      }
    }
  }

  async respondToMessage<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: RespondToMessageContext<CommandType, CallbackData, UserData>,
  ): Promise<void> {
    await this.sendMessage({
      bot: ctx.bot,
      chatId: ctx.message.chat.id,
      messageThreadId: ctx.message.message_thread_id,
      replyToMessageId: ctx.message.message_id,
      disableNotification: this.disableNotification,
      protectContent: this.protectContent,
      allowSendingWithoutReply: this.allowSendingWithoutReply,
    });
  }
}
