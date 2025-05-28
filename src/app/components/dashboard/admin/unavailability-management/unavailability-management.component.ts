import { Component, OnInit , TemplateRef } from '@angular/core';
import { EspaceDTO, IndisponibiliteDTO } from '../../../../types/entities';
import { IndisponibiliteService } from '../../../../services/indisponibilite.service';
import { EspaceService } from '../../../../services/espace.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FilterPipe } from './filter.pipe';

@Component({
  selector: 'app-unavailability-management',
  templateUrl: './unavailability-management.component.html',
  styleUrls: ['./unavailability-management.component.css'],
  providers: [FilterPipe]
})
export class UnavailabilityManagementComponent implements OnInit {
  indisponibilites: IndisponibiliteDTO[] = [];
  espaces: EspaceDTO[] = [];
  loading = false;
  currentIndisponibilite: IndisponibiliteDTO | null = null;
  searchText = '';
  
  // Formulaire
  indispoForm: FormGroup;
  isEditMode = false;



  constructor(
    private indisponibiliteService: IndisponibiliteService,
    private espaceService: EspaceService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.indispoForm = this.fb.group({
      espaceId: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      raison: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadIndisponibilites();
    this.loadEspaces();
  }

  loadIndisponibilites(): void {
    this.loading = true;
    this.indisponibiliteService.getAllIndisponibilites().subscribe({
      next: (data) => {
        this.indisponibilites = data;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des indisponibilités');
        this.loading = false;
      }
    });
  }

  loadEspaces(): void {
    this.espaceService.getAllEspaces().subscribe({
      next: (data) => {
        this.espaces = data;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des espaces');
      }
    });
  }

  openCreateModal(content: any): void {
    this.isEditMode = false;
    this.indispoForm.reset();
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  openEditModal(content: any, indispo: IndisponibiliteDTO): void {
    this.isEditMode = true;
    this.currentIndisponibilite = indispo;
    
    this.indispoForm.patchValue({
      espaceId: indispo.espaceId,
      dateDebut: this.formatDateForInput(indispo.dateDebut),
      dateFin: this.formatDateForInput(indispo.dateFin),
      raison: indispo.raison
    });
    
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.indispoForm.invalid) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const formValue = this.indispoForm.value;
    const espace = this.espaces.find(e => e.id === formValue.espaceId);
    const indispoData: IndisponibiliteDTO = {
      espaceId: formValue.espaceId,
      espaceName: espace ? espace.name : 'Espace inconnu',
      dateDebut: formValue.dateDebut,
      dateFin: formValue.dateFin,
      raison: formValue.raison
    };

    if (this.isEditMode && this.currentIndisponibilite?.id) {
      this.updateIndisponibilite(this.currentIndisponibilite.id, indispoData);
    } else {
      this.createIndisponibilite(indispoData);
    }
  }

  createIndisponibilite(indispo: IndisponibiliteDTO): void {
    this.indisponibiliteService.createIndisponibilite(indispo).subscribe({
      next: (data) => {
        this.toastr.success('Indisponibilité créée avec succès');
        this.loadIndisponibilites();
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la création de l\'indisponibilité');
      }
    });
  }

  updateIndisponibilite(id: number, indispo: IndisponibiliteDTO): void {

  const updateData = {
    ...indispo,
    id: id 
  };
  
  this.indisponibiliteService.updateIndisponibilite(id, updateData).subscribe({
    next: (data) => {
      this.toastr.success('Indisponibilité mise à jour avec succès');
      this.loadIndisponibilites();
      this.modalService.dismissAll();
    },
    error: (err) => {
      this.toastr.error('Erreur lors de la mise à jour de l\'indisponibilité');
    }
  });
}

openDeleteModal(modal: TemplateRef<any>, currentIndisponibilite: IndisponibiliteDTO): void {
    this.currentIndisponibilite = currentIndisponibilite;
    this.modalService.open(modal);
  }

  deleteIndisponibilite(): void {
    if (!this.currentIndisponibilite) return;

    this.indisponibiliteService.deleteIndisponibilite(this.currentIndisponibilite.id!).subscribe({
      next: () => {
        this.toastr.success('Indisponibilité supprimée avec succès');
        this.loadIndisponibilites();
        this.modalService.dismissAll();
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la suppression de l\'indisponibilité');
      }
    });
  }

  getEspaceName(espaceId: number): string {
    const espace = this.espaces.find(e => e.id === espaceId);
    return espace ? espace.name : 'Espace inconnu';
  }
}