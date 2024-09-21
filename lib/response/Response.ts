import { CallbackQuery, Message } from 'typescript-telegram-bot-api/dist/types';

import { BaseCommand, TelegramBot } from '../TelegramBot';
import { MaybePromise, RequiredKeys } from '../types';

export type RespondToCallbackQueryContext<
  in out CommandType extends BaseCommand,
  in out CallbackData,
  in out UserData,
> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  query: CallbackQuery;
};

export type RespondToMessageContext<in out CommandType extends BaseCommand, in out CallbackData, in out UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  message: Message;
};

export type ResponseToMessage<CommandType extends BaseCommand, CallbackData, UserData> = RequiredKeys<
  Response<CommandType, CallbackData, UserData>,
  'respondToMessage'
>;

export type ResponseToCallbackQuery<CommandType extends BaseCommand, CallbackData, UserData> = RequiredKeys<
  Response<CommandType, CallbackData, UserData>,
  'respondToCallbackQuery'
>;

export class Response<in out CommandType extends BaseCommand, in out CallbackData, in out UserData> {
  respondToMessage?: (ctx: RespondToMessageContext<CommandType, CallbackData, UserData>) => MaybePromise<void>;
  respondToCallbackQuery?: (
    ctx: RespondToCallbackQueryContext<CommandType, CallbackData, UserData>,
  ) => MaybePromise<void>;
}
