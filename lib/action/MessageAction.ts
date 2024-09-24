import {
  ForceReply,
  InlineKeyboardMarkup,
  InputFile,
  InputMediaAudio,
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
  InputPaidMedia,
  LinkPreviewOptions,
  Message,
  ParseMode,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'typescript-telegram-bot-api/dist/types';
import { ReplyParameters } from 'typescript-telegram-bot-api/dist/types/ReplyParameters';

import { Markdown } from '../Markdown';
import { ReplyKeyboard } from '../ReplyKeyboard';
import { BaseCommand, TelegramBot } from '../TelegramBot';
import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { InlineKeyboard } from '../inlineKeyboard';
import { prepareInlineKeyboard } from '../utils/inlineKeyboard';
import { isArray } from '../utils/is';
import { Action, ActionOnCallbackQueryContext, ActionOnMessageContext } from './Action';

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

export type ReplyMarkup<CallbackData> =
  | InlineKeyboard<CallbackData>
  | ReplyKeyboard
  | InlineKeyboardMarkup
  | ReplyKeyboardMarkup
  | ReplyKeyboardRemove
  | ForceReply;

export type MessageActionTextContent = {
  type: 'text';
  text: string | Markdown;
  parseMode?: ParseMode;
  linkPreviewOptions?: LinkPreviewOptions;
};

export type MessageActionPhotoContent = {
  type: 'photo';
  photo: InputFile | string;
  text?: string | Markdown;
  parseMode?: ParseMode;
  showCaptionAboveMedia?: boolean;
  hasSpoiler?: boolean;
};

export type MessageActionAudioContent = {
  type: 'audio';
  audio: InputFile | string;
  duration?: number;
  performer?: string;
  title?: string;
  thumbnail?: InputFile | string;
  text?: string | Markdown;
  parseMode?: ParseMode;
};

export type MessageActionDocumentContent = {
  type: 'document';
  document: InputFile | string;
  thumbnail?: InputFile | string;
  text?: string | Markdown;
  parseMode?: ParseMode;
  disableContentTypeDetection?: boolean;
};

export type MessageActionVideoContent = {
  type: 'video';
  video: InputFile | string;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: InputFile | string;
  text?: string | Markdown;
  parseMode?: ParseMode;
  showCaptionAboveMedia?: boolean;
  hasSpoiler?: boolean;
  supportsStreaming?: boolean;
};

export type MessageActionAnimationContent = {
  type: 'animation';
  animation: InputFile | string;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: InputFile | string;
  text?: string | Markdown;
  parseMode?: ParseMode;
  showCaptionAboveMedia?: boolean;
  hasSpoiler?: boolean;
};

export type MessageActionVoiceContent = {
  type: 'voice';
  voice: InputFile | string;
  duration?: number;
  text?: string | Markdown;
  parseMode?: ParseMode;
};

export type MessageActionVideoNoteContent = {
  type: 'videoNote';
  videoNote: InputFile | string;
  duration?: number;
  length?: number;
  thumbnail?: InputFile | string;
};

export type MessageActionPaidMediaContent = {
  type: 'paidMedia';
  starCount: number;
  media: InputPaidMedia[];
  payload?: string;
  showCaptionAboveMedia?: boolean;
};

export type MessageActionMediaGroupContent = {
  type: 'mediaGroup';
  media: (InputMediaAudio | InputMediaDocument | InputMediaPhoto | InputMediaVideo)[];
};

// TODO: add location content
// TODO: add venue content

export type MessageActionContactContent = {
  type: 'contact';
  phoneNumber: string;
  firstName: string;
  lastName?: string;
  vcard?: string;
};

export type MessageActionDiceContent = {
  type: 'dice';
  // FIXME: don't hardcode after typings are fixed
  emoji?: '🎲' | '🎯' | '🏀' | '⚽' | '🎳' | '🎰';
};

// TODO: add poll content

export type MessageActionStickerContent = {
  type: 'sticker';
  sticker: InputFile | string;
};

export type MessageActionContent =
  | MessageActionTextContent
  | MessageActionPhotoContent
  | MessageActionAudioContent
  | MessageActionDocumentContent
  | MessageActionVideoContent
  | MessageActionAnimationContent
  | MessageActionVoiceContent
  | MessageActionVideoNoteContent
  | MessageActionPaidMediaContent
  | MessageActionMediaGroupContent
  | MessageActionContactContent
  | MessageActionDiceContent
  | MessageActionStickerContent;

export type MessageActionOptions<CallbackData> = {
  content: MessageActionContent;
  businessConnectionId?: string;
  disableNotification?: boolean;
  replyMarkup?: ReplyMarkup<CallbackData>;
  protectContent?: boolean;
  allowSendingWithoutReply?: boolean;
  messageEffectId?: string;
};

/* eslint-disable brace-style */
export class MessageAction<CommandType extends BaseCommand = never, CallbackData = never, UserData = never>
  implements Action<CommandType, CallbackData, UserData>
{
  /* eslint-enable brace-style */
  readonly content: MessageActionContent;
  readonly businessConnectionId?: string;
  readonly disableNotification?: boolean;
  readonly replyMarkup?: ReplyMarkup<CallbackData>;
  readonly protectContent?: boolean;
  readonly allowSendingWithoutReply?: boolean;
  readonly messageEffectId?: string;

  constructor(options: MessageActionOptions<CallbackData>) {
    this.content = options.content;
    this.businessConnectionId = options?.businessConnectionId;
    this.disableNotification = options?.disableNotification;
    this.replyMarkup = options?.replyMarkup;
    this.protectContent = options?.protectContent;
    this.allowSendingWithoutReply = options?.allowSendingWithoutReply;
    this.messageEffectId = options?.messageEffectId;
  }

  async edit(ctx: EditMessageContext<CommandType, CallbackData, UserData>): Promise<Message> {
    const editBasicOptions = {
      chat_id: ctx.message.chat.id,
      message_id: ctx.message.message_id,
      business_connection_id: this.businessConnectionId,
      reply_markup: await this.getInlineKeyboardReplyMarkup(ctx.bot),
    };
    const { content } = this;

    let editedMessage: Message | true | undefined;

    try {
      if (content.type === 'text') {
        editedMessage = await ctx.bot.api.editMessageText({
          ...editBasicOptions,
          text: content.text.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          link_preview_options: content.linkPreviewOptions,
        });
      } else if (content.type === 'photo') {
        editedMessage = await ctx.bot.api.editMessageMedia({
          ...editBasicOptions,
          media: {
            type: 'photo',
            media: content.photo,
            caption: content.text?.toString(),
            parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
            show_caption_above_media: content.showCaptionAboveMedia,
            has_spoiler: content.hasSpoiler,
          },
        });
      } else if (content.type === 'audio') {
        editedMessage = await ctx.bot.api.editMessageMedia({
          ...editBasicOptions,
          media: {
            type: 'audio',
            media: content.audio,
            duration: content.duration,
            performer: content.performer,
            title: content.title,
            thumbnail: content.thumbnail,
            caption: content.text?.toString(),
            parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          },
        });
      } else if (content.type === 'document') {
        editedMessage = await ctx.bot.api.editMessageMedia({
          ...editBasicOptions,
          media: {
            type: 'document',
            media: content.document,
            thumbnail: content.thumbnail,
            caption: content.text?.toString(),
            parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
            disable_content_type_detection: content.disableContentTypeDetection,
          },
        });
      } else if (content.type === 'video') {
        editedMessage = await ctx.bot.api.editMessageMedia({
          ...editBasicOptions,
          media: {
            type: 'video',
            media: content.video,
            duration: content.duration,
            width: content.width,
            height: content.height,
            thumbnail: content.thumbnail,
            caption: content.text?.toString(),
            parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
            show_caption_above_media: content.showCaptionAboveMedia,
            has_spoiler: content.hasSpoiler,
            supports_streaming: content.supportsStreaming,
          },
        });
      } else if (content.type === 'animation') {
        editedMessage = await ctx.bot.api.editMessageMedia({
          ...editBasicOptions,
          media: {
            type: 'animation',
            media: content.animation,
            duration: content.duration,
            width: content.width,
            height: content.height,
            thumbnail: content.thumbnail,
            caption: content.text?.toString(),
            parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
            show_caption_above_media: content.showCaptionAboveMedia,
            has_spoiler: content.hasSpoiler,
          },
        });
      }
    } catch (err) {
      if (!(err instanceof Error) || !/message is not modified/.test(err.message)) {
        throw err;
      }
    }

    if (typeof editedMessage !== 'object') {
      throw new TelegramBotError(TelegramBotErrorCode.EditSameContent);
    }

    return editedMessage;
  }

  async getInlineKeyboardReplyMarkup(
    bot: TelegramBot<CommandType, CallbackData, UserData>,
  ): Promise<InlineKeyboardMarkup | undefined> {
    if (isArray(this.replyMarkup)) {
      return await prepareInlineKeyboard(bot.callbackDataProvider, this.replyMarkup);
    }

    return this.replyMarkup && 'inline_keyboard' in this.replyMarkup ? this.replyMarkup : undefined;
  }

  async getReplyMarkup(
    bot: TelegramBot<CommandType, CallbackData, UserData>,
  ): Promise<InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply | undefined> {
    return (
      this.replyMarkup &&
      (isArray(this.replyMarkup)
        ? await prepareInlineKeyboard(bot.callbackDataProvider, this.replyMarkup)
        : this.replyMarkup instanceof ReplyKeyboard
          ? this.replyMarkup.getMarkup()
          : this.replyMarkup)
    );
  }

  async onCallbackQuery(ctx: ActionOnCallbackQueryContext<CommandType, CallbackData, UserData>): Promise<void> {
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
  }

  async onMessage(ctx: ActionOnMessageContext<CommandType, CallbackData, UserData>): Promise<void> {
    await this.send({
      bot: ctx.bot,
      chatId: ctx.message.chat.id,
      messageThreadId: ctx.message.message_thread_id,
      replyParameters: {
        message_id: ctx.message.message_id,
        chat_id: ctx.message.chat.id,
      },
    });
  }

  async send(ctx: SendMessageContext<CommandType, CallbackData, UserData>): Promise<Message[]> {
    const sendBasicOptions = {
      chat_id: ctx.chatId,
      business_connection_id: ctx.businessConnectionId ?? this.businessConnectionId,
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
      return [
        await ctx.bot.api.sendMessage({
          ...sendBasicOptions,
          text: content.text.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          link_preview_options: content.linkPreviewOptions,
        }),
      ];
    }

    if (content.type === 'photo') {
      return [
        (await ctx.bot.api.sendPhoto({
          ...sendBasicOptions,
          photo: content.photo,
          caption: content.text?.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          show_caption_above_media: content.showCaptionAboveMedia,
          has_spoiler: content.hasSpoiler,
          // FIXME: remove when typings are fixed
        })) as Message,
      ];
    }

    if (content.type === 'audio') {
      return [
        await ctx.bot.api.sendAudio({
          ...sendBasicOptions,
          audio: content.audio,
          duration: content.duration,
          performer: content.performer,
          title: content.title,
          thumbnail: content.thumbnail,
          caption: content.text?.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
        }),
      ];
    }

    if (content.type === 'document') {
      return [
        await ctx.bot.api.sendDocument({
          ...sendBasicOptions,
          document: content.document,
          thumbnail: content.thumbnail,
          caption: content.text?.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          disable_content_type_detection: content.disableContentTypeDetection,
        }),
      ];
    }

    if (content.type === 'video') {
      return [
        await ctx.bot.api.sendVideo({
          ...sendBasicOptions,
          video: content.video,
          duration: content.duration,
          width: content.width,
          height: content.height,
          thumbnail: content.thumbnail,
          caption: content.text?.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          show_caption_above_media: content.showCaptionAboveMedia,
          has_spoiler: content.hasSpoiler,
          supports_streaming: content.supportsStreaming,
        }),
      ];
    }

    if (content.type === 'animation') {
      return [
        await ctx.bot.api.sendAnimation({
          ...sendBasicOptions,
          animation: content.animation,
          duration: content.duration,
          width: content.width,
          height: content.height,
          thumbnail: content.thumbnail,
          caption: content.text?.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
          show_caption_above_media: content.showCaptionAboveMedia,
          has_spoiler: content.hasSpoiler,
        }),
      ];
    }

    if (content.type === 'voice') {
      return [
        await ctx.bot.api.sendVoice({
          ...sendBasicOptions,
          voice: content.voice,
          duration: content.duration,
          caption: content.text?.toString(),
          parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
        }),
      ];
    }

    if (content.type === 'videoNote') {
      return [
        await ctx.bot.api.sendVideoNote({
          ...sendBasicOptions,
          video_note: content.videoNote,
          duration: content.duration,
          length: content.length,
          thumbnail: content.thumbnail,
        }),
      ];
    }

    if (content.type === 'paidMedia') {
      return [
        await ctx.bot.api.sendPaidMedia({
          ...sendBasicOptions,
          star_count: content.starCount,
          media: content.media,
          payload: content.payload,
          show_caption_above_media: content.showCaptionAboveMedia,
        }),
      ];
    }

    if (content.type === 'mediaGroup') {
      return ctx.bot.api.sendMediaGroup({
        ...sendBasicOptions,
        media: content.media,
      });
    }

    if (content.type === 'contact') {
      return [
        await ctx.bot.api.sendContact({
          ...sendBasicOptions,
          phone_number: content.phoneNumber,
          first_name: content.firstName,
          last_name: content.lastName,
          vcard: content.vcard,
        }),
      ];
    }

    if (content.type === 'dice') {
      return [
        await ctx.bot.api.sendDice({
          ...sendBasicOptions,
          emoji: content.emoji,
        }),
      ];
    }

    if (content.type === 'sticker') {
      return [
        await ctx.bot.api.sendSticker({
          ...sendBasicOptions,
          // FIXME: remove when typings are fixed
          message_thread_id: sendBasicOptions.message_thread_id as any,
          sticker: content.sticker,
        }),
      ];
    }

    throw new TelegramBotError(TelegramBotErrorCode.UnsupportedContent);
  }
}
