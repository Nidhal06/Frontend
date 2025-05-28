import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/services/environments/environment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  team = [
    {
      name: "Nidhal Gharbi",
      role: "Administrateur Général",
      photo: "assets/images/admin2.png",
      bio: "Nidhal est la force motrice derrière CoworkSpace, veillant à ce que chaque espace soit à la fois fonctionnel et accueillant."
    },
    {
      name: "Ayoub Akermi",
      role: "Réceptionniste",
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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const formData = {
      ...this.contactForm.value,
      toEmail: 'level1hub1@gmail.com' // Email de destination
    };

    this.http.post(`${environment.apiUrl}/api/contact`, formData).subscribe({
      next: () => {
        this.toastService.showSuccess('Succès', 'Votre message a été envoyé avec succès');
        this.contactForm.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.showError('Erreur', 'Une erreur est survenue lors de l\'envoi du message');
        this.isSubmitting = false;
      }
    });
  }
}