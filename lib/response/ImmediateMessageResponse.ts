import { InputFile, LinkPreviewOptions, Message, ParseMode } from 'typescript-telegram-bot-api/dist/types';

import { Markdown } from '../Markdown';
import { BaseCommand } from '../TelegramBot';
import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { EditMessageContext, MessageResponse, MessageResponseOptions, SendMessageContext } from './MessageResponse';

export type MessageResponseTextContent = {
  type: 'text';
  text: string | Markdown;
  parseMode?: ParseMode;
  linkPreviewOptions?: LinkPreviewOptions;
};

export type MessageResponsePhotoContent = {
  type: 'photo';
  photo: InputFile | string;
  showCaptionAboveMedia?: boolean;
  hasSpoiler?: boolean;
};

export type MessageResponseStickerContent = {
  type: 'sticker';
  sticker: InputFile | string;
};

export type MessageResponseContent =
  | MessageResponseTextContent
  | MessageResponsePhotoContent
  | MessageResponseStickerContent;

export type ImmediateMessageResponseOptions<CallbackData> = MessageResponseOptions<CallbackData> & {
  content: MessageResponseContent;
};

export class ImmediateMessageResponse<CommandType extends BaseCommand, CallbackData, UserData> extends MessageResponse<
  CommandType,
  CallbackData,
  UserData
> {
  readonly content: MessageResponseContent;

  constructor(options: ImmediateMessageResponseOptions<CallbackData>) {
    super(options);

    this.content = options.content;
  }

  async edit(ctx: EditMessageContext<CommandType, CallbackData, UserData>): Promise<Message> {
    const editBasicOptions = {
      chat_id: ctx.message.chat.id,
      message_id: ctx.message.message_id,
      reply_markup: await this.getReplyMarkup(ctx.bot),
    };
    const { content } = this;

    if (content.type === 'text') {
      let editedMessage: Message | null = null;

      try {
        const editResult = await ctx.bot.api.editMessageText({
          ...editBasicOptions,
          text: content.text.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          link_preview_options: content.linkPreviewOptions,
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

  async send(ctx: SendMessageContext<CommandType, CallbackData, UserData>): Promise<Message> {
    const sendBasicOptions = {
      chat_id: ctx.chatId,
      business_connection_id: ctx.businessConnectionId,
      message_thread_id: ctx.messageThreadId,
      disable_notification: ctx.disableNotification ?? this.disableNotification,
      reply_parameters: ctx.replyParameters,
      reply_markup: await this.getReplyMarkup(ctx.bot),
      protect_content: ctx.protectContent ?? this.protectContent,
      allow_sending_without_reply: ctx.allowSendingWithoutReply ?? this.allowSendingWithoutReply,
      message_effect_id: ctx.messageEffectId ?? this.messageEffectId,
    };
    const { content } = this;

    if (content.type === 'text') {
      return ctx.bot.api.sendMessage({
        ...sendBasicOptions,
        text: content.text.toString(),
        parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
        link_preview_options: content.linkPreviewOptions,
      });
    }

    if (content.type === 'photo') {
      return ctx.bot.api.sendPhoto({
        ...sendBasicOptions,
        photo: content.photo,
        show_caption_above_media: content.showCaptionAboveMedia,
        has_spoiler: content.hasSpoiler,
        // FIXME: remove when typings are fixed
      }) as Promise<Message>;
    }

    if (content.type === 'sticker') {
      return ctx.bot.api.sendSticker({
        ...sendBasicOptions,
        // FIXME: remove when typings are fixed
        message_thread_id: sendBasicOptions.message_thread_id as any,
        sticker: content.sticker,
      });
    }

    throw new TelegramBotError(TelegramBotErrorCode.UnsupportedContent);
  }
}
