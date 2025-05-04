import { Pipe, PipeTransform } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

@Pipe({ name: 'frenchDate' })
export class FrenchDatePipe implements PipeTransform {
  transform(value: string): string {
    return format(parseISO(value), 'dd MMM yyyy HH:mm', { locale: fr });
  }
}