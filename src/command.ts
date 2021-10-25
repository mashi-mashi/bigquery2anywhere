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

export type CredentialType = {projectId: string; private_key: string; client_email: string};

export type CommandType<QUERY_RESULT extends Record<string, any>, COMPOSE_RESULT extends any[]> = {
  query: string;
  composer: (values: QUERY_RESULT[]) => COMPOSE_RESULT;
  // Credentialに依存するのびみょう・・・
  messenger: (composed: COMPOSE_RESULT, setting: SettingType, credentials?: CredentialType) => Promise<any>;
  setting: SettingType;
  credentials?: CredentialType;
};
