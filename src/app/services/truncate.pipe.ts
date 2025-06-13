import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to truncate text with optional word boundary preservation.
 */
@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  /**
   * Transforms input string by truncating it.
   * @param value The input string.
   * @param limit The maximum length before truncation.
   * @param completeWords Whether to preserve complete words.
   * @param ellipsis The ellipsis string to append.
   * @returns The truncated string.
   */
  transform(
    value: string, 
    limit = 25, 
    completeWords = false, 
    ellipsis = '...'
  ): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
    }
    return `${value.substr(0, limit)}${ellipsis}`;
  }
}