import { InlineKeyboardMarkup, Message } from 'typescript-telegram-bot-api/dist/types';
import { ReplyParameters } from 'typescript-telegram-bot-api/dist/types/ReplyParameters';

import { BaseCommand, TelegramBot } from '../TelegramBot';
import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { InlineKeyboard } from '../inlineKeyboard';
import { prepareInlineKeyboard } from '../utils/inlineKeyboard';
import { RespondToCallbackQueryContext, RespondToMessageContext, Response } from './Response';

export type EditMessageContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  message: Message;
};

export type SendMessageContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  chatId: number;
  businessConnectionId?: string;
  messageThreadId?: number;
  replyParameters?: ReplyParameters;
  disableNotification?: boolean;
  protectContent?: boolean;
  allowSendingWithoutReply?: boolean;
  messageEffectId?: string;
};

export type ReplyMarkup<CallbackData> = InlineKeyboard<CallbackData>;

export type MessageResponseOptions<CallbackData> = {
  disableNotification?: boolean;
  replyMarkup?: ReplyMarkup<CallbackData>;
  protectContent?: boolean;
  allowSendingWithoutReply?: boolean;
  messageEffectId?: string;
};

export abstract class MessageResponse<CommandType extends BaseCommand, CallbackData, UserData> extends Response<
  CommandType,
  CallbackData,
  UserData
> {
  readonly disableNotification?: boolean;
  readonly replyMarkup?: ReplyMarkup<CallbackData>;
  readonly protectContent?: boolean;
  readonly allowSendingWithoutReply?: boolean;
  readonly messageEffectId?: string;

  protected constructor(options?: MessageResponseOptions<CallbackData>) {
    super();

    this.disableNotification = options?.disableNotification;
    this.replyMarkup = options?.replyMarkup;
    this.protectContent = options?.protectContent;
    this.allowSendingWithoutReply = options?.allowSendingWithoutReply;
    this.messageEffectId = options?.messageEffectId;
  }

  abstract edit(ctx: EditMessageContext<CommandType, CallbackData, UserData>): Promise<Message>;
  abstract send(ctx: SendMessageContext<CommandType, CallbackData, UserData>): Promise<Message>;

  getReplyMarkup = async (
    bot: TelegramBot<CommandType, CallbackData, UserData>,
  ): Promise<InlineKeyboardMarkup | undefined> => {
    return this.replyMarkup && (await prepareInlineKeyboard(bot.callbackDataProvider, this.replyMarkup));
  };

  respondToCallbackQuery = async (
    ctx: RespondToCallbackQueryContext<CommandType, CallbackData, UserData>,
  ): Promise<void> => {
    const { id: queryId, message } = ctx.query;

    if (!message) {
      return;
    }

    try {
      await this.edit({
        message,
        bot: ctx.bot,
      });
    } catch (err) {
      if (err instanceof TelegramBotError && err.code === TelegramBotErrorCode.EditSameContent) {
        await ctx.bot.api.answerCallbackQuery({
          callback_query_id: queryId,
        });
      } else {
        throw err;
      }
    }
  };

  respondToMessage = async (ctx: RespondToMessageContext<CommandType, CallbackData, UserData>): Promise<void> => {
    await this.send({
      bot: ctx.bot,
      chatId: ctx.message.chat.id,
      messageThreadId: ctx.message.message_thread_id,
      replyParameters: {
        message_id: ctx.message.message_id,
      },
    });
  };
}
