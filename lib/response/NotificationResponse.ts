import { BaseCommand } from '../TelegramBot';
import { TelegramBotError, TelegramBotErrorCode } from '../TelegramBotError';
import { RespondToCallbackQueryContext, Response } from './Response';

export interface NotificationResponseOptions {
  text: string;
  showAlert?: boolean;
  url?: string;
  cacheTime?: number;
}

export class NotificationResponse<
  CommandType extends BaseCommand = never,
  CallbackData = never,
  UserData = never,
> extends Response<CommandType, CallbackData, UserData> {
  private readonly text: string;
  private readonly showAlert?: boolean;
  private readonly url?: string;
  private readonly cacheTime?: number;

  constructor(options: NotificationResponseOptions) {
    super();

    this.text = options.text;
    this.showAlert = options.showAlert;
    this.url = options.url;
    this.cacheTime = options.cacheTime;
  }

  respondToCallbackQuery = async (
    ctx: RespondToCallbackQueryContext<CommandType, CallbackData, UserData>,
  ): Promise<void> => {
    if (this.text.length > 200) {
      throw new TelegramBotError(TelegramBotErrorCode.LongNotificationText, {
        message: `Notification text is too long: ${JSON.stringify(this.text)}`,
      });
    }

    await ctx.bot.api.answerCallbackQuery({
      callback_query_id: ctx.query.id,
      text: this.text,
      show_alert: this.showAlert,
      url: this.url,
      cache_time: this.cacheTime,
    });
  };
}
