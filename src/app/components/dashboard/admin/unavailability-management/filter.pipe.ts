import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  /**
   * Filtre un tableau d'items selon un texte de recherche
   * @param items - Le tableau à filtrer
   * @param searchText - Le texte de recherche
   */
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      return (
        (item.espaceName && item.espaceName.toLowerCase().includes(searchText)) ||
        (item.raison && item.raison.toLowerCase().includes(searchText)) ||
        (item.dateDebut && item.dateDebut.toLowerCase().includes(searchText)) ||
        (item.dateFin && item.dateFin.toLowerCase().includes(searchText))
      );
    });
  }
}