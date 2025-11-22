/**
 * Utilitários de Validação e Sanitização
 * Proteção contra ataques comuns (XSS, SQL Injection, etc)
 */

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Regex básico para email (RFC 5322 simplificado)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Validações adicionais
  if (email.length > 254) return false; // RFC 5321
  if (email.length < 3) return false;
  
  return emailRegex.test(email);
}

/**
 * Valida senha (mínimo de segurança)
 */
export function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Senha é obrigatória' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Senha deve ter no mínimo 8 caracteres' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Senha muito longa (máximo 128 caracteres)' };
  }

  // Verificar se tem pelo menos uma letra e um número (recomendado)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { 
      valid: false, 
      error: 'Senha deve conter pelo menos uma letra e um número' 
    };
  }

  return { valid: true };
}

/**
 * Sanitiza string removendo caracteres perigosos
 * Proteção básica contra XSS
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input
    .trim()
    // Remove caracteres de controle
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove tags HTML básicas (proteção XSS)
    .replace(/<[^>]*>/g, '')
    // Remove caracteres especiais perigosos
    .replace(/[<>'"&]/g, '');
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitiza nome (remove caracteres especiais, mantém espaços)
 */
export function sanitizeName(name: string, maxLength: number = 100): string {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .trim()
    .replace(/[<>'"&]/g, '') // Remove caracteres perigosos
    .replace(/[^\w\s\-áàâãéèêíïóôõöúüçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜÇ]/gi, '') // Mantém apenas letras, números, espaços e hífens
    .substring(0, maxLength);
}

/**
 * Sanitiza número de telefone (remove caracteres não numéricos)
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove tudo exceto números e +
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Valida número de telefone (formato básico)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  const sanitized = sanitizePhoneNumber(phone);
  
  // Deve ter entre 10 e 15 dígitos (formato internacional)
  const digitsOnly = sanitized.replace(/[^\d]/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Valida tamanho de string
 */
export function validateStringLength(
  input: string, 
  min: number = 0, 
  max: number = Infinity
): { valid: boolean; error?: string } {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Deve ser uma string' };
  }

  if (input.length < min) {
    return { valid: false, error: `Mínimo de ${min} caracteres` };
  }

  if (input.length > max) {
    return { valid: false, error: `Máximo de ${max} caracteres` };
  }

  return { valid: true };
}

/**
 * Valida UUID
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida instanceName (formato esperado)
 */
export function isValidInstanceName(instanceName: string): boolean {
  if (!instanceName || typeof instanceName !== 'string') return false;
  
  // Deve começar com "instance" seguido de caracteres alfanuméricos
  const instanceNameRegex = /^instance[a-zA-Z0-9]+$/;
  
  // Tamanho máximo razoável
  if (instanceName.length > 100) return false;
  
  return instanceNameRegex.test(instanceName);
}

/**
 * Sanitiza mensagem do WhatsApp (remove caracteres perigosos mas mantém conteúdo)
 */
export function sanitizeMessage(message: string, maxLength: number = 4096): string {
  if (!message || typeof message !== 'string') return '';
  
  // Remove caracteres de controle mas mantém emojis e caracteres especiais normais
  let sanitized = message
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove apenas caracteres de controle
    .trim();
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Valida tamanho de payload JSON
 */
export function validatePayloadSize(payload: any, maxSizeKB: number = 100): { valid: boolean; error?: string } {
  try {
    const jsonString = JSON.stringify(payload);
    const sizeKB = Buffer.byteLength(jsonString, 'utf8') / 1024;
    
    if (sizeKB > maxSizeKB) {
      return { 
        valid: false, 
        error: `Payload muito grande: ${sizeKB.toFixed(2)}KB (máximo: ${maxSizeKB}KB)` 
      };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Erro ao validar payload' };
  }
}

