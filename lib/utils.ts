import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { blue, yellow, red, green, bold, dim } from 'colorette';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Colored logger
type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

const logPrefix = {
  info: blue(bold('ℹ INFO')),
  warn: yellow(bold('⚠ WARN')),
  error: red(bold('✖ ERROR')),
  success: green(bold('✔ SUCCESS')),
  debug: dim(bold('🐛 DEBUG')),
};

export function log(
  message: any,
  level: LogLevel = 'info',
  ...optionalParams: any[]
) {
  if (!__DEV__) return; // only active in dev mode

  const prefix = logPrefix[level] ?? logPrefix.info;
  const time = dim(new Date().toISOString());

  switch (level) {
    case 'warn':
      console.warn(prefix, time, message, ...optionalParams);
      break;
    case 'error':
      console.error(prefix, time, message, ...optionalParams);
      break;
    default:
      console.log(prefix, time, message, ...optionalParams);
      break;
  }
}
