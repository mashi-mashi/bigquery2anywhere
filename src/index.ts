import {CommandType} from './command';
import {BigQueryClient} from './libs/bigquery-client';
import {createLogger} from './libs/core/log';
import {spreadSheetWriter} from './messanger';

export const singleExecutor = async <QUERY_RESULT, COMPOSE_RESULT extends any[]>(
  command: CommandType<QUERY_RESULT, COMPOSE_RESULT>
) => {
  const logger = createLogger('SingleExecutor');
  logger.log(`処理を開始します`);
  const {query, setting, composer, messenger, credentials} = command;
  const bq = new BigQueryClient(credentials);
  const values = await bq.executeQuery<QUERY_RESULT>(query);
  logger.log(`BigQueryの取得件数 ${values.length} 件`);
  const composed = composer(values);

  await messenger(composed, setting, credentials);
  logger.log(`処理が終了しました`);
};

export const multipleExecutor = async (
  commands: CommandType<any, any>[],
  selector: (command: CommandType<any, any>) => boolean
) => {
  await Promise.all(commands.filter(selector).map(singleExecutor));
};

export const SpreadSheetCommand: CommandType<{id: string}, {}[]> = {
  query: '',
  composer: values => {
    return values;
  },
  messenger: spreadSheetWriter,
  setting: {
    type: 'spreadsheet',
    description: '',
    spreadsheetId: '',
    sheetId: '',
    option: 'replace',
  },
};
