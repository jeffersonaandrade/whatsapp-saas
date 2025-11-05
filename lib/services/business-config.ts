// Serviço de configurações do negócio (mockado)
// TODO: Substituir por chamadas reais ao Supabase quando conectar

export interface BusinessConfig {
  id: string;
  accountId: string;
  companyName: string;
  businessType: string;
  businessDescription?: string;
  openingHours?: string;
  address?: string;
  phone?: string;
  deliveryAvailable: boolean;
  deliveryFee?: number;
  groqApiKey?: string;
  // Configurações do Bot
  welcomeMessage?: string; // Opcional - se não preenchido, IA gera
  defaultMessage?: string; // Opcional - se não preenchido, IA gera
  transferMessage?: string; // Opcional - se não preenchido, usa padrão
  transferKeywords?: string[]; // Palavras-chave para transferir
  botPersonality?: string; // Personalidade do bot (ex: "despojado", "totalmente social", "profissional")
  createdAt: string;
  updatedAt: string;
}

// Mock: Configurações do negócio
// TODO: Substituir por SELECT * FROM accounts WHERE id = accountId
const mockBusinessConfigs: BusinessConfig[] = [
  {
    id: '1',
    accountId: 'account-1',
    companyName: 'Nossa Empresa',
    businessType: 'Vendas',
    businessDescription: '',
    openingHours: '',
    address: '',
    phone: '',
    deliveryAvailable: false,
    deliveryFee: 0,
    groqApiKey: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const businessConfigService = {
  /**
   * Busca configuração do negócio por accountId
   * TODO: Substituir por chamada ao Supabase:
   * 
   * const { data, error } = await supabase
   *   .from('accounts')
   *   .select('*')
   *   .eq('id', accountId)
   *   .single();
   * 
   * return data;
   */
  async getBusinessConfig(accountId: string): Promise<BusinessConfig | null> {
    const config = mockBusinessConfigs.find(c => c.accountId === accountId);
    return config || null;
  },

  /**
   * Busca configuração do negócio por instanceName
   * TODO: Substituir por chamada ao Supabase:
   * 
   * 1. Buscar instance pelo name:
   *    const { data: instance } = await supabase
   *      .from('instances')
   *      .select('account_id')
   *      .eq('name', instanceName)
   *      .single();
   * 
   * 2. Buscar account pelo account_id:
   *    const { data: account } = await supabase
   *      .from('accounts')
   *      .select('*')
   *      .eq('id', instance.account_id)
   *      .single();
   * 
   * return account;
   */
  async getBusinessConfigByInstanceName(instanceName: string): Promise<BusinessConfig | null> {
    // Por enquanto, retorna a primeira configuração mockada
    // TODO: Implementar busca real via instanceName -> accountId -> account
    return mockBusinessConfigs[0] || null;
  },

  /**
   * Atualiza configuração do negócio
   * TODO: Substituir por chamada ao Supabase:
   * 
   * const { data, error } = await supabase
   *   .from('accounts')
   *   .update({
   *     company_name: config.companyName,
   *     business_type: config.businessType,
   *     business_description: config.businessDescription,
   *     opening_hours: config.openingHours,
   *     address: config.address,
   *     phone: config.phone,
   *     delivery_available: config.deliveryAvailable,
   *     delivery_fee: config.deliveryFee,
   *     groq_api_key: config.groqApiKey,
   *     updated_at: new Date().toISOString(),
   *   })
   *   .eq('id', accountId);
   * 
   * return data;
   */
  async updateBusinessConfig(accountId: string, config: Partial<BusinessConfig>): Promise<BusinessConfig> {
    const existingConfig = mockBusinessConfigs.find(c => c.accountId === accountId);
    
    if (!existingConfig) {
      // Criar nova configuração
      const newConfig: BusinessConfig = {
        id: Date.now().toString(),
        accountId,
        companyName: config.companyName || 'Nossa Empresa',
        businessType: config.businessType || 'Vendas',
        businessDescription: config.businessDescription,
        openingHours: config.openingHours,
        address: config.address,
        phone: config.phone,
        deliveryAvailable: config.deliveryAvailable ?? false,
        deliveryFee: config.deliveryFee,
        groqApiKey: config.groqApiKey,
        // Configurações do Bot
        welcomeMessage: config.welcomeMessage,
        defaultMessage: config.defaultMessage,
        transferMessage: config.transferMessage,
        transferKeywords: config.transferKeywords || ['atendente', 'atendimento humano', 'falar com alguém', 'humano', 'pessoa'],
        botPersonality: config.botPersonality,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockBusinessConfigs.push(newConfig);
      return newConfig;
    }

    // Atualizar configuração existente
    Object.assign(existingConfig, {
      ...config,
      updatedAt: new Date().toISOString(),
    });

    return existingConfig;
  },
};

