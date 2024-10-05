import { BaseCommand } from '../TelegramBot';
import { Action, ActionOnCallbackQueryContext, ActionOnMessageContext } from './Action';

export type ActionsBatchActionGetActions<CommandType extends BaseCommand, CallbackData, UserData> = () => Iterable<
  Action<CommandType, CallbackData, UserData>
>;

/* eslint-disable brace-style */
export class ActionsBatchAction<CommandType extends BaseCommand = never, CallbackData = never, UserData = never>
  implements Action<CommandType, CallbackData, UserData>
{
  /* eslint-enable brace-style */
  private readonly _getActions: ActionsBatchActionGetActions<CommandType, CallbackData, UserData>;

  constructor(getActions: ActionsBatchActionGetActions<CommandType, CallbackData, UserData>) {
    this._getActions = getActions;
  }

  async onCallbackQuery(ctx: ActionOnCallbackQueryContext<CommandType, CallbackData, UserData>): Promise<void> {
    await Promise.all(
      function* (this: ActionsBatchAction<CommandType, CallbackData, UserData>) {
        for (const action of this._getActions()) {
          yield action.onCallbackQuery?.(ctx);
        }
      }.call(this),
    );
  }

  async onMessage(ctx: ActionOnMessageContext<CommandType, CallbackData, UserData>): Promise<void> {
    await Promise.all(
      function* (this: ActionsBatchAction<CommandType, CallbackData, UserData>) {
        for (const action of this._getActions()) {
          yield action.onMessage?.(ctx);
        }
      }.call(this),
    );
  }
}
