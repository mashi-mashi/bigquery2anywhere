import {CommandType} from './command';
import {BigQueryClient} from './libs/bigquery-client';
import {spreadSheetWriter} from './messanger';

const executor = async <QUERY_RESULT, COMPOSE_RESULT extends any[]>(
  command: CommandType<QUERY_RESULT, COMPOSE_RESULT>
) => {
  const bq = new BigQueryClient();
  const values = await bq.executeQuery<QUERY_RESULT>(command.query);

  const composed = command.composer(values);
  await command.messenger(composed, command.setting);
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
