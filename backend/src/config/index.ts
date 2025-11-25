/**
 * 配置管理 - 函数式编程实现
 */

// 环境变量接口
interface EnvironmentConfig {
  // 服务器配置
  port: number;
  frontendUrl: string;
  nodeEnv: string;

  // 腾讯混元配置
  tencentSecretId?: string;
  tencentSecretKey?: string;
  mockMode: boolean;

  // Supabase配置
  supabaseUrl?: string;
  supabaseAnonKey?: string;

  // 其他配置
  logLevel: string;
  corsEnabled: boolean;
}

/**
 * 获取环境变量值 - 纯函数
 */
const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
  return process.env[key] || defaultValue;
};

/**
 * 获取环境变量数字值 - 纯函数
 */
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * 获取环境变量布尔值 - 纯函数
 */
const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  return value.toLowerCase() === 'true';
};

/**
 * 创建配置对象 - 纯函数
 */
export const createConfig = (): EnvironmentConfig => ({
  // 服务器配置
  port: getEnvNumber('PORT', 3001),
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:5173')!,
  nodeEnv: getEnvVar('NODE_ENV', 'development')!,

  // 腾讯混元配置
  tencentSecretId: getEnvVar('TENCENT_SECRET_ID'),
  tencentSecretKey: getEnvVar('TENCENT_SECRET_KEY'),
  mockMode: getEnvBoolean('MOCK_MODE', !getEnvVar('TENCENT_SECRET_ID')),

  // Supabase配置
  supabaseUrl: getEnvVar('SUPABASE_URL'),
  supabaseAnonKey: getEnvVar('SUPABASE_ANON_KEY'),

  // 其他配置
  logLevel: getEnvVar('LOG_LEVEL', 'info')!,
  corsEnabled: getEnvBoolean('CORS_ENABLED', true)
});

/**
 * 验证必需的配置 - 纯函数
 */
export const validateConfig = (config: EnvironmentConfig): string[] => {
  const errors: string[] = [];

  // 检查端口
  if (config.port < 1 || config.port > 65535) {
    errors.push('PORT 必须在 1-65535 范围内');
  }

  // 检查前端URL
  if (!config.frontendUrl) {
    errors.push('FRONTEND_URL 不能为空');
  }

  // 如果不是模拟模式，检查腾讯混元配置
  if (!config.mockMode) {
    if (!config.tencentSecretId) {
      errors.push('非模拟模式下 TENCENT_SECRET_ID 不能为空');
    }
    if (!config.tencentSecretKey) {
      errors.push('非模拟模式下 TENCENT_SECRET_KEY 不能为空');
    }
  }

  return errors;
};

/**
 * 打印配置信息 - 副作用函数
 */
export const printConfigInfo = (config: EnvironmentConfig): void => {
  console.log('🔧 应用配置信息:');
  console.log(`   端口: ${config.port}`);
  console.log(`   环境: ${config.nodeEnv}`);
  console.log(`   前端URL: ${config.frontendUrl}`);
  console.log(`   模拟模式: ${config.mockMode ? '启用' : '禁用'}`);
  console.log(`   腾讯混元: ${config.tencentSecretId ? '已配置' : '未配置'}`);
  console.log(`   Supabase: ${config.supabaseUrl ? '已配置' : '未配置'}`);
  console.log(`   CORS: ${config.corsEnabled ? '启用' : '禁用'}`);
  console.log(`   日志级别: ${config.logLevel}`);
};

/**
 * 检查配置是否为生产环境 - 纯函数
 */
export const isProduction = (config: EnvironmentConfig): boolean => {
  return config.nodeEnv === 'production';
};

/**
 * 检查配置是否为开发环境 - 纯函数
 */
export const isDevelopment = (config: EnvironmentConfig): boolean => {
  return config.nodeEnv === 'development';
};

/**
 * 获取数据库配置状态 - 纯函数
 */
export const getDatabaseStatus = (config: EnvironmentConfig) => ({
  supabaseConfigured: !!(config.supabaseUrl && config.supabaseAnonKey),
  supabaseUrl: config.supabaseUrl ? '已配置' : '未配置',
  supabaseKey: config.supabaseAnonKey ? '已配置' : '未配置'
});

/**
 * 获取AI服务配置状态 - 纯函数
 */
export const getAIServiceStatus = (config: EnvironmentConfig) => ({
  mockMode: config.mockMode,
  tencentConfigured: !!(config.tencentSecretId && config.tencentSecretKey),
  secretId: config.tencentSecretId ? '已配置' : '未配置',
  secretKey: config.tencentSecretKey ? '已配置' : '未配置'
});

// 导出配置实例
export const config = createConfig();

// 验证配置
const configErrors = validateConfig(config);
if (configErrors.length > 0) {
  console.error('❌ 配置错误:');
  configErrors.forEach(error => console.error(`   - ${error}`));
  process.exit(1);
}

// 打印配置信息
printConfigInfo(config);
