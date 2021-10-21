import {CommandType} from './command';
import {BigQueryClient} from './libs/bigquery-client';
import {spreadSheetWriter} from './messanger';

const singleExecutor = async <QUERY_RESULT, COMPOSE_RESULT extends any[]>(
  command: CommandType<QUERY_RESULT, COMPOSE_RESULT>
) => {
  const {query, setting, composer, messenger} = command;
  const bq = new BigQueryClient();
  const values = await bq.executeQuery<QUERY_RESULT>(query);
  const composed = composer(values);

  await messenger(composed, setting);
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

// (async () => {
//   await executor(SpreadSheetCommand);
// })();
