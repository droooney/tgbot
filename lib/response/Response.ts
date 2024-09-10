import { CallbackQuery, Message } from 'typescript-telegram-bot-api/dist/types';

import { BaseCommand, TelegramBot } from '../TelegramBot';
import { RequiredKeys } from '../types';

export type RespondToCallbackQueryContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  query: CallbackQuery;
};

export type RespondToMessageContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  message: Message;
};

export type ResponseToMessage = RequiredKeys<Response, 'respondToMessage'>;

export type ResponseToCallbackQuery = RequiredKeys<Response, 'respondToCallbackQuery'>;

export class Response {
  respondToMessage?<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: RespondToMessageContext<CommandType, CallbackData, UserData>,
  ): Promise<void>;
  respondToCallbackQuery?<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: RespondToCallbackQueryContext<CommandType, CallbackData, UserData>,
  ): Promise<void>;
}
