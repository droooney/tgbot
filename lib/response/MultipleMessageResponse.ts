import { BaseCommand } from '../TelegramBot';
import { MessageResponse } from './MessageResponse';
import { RespondToCallbackQueryContext, RespondToMessageContext, Response } from './Response';

export class MultipleMessageResponse<CommandType extends BaseCommand, CallbackData, UserData> extends Response<
  CommandType,
  CallbackData,
  UserData
> {
  private readonly _responses: MessageResponse<CommandType, CallbackData, UserData>[];

  constructor(responses: MessageResponse<CommandType, CallbackData, UserData>[]) {
    super();

    this._responses = responses;
  }

  respondToCallbackQuery = async (
    ctx: RespondToCallbackQueryContext<CommandType, CallbackData, UserData>,
  ): Promise<void> => {
    const { message } = ctx.query;

    if (!message) {
      return;
    }

    for (const [index, response] of this._responses.entries()) {
      if (index === 0) {
        await response.respondToCallbackQuery(ctx);
      } else {
        await response.send({
          bot: ctx.bot,
          chatId: message.chat.id,
          messageThreadId: 'message_thread_id' in message ? message.message_thread_id : undefined,
        });
      }
    }
  };

  respondToMessage = async (ctx: RespondToMessageContext<CommandType, CallbackData, UserData>): Promise<void> => {
    for (const [index, response] of this._responses.entries()) {
      if (index === 0) {
        await response.respondToMessage(ctx);
      } else {
        await response.send({
          bot: ctx.bot,
          chatId: ctx.message.chat.id,
          messageThreadId: ctx.message.message_thread_id,
        });
      }
    }
  };
}
