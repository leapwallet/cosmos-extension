import { Env, MessageSender } from './types';

export abstract class Message<R> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  protected _: R;
  abstract validateBasic(): void;
  abstract type(): string;
  public readonly origin!: string;
  approveExternal(_env: Omit<Env, 'requestInteraction'>, _sender: MessageSender): boolean {
    return false;
  }
}
