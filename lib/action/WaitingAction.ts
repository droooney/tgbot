import { performance } from 'node:perf_hooks';

import { TelegramBot as LibTelegramBot } from 'typescript-telegram-bot-api';

import { BaseCommand } from '../TelegramBot';
import { MaybePromise } from '../types';
import { delay } from '../utils/promise';
import { Action, ActionOnMessage, ActionOnMessageContext } from './Action';

export type WaitingActionType = Parameters<LibTelegramBot['sendChatAction']>[0]['action'];

export type WaitingActionMode = 'oneTime' | 'waitForAction';

export type WaitingActionOptions<CommandType extends BaseCommand, CallbackData, UserData> = {
  type: WaitingActionType;
  mode?: WaitingActionMode;
  businessConnectionId?: string;
  getAction: () => MaybePromise<ActionOnMessage<CommandType, CallbackData, UserData> | null | undefined | void>;
};

/* eslint-disable brace-style */
export class WaitingAction<CommandType extends BaseCommand = never, CallbackData = never, UserData = never>
  implements Action<CommandType, CallbackData, UserData>
{
  /* eslint-enable brace-style */
  private readonly _getAction: WaitingActionOptions<CommandType, CallbackData, UserData>['getAction'];

  readonly type: WaitingActionType;
  readonly mode: WaitingActionMode;
  readonly businessConnectionId?: string;

  constructor(options: WaitingActionOptions<CommandType, CallbackData, UserData>) {
    this.type = options.type;
    this.mode = options.mode ?? 'waitForAction';
    this.businessConnectionId = options.businessConnectionId;
    this._getAction = options.getAction;
  }

  async onMessage(ctx: ActionOnMessageContext<CommandType, CallbackData, UserData>): Promise<void> {
    let promiseWithResolvers: PromiseWithResolvers<void> | undefined;
    let actionSent = false;

    await Promise.all([
      (async () => {
        try {
          const action = await this._getAction();

          await action?.onMessage(ctx);
        } finally {
          actionSent = true;

          promiseWithResolvers?.resolve();
        }
      })(),
      (async () => {
        while (!actionSent) {
          const timestamp = performance.now();

          await ctx.bot.api.sendChatAction({
            chat_id: ctx.message.chat.id,
            message_thread_id: ctx.message.message_thread_id,
            business_connection_id: this.businessConnectionId,
            action: this.type,
          });

          if (actionSent || this.mode === 'oneTime') {
            break;
          }

          promiseWithResolvers = Promise.withResolvers();

          await Promise.race([
            promiseWithResolvers.promise,
            (async () => {
              const elapsed = performance.now() - timestamp;

              await delay(Math.max(0, 4000 - elapsed));
            })(),
          ]);
        }
      })(),
    ]);
  }
}
