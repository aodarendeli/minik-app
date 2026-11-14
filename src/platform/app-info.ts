import Constants from 'expo-constants';

/** Version from app.json (`expo.version`) and the support address (`expo.extra.supportEmail`). */
export const appInfo = {
  version: Constants.expoConfig?.version ?? '0.0.0',
  supportEmail: String(Constants.expoConfig?.extra?.supportEmail ?? ''),
};
