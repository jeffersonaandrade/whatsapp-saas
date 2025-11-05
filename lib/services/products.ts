// Serviço de produtos (mockado - depois será substituído por Supabase)

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  imageUrl?: string; // URL da imagem do produto
  isActive: boolean; // Produtos inativos NÃO são enviados para a IA
  createdAt: string;
  updatedAt: string;
}

// Mock: Produtos
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Produto Exemplo',
    description: 'Descrição do produto exemplo',
    price: 99.90,
    currency: 'BRL',
    category: 'Geral',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const productsService = {
  async getAllProducts(accountId: string): Promise<Product[]> {
    // TODO: Carregar do Supabase quando conectar
    return mockProducts.filter(p => p.isActive);
  },

  async getProductById(productId: string): Promise<Product | null> {
    return mockProducts.find(p => p.id === productId) || null;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index === -1) return null;

    mockProducts[index] = {
      ...mockProducts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockProducts[index];
  },

  async deleteProduct(productId: string): Promise<boolean> {
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index === -1) return false;

    mockProducts.splice(index, 1);
    return true;
  },
};

/**
 * Formata produtos para contexto da IA
 * Inclui URL da imagem quando disponível
 */
export function formatProductsForAI(products: Product[]): string {
  if (products.length === 0) {
    return 'Nenhum produto cadastrado no momento.';
  }

  const formatted = products.map(p => {
    const price = p.currency === 'BRL' 
      ? `R$ ${p.price.toFixed(2).replace('.', ',')}`
      : `${p.price.toFixed(2)} ${p.currency || ''}`;
    
    let productInfo = `- ${p.name}${p.description ? ` (${p.description})` : ''}: ${price}${p.category ? ` [${p.category}]` : ''}`;
    
    // Adicionar informação sobre imagem se disponível
    if (p.imageUrl) {
      productInfo += ` [IMAGEM: ${p.imageUrl}]`;
    }
    
    return productInfo;
  }).join('\n');

  return `Produtos disponíveis:\n${formatted}`;
}

/**
 * Busca produto por nome (para a IA encontrar o produto quando mencionado)
 */
export function findProductByName(products: Product[], productName: string): Product | null {
  const normalizedName = productName.toLowerCase().trim();
  return products.find(p => 
    p.name.toLowerCase().includes(normalizedName) || 
    normalizedName.includes(p.name.toLowerCase())
  ) || null;
}

