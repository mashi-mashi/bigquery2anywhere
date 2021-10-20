import axios from 'axios';

// ライブラリ入れれば型とれそうだけど、そこまでしなくてもいいと思ったので
type slackBlock = {
  type?: string;
  text?:
    | string
    | {
        type: string;
        text: string;
      };
  accessory?: {
    type: 'button';
    text: {
      type: string;
      emoji: boolean;
      text: string;
    };
    url: string;
    style?: 'primary' | 'secondary';
  };
  fields?: {
    type: string;
    text: string;
  }[];
};

export type CommonTypesSlackPayload = {
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: [
    {
      color: string;
      blocks?: slackBlock[];
    }
  ];
  blocks?: slackBlock[];
};

export class SlackClient {
  public static getInstance(url: string) {
    return new SlackClient(url);
  }

  private constructor(protected url: string) {
    this.url = url;
  }

  /**
   * Payloadと文字列一応どちらも受け取れるように
   * @param data
   * @param url
   */
  public notify = async (data: string | CommonTypesSlackPayload) => {
    if (!data) return;

    try {
      const options = {
        method: 'post' as const,
        baseURL: this.url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        data: `payload=${JSON.stringify(data instanceof String ? {text: data} : data)}`,
      };

      await axios.request(options);
    } catch (e) {
      console.error('Failed to post slack.', e);
    }
  };
}
