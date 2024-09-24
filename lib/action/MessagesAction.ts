import { BaseCommand } from '../TelegramBot';
import { isTruthy } from '../utils/is';
import { Action, ActionOnCallbackQueryContext, ActionOnMessageContext } from './Action';
import { MessageAction } from './MessageAction';

/* eslint-disable brace-style */
export class MessagesAction<CommandType extends BaseCommand = never, CallbackData = never, UserData = never>
  implements Action<CommandType, CallbackData, UserData>
{
  /* eslint-enable brace-style */
  private readonly _actions: MessageAction<CommandType, CallbackData, UserData>[];

  constructor(actions: (MessageAction<CommandType, CallbackData, UserData> | null | undefined | false | '')[]) {
    this._actions = actions.filter(isTruthy);
  }

  async onCallbackQuery(ctx: ActionOnCallbackQueryContext<CommandType, CallbackData, UserData>): Promise<void> {
    const { message } = ctx.query;

    if (!message) {
      return;
    }

    for (const [index, action] of this._actions.entries()) {
      if (index === 0) {
        await action.onCallbackQuery(ctx);
      } else {
        await action.send({
          bot: ctx.bot,
          chatId: message.chat.id,
          messageThreadId: 'message_thread_id' in message ? message.message_thread_id : undefined,
        });
      }
    }
  }

  async onMessage(ctx: ActionOnMessageContext<CommandType, CallbackData, UserData>): Promise<void> {
    for (const [index, action] of this._actions.entries()) {
      if (index === 0) {
        await action.onMessage(ctx);
      } else {
        await action.send({
          bot: ctx.bot,
          chatId: ctx.message.chat.id,
          messageThreadId: ctx.message.message_thread_id,
        });
      }
    }
  }
}
