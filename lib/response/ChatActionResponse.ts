import { performance } from 'node:perf_hooks';

import { TelegramBot as LibTelegramBot } from 'typescript-telegram-bot-api';

import { BaseCommand } from '../TelegramBot';
import { MaybePromise } from '../types';
import { delay } from '../utils/promise';
import { RespondToMessageContext, Response, ResponseToMessage } from './Response';

export type ChatActionType = Parameters<LibTelegramBot['sendChatAction']>[0]['action'];

export type ChatActionMode = 'oneTime' | 'waitForResponse';

export type ChatActionResponseOptions<CommandType extends BaseCommand, CallbackData, UserData> = {
  type: ChatActionType;
  mode?: ChatActionMode;
  businessConnectionId?: string;
  getResponse: () => MaybePromise<ResponseToMessage<CommandType, CallbackData, UserData> | null | undefined | void>;
};

export class ChatActionResponse<
  CommandType extends BaseCommand = never,
  CallbackData = never,
  UserData = never,
> extends Response<CommandType, CallbackData, UserData> {
  private readonly _getResponse: ChatActionResponseOptions<CommandType, CallbackData, UserData>['getResponse'];

  readonly type: ChatActionType;
  readonly mode: ChatActionMode;
  readonly businessConnectionId?: string;

  constructor(options: ChatActionResponseOptions<CommandType, CallbackData, UserData>) {
    super();

    this.type = options.type;
    this.mode = options.mode ?? 'waitForResponse';
    this.businessConnectionId = options.businessConnectionId;
    this._getResponse = options.getResponse;
  }

  respondToMessage = async (ctx: RespondToMessageContext<CommandType, CallbackData, UserData>): Promise<void> => {
    let promiseWithResolvers: PromiseWithResolvers<void> | undefined;
    let responseSent = false;

    await Promise.all([
      (async () => {
        try {
          const response = await this._getResponse();

          await response?.respondToMessage(ctx);
        } finally {
          responseSent = true;

          promiseWithResolvers?.resolve();
        }
      })(),
      (async () => {
        while (!responseSent) {
          const timestamp = performance.now();

          await ctx.bot.api.sendChatAction({
            chat_id: ctx.message.chat.id,
            message_thread_id: ctx.message.message_thread_id,
            business_connection_id: this.businessConnectionId,
            action: this.type,
          });

          if (responseSent || this.mode === 'oneTime') {
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
  };
}
