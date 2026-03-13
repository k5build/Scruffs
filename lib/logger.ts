/**
 * Structured JSON logger.
 * Production: emits one JSON line per log entry.
 * Development: emits coloured human-readable output.
 *
 * Phone masking: all but last 4 digits are replaced with *.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  userId?:    string;
  bookingId?: string;
  ip?:        string;
  phone?:     string;
  action?:    string;
  error?:     string;
  [key: string]: unknown;
}

interface LogEntry {
  ts:      string;
  level:   LogLevel;
  service: string;
  msg:     string;
  ctx?:    LogContext;
}

/** Replace all but last 4 digits of a phone number with * */
function maskPhone(phone: string): string {
  // Keep leading + if present, mask everything except last 4 digits
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length <= 4) return '****';
  const suffix = cleaned.slice(-4);
  const prefix = cleaned.startsWith('+') ? '+' : '';
  const masked = '*'.repeat(cleaned.length - 4 - (prefix ? 1 : 0));
  return `${prefix}${masked}${suffix}`;
}

/** Sanitise context — mask phone, strip full Error objects */
function sanitiseCtx(ctx?: LogContext): LogContext | undefined {
  if (!ctx) return undefined;
  const out: LogContext = { ...ctx };
  if (out.phone) {
    out.phone = maskPhone(String(out.phone));
  }
  // Ensure error is a string only (never a stack trace in production)
  if (out.error !== undefined && out.error !== null) {
    const errStr = String(out.error);
    out.error =
      process.env.NODE_ENV === 'production'
        ? errStr.split('\n')[0].slice(0, 200) // first line only, capped
        : errStr.slice(0, 500);
  }
  return out;
}

const DEV_COLOURS: Record<LogLevel, string> = {
  DEBUG: '\x1b[36m', // cyan
  INFO:  '\x1b[32m', // green
  WARN:  '\x1b[33m', // yellow
  ERROR: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

function emit(level: LogLevel, service: string, msg: string, ctx?: LogContext): void {
  const ts    = new Date().toISOString();
  const clean = sanitiseCtx(ctx);

  if (process.env.NODE_ENV === 'production') {
    const entry: LogEntry = { ts, level, service, msg };
    if (clean) entry.ctx = clean;
    // Single JSON line — no pretty-printing
    process.stdout.write(JSON.stringify(entry) + '\n');
  } else {
    const colour = DEV_COLOURS[level];
    const ctxStr = clean ? ' ' + JSON.stringify(clean) : '';
    // eslint-disable-next-line no-console
    console.log(`${colour}[${level}]${RESET} ${ts} [${service}] ${msg}${ctxStr}`);
  }
}

export const logger = {
  debug: (service: string, msg: string, ctx?: LogContext) => emit('DEBUG', service, msg, ctx),
  info:  (service: string, msg: string, ctx?: LogContext) => emit('INFO',  service, msg, ctx),
  warn:  (service: string, msg: string, ctx?: LogContext) => emit('WARN',  service, msg, ctx),
  error: (service: string, msg: string, ctx?: LogContext) => emit('ERROR', service, msg, ctx),
};
