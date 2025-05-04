// about.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  team = [
    {
      name: "Nidhal Gharbi",
      role: "Administratrice Générale",
      photo: "assets/images/admin.png",
      bio: "Nidhal est la force motrice derrière CoworkSpace, veillant à ce que chaque espace soit à la fois fonctionnel et accueillant."
    },
    {
      name: "Ayoub Akermi",
      role: "Receptionniste",
      photo: "assets/images/accountant.png",
      bio: "Ayoub gère les finances de CoworkSpace avec rigueur, assurant la transparence et la responsabilité dans chaque transaction."
    },
  ];

  values = [
    {
      icon: "bi bi-people-fill",
      title: "Communauté",
      description: "Nous créons des environnements favorisant les rencontres et collaborations entre professionnels."
    },
    {
      icon: "bi bi-star-fill",
      title: "Excellence",
      description: "Nous nous engageons à offrir des espaces et services de la plus haute qualité."
    },
    {
      icon: "bi bi-lightning-fill",
      title: "Innovation",
      description: "Nous recherchons constamment de nouvelles façons d'améliorer l'expérience de travail."
    },
    {
      icon: "bi bi-cup-hot-fill",
      title: "Bien-être",
      description: "Nous concevons des espaces qui favorisent le confort et l'équilibre vie professionnelle/personnelle."
    }
  ];
}