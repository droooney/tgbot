import { EventEmitter } from 'node:events';

import TelegramBotApi, { BotCommand, CallbackQuery, Message, User } from 'node-telegram-bot-api';

import { MaybePromise } from './types';

import { TelegramBotError, TelegramBotErrorCode } from './TelegramBotError';
import { CallbackDataProvider } from './callbackData';
import { MessageResponse, ResponseToCallbackQuery, ResponseToMessage } from './response';
import { UserDataProvider } from './userData';
import { prepareErrorForLogging } from './utils/error';

export type MessageErrorResponseContext = {
  err: unknown;
  message: Message;
};

export type GetMessageErrorResponse = (
  ctx: MessageErrorResponseContext,
) => MaybePromise<ResponseToMessage | null | undefined | void>;

export type CallbackQueryErrorResponseContext = {
  err: unknown;
  message: Message;
  query: CallbackQuery;
};

export type GetCallbackQueryErrorResponse = (
  ctx: CallbackQueryErrorResponseContext,
) => MaybePromise<ResponseToCallbackQuery | null | undefined | void>;

export type BotCommands<CommandType extends BaseCommand> = Partial<Record<CommandType, string>>;

export type TelegramBotOptions<CommandType extends BaseCommand, CallbackData, UserData> = {
  token: string;
  commands?: BotCommands<CommandType>;
  callbackDataProvider?: CallbackDataProvider<CallbackData, UserData>;
  usernameWhitelist?: string[];
  getMessageErrorResponse?: GetMessageErrorResponse;
  getCallbackQueryErrorResponse?: GetCallbackQueryErrorResponse;
} & (UserData extends undefined
  ? {
      userDataProvider?: never;
    }
  : {
      userDataProvider: UserDataProvider<CommandType, UserData>;
    });

export type TextHandlerContext<CommandType extends BaseCommand, UserData> = {
  message: Message;
  userData: UserData;
  commands: CommandType[];
};

export type TextHandler<CommandType extends BaseCommand, UserData> = (
  ctx: TextHandlerContext<CommandType, UserData>,
) => MaybePromise<ResponseToMessage | null | undefined | void>;

export type CallbackQueryHandlerContext<CallbackData, UserData> = {
  data: CallbackData;
  message: Message;
  userData: UserData;
};

export type CallbackQueryHandler<CallbackData, UserData> = (
  ctx: CallbackQueryHandlerContext<CallbackData, UserData>,
) => MaybePromise<ResponseToCallbackQuery | null | undefined | void>;

export type BaseCommand = `/${string}`;

export type SendMessageOptions = {
  replyToMessageId?: number;
};

export type TelegramBotEvents = {
  responseError: [err: unknown];
};

export class TelegramBot<
  CommandType extends BaseCommand = never,
  CallbackData = never,
  UserData = undefined,
