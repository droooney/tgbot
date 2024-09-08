import isEqual from 'lodash/isEqual';

import { InlineKeyboardMarkup, Message, ParseMode } from 'node-telegram-bot-api';

import { BaseCommand, TelegramBot } from '../TelegramBot';

import { Markdown } from '../Markdown';
import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { InlineKeyboard } from '../inlineKeyboard';
import { prepareInlineKeyboard } from '../utils/keyboard';
import { EditMessageContext, SendMessageContext, TextResponse } from './TextResponse';

export interface ImmediateTextResponseOptions<CallbackData> {
  text: string | Markdown;
  parseMode?: ParseMode;
  keyboard?: InlineKeyboard<CallbackData>;
  disableWebPagePreview?: boolean;
}

class ImmediateTextResponse<CallbackData> extends TextResponse {
  readonly text: string | Markdown;
  readonly parseMode?: ParseMode;
  readonly keyboard?: InlineKeyboard<CallbackData>;
  readonly disableWebPagePreview?: boolean;

  constructor(options: ImmediateTextResponseOptions<CallbackData>) {
    super();

    this.text = options.text;
    this.keyboard = options.keyboard;
    this.disableWebPagePreview = options.disableWebPagePreview;
  }

  private _getParseMode(): ParseMode | undefined {
    return this.text instanceof Markdown ? 'MarkdownV2' : this.parseMode;
  }

  private _getReplyMarkup<CommandType extends BaseCommand, BotCallbackData, UserData>(
    bot: CallbackData extends BotCallbackData ? TelegramBot<CommandType, BotCallbackData, UserData> : never,
  ): InlineKeyboardMarkup | undefined {
    return this.keyboard && prepareInlineKeyboard(bot, this.keyboard as InlineKeyboard<BotCallbackData>);
  }

  async editMessage<CommandType extends BaseCommand, BotCallbackData, UserData>(
    ctx: CallbackData extends BotCallbackData ? EditMessageContext<CommandType, BotCallbackData, UserData> : never,
  ): Promise<Message> {
    const newText = this.text.toString();
    const newReplyMarkup = this._getReplyMarkup(ctx.bot as never);
    let editedMessage: Message | null = null;

    if (newText !== ctx.message.text || !isEqual(ctx.message.reply_markup, newReplyMarkup)) {
      try {
        const editResult = await ctx.bot.api.editMessageText(this.text.toString(), {
          chat_id: ctx.message.chat.id,
          message_id: ctx.message.message_id,
          parse_mode: this._getParseMode(),
          reply_markup: newReplyMarkup,
          disable_web_page_preview: this.disableWebPagePreview,
        });

        if (typeof editResult === 'object') {
          editedMessage = editResult;
        }
      } catch (err) {
        if (!(err instanceof Error) || !/message is not modified/.test(err.message)) {
          throw err;
        }
      }
    }

    if (!editedMessage) {
      throw new TelegramBotError(TelegramBotErrorCode.EditSameContent);
    }

    return editedMessage;
  }

  async sendMessage<CommandType extends BaseCommand, BotCallbackData, UserData>(
    ctx: CallbackData extends BotCallbackData ? SendMessageContext<CommandType, BotCallbackData, UserData> : never,
  ): Promise<Message> {
    return ctx.bot.api.sendMessage(ctx.chatId, this.text.toString(), {
      reply_to_message_id: ctx.replyToMessageId,
      parse_mode: this._getParseMode(),
      reply_markup: this._getReplyMarkup(ctx.bot as never),
      disable_web_page_preview: this.disableWebPagePreview,
    });
  }
}

export default ImmediateTextResponse;
