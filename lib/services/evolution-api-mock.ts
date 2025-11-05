// Mock da Evolution API para desenvolvimento
// Este arquivo simula as respostas da Evolution API quando não estiver rodando

export const evolutionAPIMock = {
  // Simula a criação de instância e retorno de QR Code
  async createInstance(instanceName: string) {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Gera um QR Code mockado (base64 de uma imagem simples)
    const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    return {
      success: true,
      data: {
        base64: mockQRCode,
        code: 'mock-qr-code-123',
      },
    };
  },

  // Simula verificação de status
  async getInstanceStatus(instanceName: string) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Por padrão, retorna desconectado
    // Em produção, isso viria da Evolution API real
    return {
      success: true,
      data: {
        state: 'close', // 'open' = conectado, 'close' = desconectado
        status: 'disconnected',
        phoneNumber: null,
        profilePicUrl: null,
      },
    };
  },

  // Simula desconexão
  async logoutInstance(instanceName: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: { message: 'Desconectado com sucesso' },
    };
  },

  // Simula envio de mensagem
  async sendTextMessage(instanceName: string, payload: { number: string; text: string }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        messageId: `msg-${Date.now()}`,
        sent: true,
      },
    };
  },
};

