import { Message } from 'node-telegram-bot-api';

import { BaseCommand, TelegramBot } from '../TelegramBot';

import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { RespondToCallbackQueryContext, RespondToMessageContext, Response } from './Response';

export type EditMessageContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  message: Message;
};

export type SendMessageContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  chatId: number;
  replyToMessageId?: number;
};

export abstract class TextResponse extends Response {
  abstract editMessage<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: EditMessageContext<CommandType, CallbackData, UserData>,
  ): Promise<Message>;
  abstract sendMessage<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: SendMessageContext<CommandType, CallbackData, UserData>,
  ): Promise<Message>;

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
      replyToMessageId: ctx.message.message_id,
    });
  }
}
