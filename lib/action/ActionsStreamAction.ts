import { BaseCommand } from '../TelegramBot';
import { Action, ActionOnCallbackQueryContext, ActionOnMessageContext } from './Action';

export type ActionsStreamActionGetActions<
  CommandType extends BaseCommand,
  CallbackData,
  UserData,
> = () => AsyncGenerator<Action<CommandType, CallbackData, UserData>>;

/* eslint-disable brace-style */
export class ActionsStreamAction<CommandType extends BaseCommand = never, CallbackData = never, UserData = never>
  implements Action<CommandType, CallbackData, UserData>
{
  /* eslint-enable brace-style */
  private readonly _getActions: ActionsStreamActionGetActions<CommandType, CallbackData, UserData>;

  constructor(getActions: ActionsStreamActionGetActions<CommandType, CallbackData, UserData>) {
    this._getActions = getActions;
  }

  async onCallbackQuery(ctx: ActionOnCallbackQueryContext<CommandType, CallbackData, UserData>): Promise<void> {
    for await (const action of this._getActions()) {
      await action.onCallbackQuery?.(ctx);
    }
  }

  async onMessage(ctx: ActionOnMessageContext<CommandType, CallbackData, UserData>): Promise<void> {
    for await (const action of this._getActions()) {
      await action.onMessage?.(ctx);
    }
  }
}
