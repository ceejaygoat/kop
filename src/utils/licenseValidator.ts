
import { licenseApi, type LicenseApiResponse } from '@/services/licenseApi';

export interface LicenseValidationResult {
  isValid: boolean;
  message: string;
  expirationDate?: string;
  email?: string;
  aviatorBotName?: string;
  ownerName?: string;
}

export const validateLicenseKey = async (licenseKey: string): Promise<LicenseValidationResult> => {
  try {
    const response: LicenseApiResponse = await licenseApi.validateLicense(licenseKey);
    
    if (response.isValid && response.data) {
      return {
        isValid: true,
        message: response.message,
        expirationDate: response.data.expirationDate,
        email: response.data.email,
        aviatorBotName: response.data.aviatorBotName,
        ownerName: response.data.ownerName,
      };
    } else {
      return {
        isValid: false,
        message: response.message,
      };
    }
  } catch (error) {
    console.error('License validation error:', error);
    return {
      isValid: false,
      message: 'Unable to validate license. Please check your internet connection.',
    };
  }
};

export const formatExpirationDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getDaysUntilExpiration = (expirationDate: string): number => {
  const now = new Date();
  const expiry = new Date(expirationDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
