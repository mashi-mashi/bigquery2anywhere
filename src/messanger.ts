import {SettingType} from './command';
import {SlackClient} from './libs/slack-client';
import {SpreadSheetClient} from './libs/spreadsheet-client';

export const spreadSheetWriter = async <T extends any[]>(composed: T, setting: SettingType) => {
  if (setting.type === 'spreadsheet') {
    const gss = await SpreadSheetClient.getInstance();
    if (setting.option === 'replace') {
      await gss.replaceSheet(setting.spreadsheetId, setting.sheetId, composed);
    }
  } else {
    throw new Error(`different types specified. shoud be spreadsheet but ${setting.type}`);
  }
};

export const slackNotifer = async <T extends any[]>(composed: T, setting: SettingType) => {
  if (setting.type === 'slack') {
    const slack = SlackClient.getInstance(setting.webhookUrl);
    const messages = composed.map(setting.parser);
    await Promise.all(messages.map(message => slack.notify({...message, channel: message.channel || setting.channel})));
  } else {
    throw new Error(`different types specified. shoud be slack but ${setting.type}`);
  }
};
