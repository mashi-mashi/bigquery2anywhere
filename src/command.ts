import {CommonTypesSlackPayload} from './libs/slack-client';

export type SettingType =
  | {
      type: 'spreadsheet';
      description: string;
      spreadsheetId: string;
      sheetId: string;
      option: 'replace' | 'append';
    }
  | {
      type: 'slack';
      channel?: string;
      webhookUrl: string;
      makeMessage(value: any): CommonTypesSlackPayload;
      makeSummary?(values: any[]): CommonTypesSlackPayload;
    };

export type CommandType<QUERY_RESULT extends Record<string, any>, COMPOSE_RESULT extends any[]> = {
  query: string;
  composer: (values: QUERY_RESULT[]) => COMPOSE_RESULT;
  messenger: (composed: COMPOSE_RESULT, setting: SettingType) => Promise<any>;
  setting: SettingType;
};
