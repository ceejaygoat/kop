
import { supabase } from '@/integrations/supabase/client';

interface LicenseApiResponse {
  isValid: boolean;
  message: string;
  data?: {
    id: string;
    key: string;
    email: string;
    expirationDate: string;
    isActive: boolean;
    createdAt: string;
    aviatorBotName?: string;
    ownerName?: string;
  };
}

interface CreateLicenseRequest {
  email: string;
  durationDays: number;
  aviatorBotName: string;
  ownerName: string;
}

interface CreateLicenseResponse {
  success: boolean;
  message: string;
  license?: {
    id: string;
    key: string;
    email: string;
    expirationDate: string;
    isActive: boolean;
    createdAt: string;
    aviatorBotName: string;
    ownerName: string;
  };
}

interface License {
  id: string;
  key: string;
  email: string;
  expirationDate: string;
  isActive: boolean;
  createdAt: string;
  aviatorBotName?: string;
  ownerName?: string;
}

class LicenseApiService {
  async validateLicense(licenseKey: string): Promise<LicenseApiResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-license', {
        body: { licenseKey: licenseKey.trim() },
      });

      if (error) {
        throw new Error(`API request failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('License validation error:', error);
      return {
        isValid: false,
        message: 'Unable to connect to license server. Please check your internet connection.',
      };
    }
  }

  async createLicense(request: CreateLicenseRequest): Promise<CreateLicenseResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to create a license',
        };
      }

      const { data, error } = await supabase.functions.invoke('create-license', {
        body: { ...request, userId: user.id },
      });

      if (error) {
        throw new Error(`API request failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('License creation error:', error);
      return {
        success: false,
        message: 'Unable to create license. Please try again.',
      };
    }
  }

  async getAllLicenses(): Promise<{ success: boolean; licenses: License[]; message?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          licenses: [],
          message: 'You must be logged in to view licenses',
        };
      }

      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching licenses:', error);
        return {
          success: false,
          licenses: [],
          message: 'Failed to fetch licenses',
        };
      }

      return {
        success: true,
        licenses: data.map(license => ({
          id: license.id,
          key: license.key,
          email: license.email,
          expirationDate: license.expiration_date,
          isActive: license.is_active,
          createdAt: license.created_at,
          aviatorBotName: license.aviator_bot_name,
          ownerName: license.owner_name,
        })),
      };
    } catch (error) {
      console.error('Get licenses error:', error);
      return {
        success: false,
        licenses: [],
        message: 'Unable to fetch licenses. Please try again.',
      };
    }
  }

  async toggleLicenseStatus(licenseId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to update licenses',
        };
      }

      // First get the current license to check ownership
      const { data: license, error: fetchError } = await supabase
        .from('licenses')
        .select('is_active')
        .eq('id', licenseId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !license) {
        return {
          success: false,
          message: 'License not found or access denied',
        };
      }

      // Toggle the status
      const { error: updateError } = await supabase
        .from('licenses')
        .update({ is_active: !license.is_active })
        .eq('id', licenseId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating license:', updateError);
        return {
          success: false,
          message: 'Failed to update license status',
        };
      }

      return {
        success: true,
        message: 'License status updated successfully',
      };
    } catch (error) {
      console.error('Toggle license status error:', error);
      return {
        success: false,
        message: 'Unable to update license status. Please try again.',
      };
    }
  }
}

export const licenseApi = new LicenseApiService();
export type { LicenseApiResponse, CreateLicenseRequest, CreateLicenseResponse, License };
