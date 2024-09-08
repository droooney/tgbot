const CHARACTERS_TO_ESCAPE = /[_*[\]()~`>#+\-=|{}.!\\]/g;

export type MarkdownAllowedEntity = string | number | bigint | false | null | undefined | Markdown;

export class Markdown {
  private static _compile(strings: TemplateStringsArray, ...entities: MarkdownAllowedEntity[]): string {
    return entities.reduce<string>(
      (text, entity, index) => {
        const entityString = Markdown.stringifyForMarkdown(entity);

        return `${text}${entityString}${Markdown.stringifyForMarkdown(strings.at(index + 1) ?? '')}`;
      },
      Markdown.stringifyForMarkdown(strings.at(0) ?? ''),
    );
  }

  static blockquote(value: string, expandable: boolean = false): Markdown {
    return new Markdown(
      `**${Markdown.stringifyForMarkdown(value)
        .split('\n')
        .map((value) => `> ${value}`)
        .join('\n')
        .trim()}${expandable ? '||' : ''}`,
    );
  }

  static bold(value: MarkdownAllowedEntity): Markdown {
    return new Markdown(`*${Markdown.stringifyForMarkdown(value)}*`);
  }

  static code(language: string | null | undefined, value: string): Markdown {
    return new Markdown(`\`\`\`${language ?? ''}
${Markdown.stringifyForMarkdown(value).trim()}
\`\`\``);
  }

  static create(strings: TemplateStringsArray, ...entities: MarkdownAllowedEntity[]): Markdown {
    return new Markdown(Markdown._compile(strings, ...entities));
  }

  static customEmoji(emojiId: string, emoji: string): Markdown {
    return new Markdown(`![${emoji}](tg://emoji?id=${emojiId})`);
  }

  static escape(value: string): string {
    return value.replace(CHARACTERS_TO_ESCAPE, '\\$&');
  }

  static fixedWidth(value: string): Markdown {
    return new Markdown(`\`${Markdown.stringifyForMarkdown(value)}\``);
  }

  static italic(value: MarkdownAllowedEntity): Markdown {
    return new Markdown(`**_**${Markdown.stringifyForMarkdown(value)}**_**`);
  }

  static join(markdowns: MarkdownAllowedEntity[], joiner: MarkdownAllowedEntity): Markdown {
    const markdown = new Markdown();

    markdowns.forEach((entity, index) => {
      const prevValue = markdown._value;

      markdown.add`${entity}`;

      if (index < markdowns.length - 1 && markdown._value !== prevValue) {
        markdown.add`${joiner}`;
      }
    });

    return markdown;
  }

  static spoiler(value: MarkdownAllowedEntity): Markdown {
    return new Markdown(`||${Markdown.stringifyForMarkdown(value)}||`);
  }

  static strikethrough(value: MarkdownAllowedEntity): Markdown {
    return new Markdown(`~${Markdown.stringifyForMarkdown(value)}~`);
  }

  static stringifyForMarkdown(value: MarkdownAllowedEntity): string {
    if (value == null || value === false) {
      return '';
    }

    return value instanceof Markdown ? value.toString() : Markdown.escape(String(value));
  }

  static telegramUser(userId: number, name: string): Markdown {
    return new Markdown(`[${name}](tg://user?id=${userId})`);
  }

  static underline(value: MarkdownAllowedEntity): Markdown {
    return new Markdown(`__${Markdown.stringifyForMarkdown(value)}__`);
  }

  static url(url: string, description: string): Markdown {
    return new Markdown(`[${Markdown.stringifyForMarkdown(description)}](${url})`);
  }

  private _value: string;

  get value(): string {
    return this._value;
  }

  constructor(value: string = '') {
    this._value = value;
  }

  add(strings: TemplateStringsArray, ...entities: MarkdownAllowedEntity[]): void {
    this._value += Markdown._compile(strings, ...entities);
  }

  isEmpty(): boolean {
    return this._value.trim() === '';
  }

  toString(): string {
    return this._value;
  }
}
