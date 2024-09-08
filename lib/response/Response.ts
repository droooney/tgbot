import { CallbackQuery, Message } from 'node-telegram-bot-api';

import { RequiredKeys } from '../types';

import { BaseCommand, TelegramBot } from '../TelegramBot';

export type RespondToCallbackQueryContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  query: CallbackQuery;
};

export type RespondToMessageContext<CommandType extends BaseCommand, CallbackData, UserData> = {
  bot: TelegramBot<CommandType, CallbackData, UserData>;
  message: Message;
};

export type MessageResponse = RequiredKeys<Response, 'respondToMessage'>;

export type CallbackQueryResponse = RequiredKeys<Response, 'respondToCallbackQuery'>;

export class Response {
  respondToMessage?<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: RespondToMessageContext<CommandType, CallbackData, UserData>,
  ): Promise<void>;
  respondToCallbackQuery?<CommandType extends BaseCommand, CallbackData, UserData>(
    ctx: RespondToCallbackQueryContext<CommandType, CallbackData, UserData>,
  ): Promise<void>;
}
