import { apiClient } from './apiClient';

export interface Preferences {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  overdueAlerts?: boolean;
  darkMode?: boolean;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
}

export interface SystemSettings {
  language?: string;
  currency?: string;
  dateFormat?: string;
  numberFormat?: string;
  interestRate?: string;
  maxLoanAmount?: string;
  minLoanAmount?: string;
  goldRateSource?: string;
}

export const settingsService = {
  getPreferences: () => apiClient.get<{ success: boolean; message: string; data: Preferences }>('/settings/preferences'),
  updatePreferences: (prefs: Preferences) => apiClient.put<{ success: boolean; message: string; data: Preferences }>('/settings/preferences', prefs),
  getSystem: () => apiClient.get<{ success: boolean; message: string; data: SystemSettings }>('/settings/system'),
  updateSystem: (settings: SystemSettings) => apiClient.put<{ success: boolean; message: string; data: SystemSettings }>('/settings/system', settings),
};

export default settingsService;
