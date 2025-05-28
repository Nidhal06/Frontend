import { Component, OnInit } from '@angular/core';
import { EspaceService } from '../../services/espace.service';
import { EvenementService } from '../../services/evenement.service';
import { EspaceDTO, EspaceOuvertDTO, EspacePriveDTO, EvenementDTO } from '../../types/entities';
import { environment } from '../../services/environments/environment';

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

  featuredSpaces: (EspaceDTO | EspacePriveDTO | EspaceOuvertDTO)[] = [];
  featuredEvents: EvenementDTO[] = [];
  isLoading = true;
  spaceRatings: {[key: number]: number} = {};
  environment = environment;

  constructor(
    private espaceService: EspaceService,
    private evenementService: EvenementService
  ) { }

  ngOnInit(): void {
    this.loadFeaturedSpaces();
    this.loadFeaturedEvents();
  }

 loadFeaturedSpaces(): void {
  this.espaceService.getAllEspaces().subscribe({
    next: (espaces) => {
      this.featuredSpaces = espaces.slice(0, 3).map(espace => {
        // Nettoyer l'URL de la photo principale
        let cleanedPhoto = espace.photoPrincipal;
        if (cleanedPhoto) {
          cleanedPhoto = cleanedPhoto.replace(/^http:\/\/localhost:1010/, '');
          if (!cleanedPhoto.startsWith('/')) {
            cleanedPhoto = '/' + cleanedPhoto;
          }
        }

        // Construire l'URL finale de l'image
        const imageUrl = cleanedPhoto
          ? `${environment.apiUrl}${cleanedPhoto}`
          : this.getRandomSpaceImage();

        // Générer une note aléatoire (pour démo)
        const rating = Math.random() * 1 + 4;
        this.spaceRatings[espace.id || 0] = parseFloat(rating.toFixed(1));

        // Retourner l'espace avec les données réelles (y compris la capacité)
        return {
          ...espace,
          photoPrincipal: imageUrl,
          location: this.getRandomLocation()
          // Ne pas écraser la capacité avec une valeur aléatoire
        };
      });
    },
    error: (error) => {
      console.error('Error loading featured spaces:', error);
      this.featuredSpaces = [];
    }
  });
}


  getSpaceRating(spaceId: number): number {
    return this.spaceRatings[spaceId] || 0;
  }

  isPrivateSpace(space: EspaceDTO | EspacePriveDTO): space is EspacePriveDTO {
  return space.type === 'PRIVE' && 'prixParJour' in space;
}


loadFeaturedEvents(): void {
    this.isLoading = true;
    this.evenementService.getAllEvenements().subscribe({
      next: (events) => {
        this.featuredEvents = events.map(event => ({
          ...event,
          participantsCount: event.participants?.length || 0,
          startTime: event.startDate,
          endTime: event.endDate,
          title: event.titre,
          space: {
            name: event.espaceName
          }
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.isLoading = false;
      }
    });
  }

  getProgressPercentage(event: EvenementDTO): number {
    if (!event.maxParticipants || event.maxParticipants === 0) return 0;
    const participantsCount = event.participants?.length || 0;
    const percentage = (participantsCount / event.maxParticipants) * 100;
    return Math.min(100, Math.round(percentage));
  }

public formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
}

 // Méthodes utilitaires pour la démo
  private getRandomSpaceImage(): string {
    const images = [
      'assets/images/space1.jpg',
      'assets/images/space2.jpg',
      'assets/images/space3.jpg'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  private getRandomSpaceType(): 'OUVERT' | 'PRIVE' {
    return Math.random() > 0.5 ? 'OUVERT' : 'PRIVE';
  }

  private getRandomLocation(): string {
    const locations = ['Tunis'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private getRandomPrice(): number {
    return Math.floor(Math.random() * 50) + 20;
  }

  registerToEvent(eventId: string): void {
  console.log(`Inscription à l'événement ${eventId}`);
  }
}