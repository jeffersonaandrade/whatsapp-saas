/**
 * Sistema de Logging Estruturado
 * 
 * Fornece logs consistentes e informativos para facilitar debug em produção
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

interface RequestContext {
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  userId?: string;
  accountId?: string;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, requestContext?: RequestContext): string {
    const timestamp = this.formatTimestamp();
    const logData: any = {
      timestamp,
      level: level.toUpperCase(),
      message,
    };

    if (context) {
      logData.context = context;
    }

    if (requestContext) {
      logData.request = {
        ip: requestContext.ip || 'unknown',
        userAgent: requestContext.userAgent || 'unknown',
        method: requestContext.method,
        url: requestContext.url,
        userId: requestContext.userId,
        accountId: requestContext.accountId,
      };
    }

    return JSON.stringify(logData, null, process.env.NODE_ENV === 'development' ? 2 : 0);
  }

  info(message: string, context?: LogContext, requestContext?: RequestContext): void {
    console.log(this.formatLog('info', message, context, requestContext));
  }

  warn(message: string, context?: LogContext, requestContext?: RequestContext): void {
    console.warn(this.formatLog('warn', message, context, requestContext));
  }

  error(message: string, error?: Error | unknown, context?: LogContext, requestContext?: RequestContext): void {
    const errorContext: LogContext = {
      ...context,
    };

    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      errorContext.error = String(error);
    }

    console.error(this.formatLog('error', message, errorContext, requestContext));
  }

  debug(message: string, context?: LogContext, requestContext?: RequestContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('debug', message, context, requestContext));
    }
  }
}

export const logger = new Logger();

/**
 * Extrai contexto de request para logs
 */
export function getRequestContext(request?: Request | { headers?: Headers }): RequestContext {
  // Verificar se request existe antes de usar operador 'in'
  if (!request) {
    return {
      ip: 'unknown',
      userAgent: 'unknown',
      method: undefined,
      url: undefined,
    };
  }
  
  const headers = 'headers' in request ? request.headers : new Headers();
  
  return {
    ip: headers?.get('x-forwarded-for') || headers?.get('x-real-ip') || 'unknown',
    userAgent: headers?.get('user-agent') || 'unknown',
    method: 'method' in request ? request.method : undefined,
    url: 'url' in request ? request.url : undefined,
  };
}

/**
 * Helper para logar erros de Supabase
 */
export function logSupabaseError(
  operation: string,
  error: any,
  context?: LogContext,
  requestContext?: RequestContext
): void {
  const errorDetails: LogContext = {
    ...context,
    operation,
    supabaseError: {
      message: error?.message || 'Unknown error',
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    },
  };

  logger.error(`[Supabase] Erro em ${operation}`, error, errorDetails, requestContext);
}

/**
 * Helper para logar erros de Evolution API
 */
export function logEvolutionAPIError(
  operation: string,
  error: any,
  context?: LogContext,
  requestContext?: RequestContext
): void {
  const errorDetails: LogContext = {
    ...context,
    operation,
    evolutionAPIError: {
      message: error?.message || error?.error || 'Unknown error',
      statusCode: error?.statusCode,
      url: error?.url,
      code: error?.code,
    },
  };

  logger.error(`[Evolution API] Erro em ${operation}`, error, errorDetails, requestContext);
}