> extends EventEmitter<TelegramBotEvents> {
  private readonly _commandHandlers: Partial<Record<CommandType, TextHandler<CommandType, UserData>>> = {};
  private readonly _getMessageErrorResponse?: GetMessageErrorResponse;
  private readonly _getCallbackQueryErrorResponse?: GetCallbackQueryErrorResponse;

  readonly api: TelegramBotApi;
  readonly commands?: BotCommands<CommandType>;
  readonly callbackDataProvider?: CallbackDataProvider<CallbackData, UserData>;
  readonly userDataProvider?: UserDataProvider<CommandType, UserData>;
  readonly usernameWhitelist?: string[];

  constructor(options: TelegramBotOptions<CommandType, CallbackData, UserData>) {
    super();

    this.api = new TelegramBotApi(options.token, {
      polling: {
        autoStart: false,
      },
    });
    this.commands = options.commands;
    this.callbackDataProvider = options.callbackDataProvider;
    this.userDataProvider = options.userDataProvider;
    this.usernameWhitelist = options.usernameWhitelist;
    this._getMessageErrorResponse = options.getMessageErrorResponse;
    this._getCallbackQueryErrorResponse = options.getCallbackQueryErrorResponse;
  }

  private _emitResponseError(err: unknown): void {
    if (this.listenerCount('responseError') > 0) {
      this.emit('responseError', err);
    } else {
      console.log(prepareErrorForLogging(err));
    }
  }

  // TODO: research text limit
  async answerCallbackQuery(queryId: string, text: string): Promise<boolean> {
    return this.api.answerCallbackQuery(queryId, {
      text,
    });
  }

  async editMessage(message: Message, response: MessageResponse<CallbackData>): Promise<Message> {
    return response.editMessage({
      message,
      bot: this,
    });
  }

  handleCommand(command: CommandType, handler: TextHandler<CommandType, UserData>): this {
    this._commandHandlers[command] = handler;

    return this;
  }

  isUserAllowed(user: User): boolean {
    return Boolean(user.username && (!this.usernameWhitelist || this.usernameWhitelist.includes(user.username)));
  }

  async sendMessage(
    chatId: number,
    response: MessageResponse<CallbackData>,
    options?: SendMessageOptions,
  ): Promise<Message> {
    return response.sendMessage({
      chatId,
      bot: this,
      replyToMessageId: options?.replyToMessageId,
    });
  }

  async start(): Promise<void> {
    this.api.on('message', async (message) => {
      try {
        const { from: user, text } = message;

        if (!user || !this.isUserAllowed(user)) {
          return;
        }

        const userData = (await this.userDataProvider?.getOrCreateUserData(user.id)) as UserData;

        let handler: TextHandler<CommandType, UserData> | null | undefined;

        if (text && text in this._commandHandlers) {
          handler = this._commandHandlers[text as CommandType];
        }

        if (!handler) {
          handler = this.userDataProvider?.getUserDataHandler(userData);
        }

        if (!handler) {
          return;
        }

        const response = await handler({
          message,
          userData,
          // TODO: fill
          commands: [],
        });

        if (response) {
          await response.respondToMessage({
            message,
            bot: this,
          });
        }
      } catch (err) {
        this._emitResponseError(err);

        try {
          const response = await this._getMessageErrorResponse?.({
            err,
            message,
          });

          await response?.respondToMessage({
            message,
            bot: this,
          });
        } catch (err) {
          this._emitResponseError(err);
        }
      }
    });

    this.api.on('callback_query', async (query) => {
      try {
        const { from: user, message, data } = query;

        if (!user || !message || !this.isUserAllowed(user)) {
          return;
        }

        // TODO: handle no data for Game
        if (data === undefined) {
          throw new TelegramBotError(TelegramBotErrorCode.UnsupportedCallbackData);
        }

        if (!this.callbackDataProvider) {
          return;
        }

        const userData = (await this.userDataProvider?.getOrCreateUserData(user.id)) as UserData;
        const callbackData = this.callbackDataProvider.parseCallbackData(data);

        if (callbackData == null) {
          return;
        }

        const handler = this.callbackDataProvider.getCallbackQueryHandler(callbackData);

        if (!handler) {
          throw new TelegramBotError(TelegramBotErrorCode.UnsupportedCallbackData);
        }

        const response = await handler({
          data: callbackData,
          message,
          userData,
        });

        if (response) {
          await response.respondToCallbackQuery({
            bot: this,
            query,
          });
        }
      } catch (err) {
        this._emitResponseError(err);

        if (!query.message) {
          return;
        }

        try {
          const response = await this._getCallbackQueryErrorResponse?.({
            err,
            message: query.message,
            query,
          });

          if (response) {
            await response.respondToCallbackQuery({
              bot: this,
              query,
            });
          } else {
            await this.answerCallbackQuery(query.id, '');
          }
        } catch (err) {
          this._emitResponseError(err);
        }
      }
    });

    await Promise.all([
      this.api.startPolling(),
      (async () => {
        if (!this.commands) {
          return;
        }

        const commandsArray: BotCommand[] = [];

        for (const command in this.commands) {
          const description = this.commands[command];

          if (description) {
            commandsArray.push({
              command,
              description,
            });
          }
        }

        await this.api.setMyCommands(commandsArray);
      })(),
    ]);
  }
}
