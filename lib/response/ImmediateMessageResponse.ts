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
  text?: string | Markdown;
  parseMode?: ParseMode;
  showCaptionAboveMedia?: boolean;
  hasSpoiler?: boolean;
};

export type MessageResponseAudioContent = {
  type: 'audio';
  audio: InputFile | string;
  duration?: number;
  performer?: string;
  title?: string;
  thumbnail?: InputFile | string;
  text?: string | Markdown;
  parseMode?: ParseMode;
};

export type MessageResponseDocumentContent = {
  type: 'document';
  document: InputFile | string;
  thumbnail?: InputFile | string;
  text?: string | Markdown;
  parseMode?: ParseMode;
  disableContentTypeDetection?: boolean;
};

export type MessageResponseVideoContent = {
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

// TODO: animation content

export type MessageResponseVoiceContent = {
  type: 'voice';
  voice: InputFile | string;
  duration?: number;
  text?: string | Markdown;
  parseMode?: ParseMode;
};

export type MessageResponseVideoNoteContent = {
  type: 'videoNote';
  videoNote: InputFile | string;
  duration?: number;
  length?: number;
  thumbnail?: InputFile | string;
};

export type MessageResponseStickerContent = {
  type: 'sticker';
  sticker: InputFile | string;
};

export type MessageResponseContent =
  | MessageResponseTextContent
  | MessageResponsePhotoContent
  | MessageResponseAudioContent
  | MessageResponseDocumentContent
  | MessageResponseVideoContent
  | MessageResponseVoiceContent
  | MessageResponseVideoNoteContent
  | MessageResponseStickerContent;

export type ImmediateMessageResponseOptions<CallbackData> = MessageResponseOptions<CallbackData> & {
  content: MessageResponseContent;
};

export class ImmediateMessageResponse<
  CommandType extends BaseCommand = never,
  CallbackData = never,
  UserData = never,
> extends MessageResponse<CommandType, CallbackData, UserData> {
  readonly content: MessageResponseContent;

  constructor(options: ImmediateMessageResponseOptions<CallbackData>) {
    super(options);

    this.content = options.content;
  }

  async edit(ctx: EditMessageContext<CommandType, CallbackData, UserData>): Promise<Message> {
    const editBasicOptions = {
      chat_id: ctx.message.chat.id,
      message_id: ctx.message.message_id,
      business_connection_id: this.businessConnectionId,
      reply_markup: await this.getReplyMarkup(ctx.bot),
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

  async send(ctx: SendMessageContext<CommandType, CallbackData, UserData>): Promise<Message> {
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
        caption: content.text?.toString(),
        parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
        show_caption_above_media: content.showCaptionAboveMedia,
        has_spoiler: content.hasSpoiler,
        // FIXME: remove when typings are fixed
      }) as Promise<Message>;
    }

    if (content.type === 'audio') {
      return ctx.bot.api.sendAudio({
        ...sendBasicOptions,
        audio: content.audio,
        duration: content.duration,
        performer: content.performer,
        title: content.title,
        thumbnail: content.thumbnail,
        caption: content.text?.toString(),
        parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
      });
    }

    if (content.type === 'document') {
      return ctx.bot.api.sendDocument({
        ...sendBasicOptions,
        document: content.document,
        thumbnail: content.thumbnail,
        caption: content.text?.toString(),
        parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
        disable_content_type_detection: content.disableContentTypeDetection,
      });
    }

    if (content.type === 'video') {
      return ctx.bot.api.sendVideo({
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
      });
    }

    if (content.type === 'voice') {
      return ctx.bot.api.sendVoice({
        ...sendBasicOptions,
        voice: content.voice,
        duration: content.duration,
        caption: content.text?.toString(),
        parse_mode: content.text instanceof Markdown ? 'MarkdownV2' : content.parseMode,
      });
    }

    if (content.type === 'videoNote') {
      return ctx.bot.api.sendVideoNote({
        ...sendBasicOptions,
        video_note: content.videoNote,
        duration: content.duration,
        length: content.length,
        thumbnail: content.thumbnail,
      });
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
