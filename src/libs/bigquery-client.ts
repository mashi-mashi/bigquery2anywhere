import {BigQuery, InsertRowsResponse} from '@google-cloud/bigquery';
import {chunk, deepDeleteUndefined} from '../utils/object-utils';
import {HttpError, HttpStatusCode} from './core/error';
import {createLogger} from './core/log';

const MAXIMUM_EXECUTION_AMOUNT_YEN = 5;

export class BigQueryClient {
  private readonly client: BigQuery;
  private readonly logger = createLogger('BigQueryClient');

  constructor(credentials?: {projectId: string; private_key: string; client_email: string}) {
    this.client = new BigQuery(
      credentials
        ? {
            projectId: credentials?.projectId,
            credentials,
          }
        : undefined
    );
  }

  /**
   * はじめに実行計画を行ってから実行
   * @param sql
   * @param params
   */
  public executeQuery = async <T>(sql: string, params?: {[param: string]: any}): Promise<T[]> => {
    const [, res] = await this.client.createQueryJob({query: sql, dryRun: true});
    const yen = this.billedAsYen(res.statistics?.totalBytesProcessed);
    //this.logger.log(`見積もり(円): ${yen}`);

    if (!yen || yen > MAXIMUM_EXECUTION_AMOUNT_YEN) {
      throw new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, 'query-cost-is-too-high');
    }

    const result = await this.client.query({query: sql, params}).catch(e => {
      this.logger.error('failed to execute query', e);
      throw new HttpError(HttpStatusCode.INTERNAL_SERVER_ERROR, 'failed-to-execute-query');
    });

    return result[0] as T[];
  };

  private billedAsYen = (bytesProcessed?: string | number) => {
    if (!bytesProcessed) return;
    const minBytesBilled: number = 1024 * 1024 * 10;
    const bytes: number = minBytesBilled > Number(bytesProcessed) ? minBytesBilled : Number(bytesProcessed);
    const bytesAsTeraBytes: number = bytes / 1024 / 1024 / 1024 / 1024;
    return (bytesAsTeraBytes / 1) /* TB */ * 5 /* $ */ * 113; /* 円(ドル円相場) */
  };

  public insertRawJsons = async (
    datasetId: string,
    tableId: string,
    rows: {
      insertId: string | undefined;
      json: any;
    }[]
  ) => {
    if (!rows.length) {
      console.log('no data.');
      return {results: [], errors: []};
    }

    const results: InsertRowsResponse[] = [];
    const errors: any[] = [];
    for (const rows_part of chunk(rows, 1000)) {
      const result = await this.client
        .dataset(datasetId)
        .table(tableId)
        .insert(rows_part.map(deepDeleteUndefined), {raw: true})
        .catch(e => {
          if (e.errors?.length) {
            e.errors.forEach((error: any) => {
              errors.push(...e.errors.flat());
            });
          }
        });
      console.log(`insert to bigquery. tableId: ${datasetId}.${tableId} count: ${rows_part.length} / ${rows.length}`);

      result && results.push(result);
    }

    console.log(`insert process completed. tableId: ${datasetId}.${tableId} count: ${rows.length}`);

    return {results, errors: errors.flat()};
  };
}
