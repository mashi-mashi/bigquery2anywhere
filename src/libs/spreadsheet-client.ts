import {Auth, sheets_v4, google} from 'googleapis';

export class SpreadSheetClient {
  private readonly sheet: sheets_v4.Sheets;

  public static getInstance = async (credentials?: {projectId: string; private_key: string; client_email: string}) => {
    const auth = (await google.auth.getClient({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })) as Auth.JWT;
    return new SpreadSheetClient(auth);
  };
  private constructor(private readonly auth: Auth.JWT) {
    this.auth = auth;
    this.sheet = google.sheets('v4');
  }

  private clearSheet = async (spreadsheetId: string, sheetId: string) => {
    return await this.sheet.spreadsheets.values.clear({auth: this.auth, spreadsheetId, range: sheetId});
  };

  public replaceSheet = async (spreadsheetId: string, sheetId: string, values: any[]) => {
    await this.clearSheet(spreadsheetId, sheetId);
    await this.sheet.spreadsheets.values.update({
      auth: this.auth,
      spreadsheetId,
      range: sheetId,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [Object.keys(values[0]), ...values.map(Object.values)],
      },
    });
  };
}
