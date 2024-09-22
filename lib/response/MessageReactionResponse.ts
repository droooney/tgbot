import { ReactionType } from 'typescript-telegram-bot-api/dist/types';

import { BaseCommand } from '../TelegramBot';
import { isArray } from '../utils/is';
import { RespondToMessageContext, Response } from './Response';

export type MessageReactionResponseOptions = {
  reaction?: ReactionType | ReactionType[];
  isBig?: boolean;
};

export class MessageReactionResponse<
  CommandType extends BaseCommand = never,
  CallbackData = never,
  UserData = never,
> extends Response<CommandType, CallbackData, UserData> {
  readonly reaction?: ReactionType[];
  readonly isBig?: boolean;

  constructor(options?: MessageReactionResponseOptions) {
    super();

    this.reaction = options?.reaction ? (isArray(options.reaction) ? options.reaction : [options.reaction]) : undefined;
    this.isBig = options?.isBig;
  }

  respondToMessage = async (ctx: RespondToMessageContext<CommandType, CallbackData, UserData>): Promise<void> => {
    await ctx.bot.api.setMessageReaction({
      chat_id: ctx.message.chat.id,
      message_id: ctx.message.message_id,
      reaction: this.reaction,
      is_big: this.isBig,
    });
  };
}
