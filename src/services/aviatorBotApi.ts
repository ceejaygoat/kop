
import { supabase } from '@/integrations/supabase/client';

interface AviatorBot {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

interface CreateBotRequest {
  name: string;
  description?: string;
}

class AviatorBotApiService {
  async getAllBots(): Promise<{ success: boolean; bots: AviatorBot[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('aviator_bots')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bots:', error);
        return {
          success: false,
          bots: [],
          message: 'Failed to fetch aviator bots',
        };
      }

      return {
        success: true,
        bots: data.map(bot => ({
          id: bot.id,
          name: bot.name,
          description: bot.description,
          isActive: bot.is_active,
          createdAt: bot.created_at,
          createdBy: bot.created_by,
        })),
      };
    } catch (error) {
      console.error('Get bots error:', error);
      return {
        success: false,
        bots: [],
        message: 'Unable to fetch aviator bots. Please try again.',
      };
    }
  }

  async createBot(request: CreateBotRequest): Promise<{ success: boolean; bot?: AviatorBot; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in to create a bot',
        };
      }

      const { data, error } = await supabase
        .from('aviator_bots')
        .insert({
          name: request.name,
          description: request.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bot:', error);
        return {
          success: false,
          message: 'Failed to create aviator bot',
        };
      }

      return {
        success: true,
        bot: {
          id: data.id,
          name: data.name,
          description: data.description,
          isActive: data.is_active,
          createdAt: data.created_at,
          createdBy: data.created_by,
        },
        message: 'Aviator bot created successfully',
      };
    } catch (error) {
      console.error('Create bot error:', error);
      return {
        success: false,
        message: 'Unable to create aviator bot. Please try again.',
      };
    }
  }
}

export const aviatorBotApi = new AviatorBotApiService();
export type { AviatorBot, CreateBotRequest };
