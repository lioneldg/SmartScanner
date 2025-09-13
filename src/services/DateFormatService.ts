import i18n from '../locales/i18n';

export interface DateFormatOptions {
  includeTime?: boolean;
}

export class DateFormatService {
  /**
   * Format a date according to the current language settings
   * @param timestamp - Unix timestamp in milliseconds
   * @param options - Formatting options
   * @returns Formatted date string
   */
  static formatDate(
    timestamp: number,
    options: DateFormatOptions = {},
  ): string {
    const { includeTime = true } = options;
    const currentLanguage = i18n.language;
    const date = new Date(timestamp);

    // Define locale-specific formatting
    const localeMap: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
    };

    const locale = localeMap[currentLanguage] || 'en-US';

    // Single optimal format for each language
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
    }

    // Use Intl.DateTimeFormat for proper localization
    const formatter = new Intl.DateTimeFormat(locale, formatOptions);
    return formatter.format(date);
  }

  /**
   * Format a date for display in scan history
   * @param timestamp - Unix timestamp in milliseconds
   * @returns Formatted date and time string
   */
  static formatScanDate(timestamp: number): string {
    return this.formatDate(timestamp, {
      includeTime: true,
    });
  }
}

export default DateFormatService;
