import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Expo-safe colored logger (emoji + style tags)
type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

const logPrefix = {
  info: 'ℹ️ [INFO]',
  warn: '⚠️ [WARN]',
  error: '❌ [ERROR]',
  success: '✅ [SUCCESS]',
  debug: '🐛 [DEBUG]',
};

export function log(
  message: any,
  level: LogLevel = 'info',
  ...optionalParams: any[]
) {
  // if (!__DEV__) return;

  const prefix = logPrefix[level] ?? logPrefix.info;
  const time = new Date().toISOString();

  switch (level) {
    case 'warn':
      console.warn(`${prefix} ${time}`, message, ...optionalParams);
      break;
    case 'error':
      console.error(`${prefix} ${time}`, message, ...optionalParams);
      break;
    default:
      console.log(`${prefix} ${time}`, message, ...optionalParams);
      break;
  }
}
