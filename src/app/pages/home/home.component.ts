import { Component, OnInit } from '@angular/core';
import { SpaceService } from '../../services/space.service';
import { EventService } from 'src/app/services/event.service';
import { Event } from 'src/app/services/event.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  features = [
    {
      icon: 'bi bi-building',
      title: 'Espace variés',
      description:
        'Des bureaux privés, espaces ouverts et salles de réunion adaptés à tous vos besoins professionnels.',
    },
    {
      icon: 'bi bi-wifi',
      title: 'Connexion haut débit',
      description:
        'Internet fibre optique ultra-rapide et sécurisé pour une productivité optimale.',
    },
    {
      icon: 'bi bi-cup-straw',
      title: 'Espace détente',
      description:
        'Zones de pause confortables avec café, thé et rafraîchissements inclus.',
    },
    {
      icon: 'bi bi-display',
      title: 'Équipement moderne',
      description:
        'Accès à des équipements de pointe : imprimantes, écrans, vidéo projecteurs.',
    },
    {
      icon: 'bi bi-people',
      title: 'Communauté dynamique',
      description:
        'Rejoignez un réseau de professionnels et participez à des événements réguliers.',
    },
    {
      icon: 'bi bi-clock',
      title: 'Accès 24/7',
      description:
        'Travaillez selon votre propre emploi du temps avec un accès sécurisé en tout temps.',
    },
  ];

  testimonials = [
    {
      id: 1,
      name: 'Nour el houda Chawebi',
      title: 'DevOps Trainer',
      content:
        'CoworkSpace a complètement transformé ma façon de travailler. L\'environnement est inspirant et la communauté exceptionnelle.',
      imageUrl:
        'assets/images/1744907375150.jpg',
    },
    {
      id: 2,
      name: 'Ahmed Neffati',
      title: 'CEO, 9antra.tn',
      content:
        'Notre startup a trouvé son rythme ici. Les espaces sont parfaitement adaptés à nos besoins et l\'équipe est très réactive.',
      imageUrl:
        'assets/images/7cy9gtl6_400x400.jpg',
    },
    {
      id: 3,
      name: 'Mohamed Aziz Ben Ismail',
      title: 'Software engineer',
      content:
        'Je recommande vivement cette plateforme. La réservation est simple et les espaces sont toujours impeccables.',
      imageUrl:
        'assets/images/61393700.jpg',
    },
  ];

  featuredSpaces: any[] = [];
  featuredEvents: Event[] = [];

  constructor(private spaceService: SpaceService , private eventService: EventService) {}

  ngOnInit(): void {
    this.loadFeaturedSpaces();
    this.loadFeaturedEvents();
  }

  loadFeaturedSpaces(): void {
    this.spaceService.getAllSpaces().subscribe({
      next: (spaces) => {
        // Trier les espaces par popularité (supposons qu'il y ait un champ 'views' ou 'bookings')
        // Si vous n'avez pas de champ de popularité, vous pouvez simplement prendre les 3 premiers actifs
        this.featuredSpaces = spaces
          .filter(space => space.isActive)
          .sort((a, b) => (b.views || 0) - (a.views || 0)) // Tri décroissant par popularité
          .slice(0, 3)
          .map(space => ({
            id: space.id,
            title: space.name,
            type: this.getSpaceType(space),
            location: space.location || 'Tunis',
            capacity: space.capacity,
            price: space.pricePerDay,
            priceUnit: 'jour',
            rating: space.rating || 4.5, // Valeur par défaut si pas de rating
            imageUrl: space.photo || 'assets/images/default-space.jpg'
          }));
      },
      error: (err) => {
        console.error('Error loading featured spaces:', err);
      }
    });
  }
  
  // Ajoutez cette méthode pour déterminer le type d'espace
  private getSpaceType(space: any): string {
    if (space.capacity <= 2) return 'Bureau privé';
    if (space.capacity <= 6) return 'Espace partagé';
    return 'Salle de réunion';
  }

  loadFeaturedEvents(): void {
    this.eventService.getAllEvents().subscribe({
        next: (events) => {
            const now = new Date();
            this.featuredEvents = events
                .filter(event => new Date(event.startTime) > now && event.isActive) 
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 3); 
        },
        error: (err) => {
            console.error('Error loading featured events:', err);
            this.featuredEvents = [];
        }
    });
}

  // Ajoutez cette méthode utilitaire
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

    // Dans la classe HomeComponent
registerToEvent(eventId: string): void {
  // Ici vous pouvez implémenter la logique d'inscription
  // Par exemple, rediriger vers une page d'inscription ou ouvrir un modal
  console.log(`Inscription à l'événement ${eventId}`);
  // Vous pouvez aussi ajouter une notification/toast
  // this.toastService.success('Inscription réussie !');
}
}