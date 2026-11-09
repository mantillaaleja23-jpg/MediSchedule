import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Header } from './components/header/header';
import { StatCards } from './components/stat-cards/stat-cards';
import { Filters } from './components/filters/filters';
import { ScheduleTable } from './components/schedule-table/schedule-table';
import { PatientFormModal } from './components/patient-form-modal/patient-form-modal';
import { ReminderModal } from './components/reminder-modal/reminder-modal';
import { ChecklistModal } from './components/checklist-modal/checklist-modal';
import { ScanSummaryModal } from './components/scan-summary-modal/scan-summary-modal';
import { PatientScheduleService } from './services/patient-schedule.service';
import { PatientSchedule, SPECIALTY_CATALOG, SpecialtyMeta } from './models/patient-schedule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    CommonModule,
    MatIconModule,
    Header,
    StatCards,
    Filters,
    ScheduleTable,
    PatientFormModal,
    ReminderModal,
    ChecklistModal,
    ScanSummaryModal
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private service = inject(PatientScheduleService);

  // Estados de Modales
  showPatientForm = signal<boolean>(false);
  editingPatient = signal<PatientSchedule | null>(null);

  showReminderModal = signal<boolean>(false);
  activeReminderPatient = signal<PatientSchedule | null>(null);
  activeReminderTipo = signal<'7_dias' | '1_dia'>('7_dias');

  showChecklistModal = signal<boolean>(false);
  activeChecklistPatient = signal<PatientSchedule | null>(null);

  showScanModal = signal<boolean>(false);

  // Active specialty helper banner
  selectedSpecialty = this.service.selectedSpecialty;
  specialtyCatalog = SPECIALTY_CATALOG;

  currentSelectedMeta = computed<SpecialtyMeta | null>(() => {
    const s = this.selectedSpecialty();
    if (s === 'todas') return null;
    return this.specialtyCatalog[s];
  });

  openNewPatientModal() {
    this.editingPatient.set(null);
    this.showPatientForm.set(true);
  }

  openEditPatientModal(patient: PatientSchedule) {
    this.editingPatient.set(patient);
    this.showPatientForm.set(true);
  }

  closePatientForm() {
    this.showPatientForm.set(false);
    this.editingPatient.set(null);
  }

  openReminder(data: { patient: PatientSchedule; tipo: '7_dias' | '1_dia' }) {
    this.activeReminderPatient.set(data.patient);
    this.activeReminderTipo.set(data.tipo);
    this.showReminderModal.set(true);
  }

  closeReminder() {
    this.showReminderModal.set(false);
    this.activeReminderPatient.set(null);
  }

  openChecklist(patient: PatientSchedule) {
    this.activeChecklistPatient.set(patient);
    this.showChecklistModal.set(true);
  }

  closeChecklist() {
    this.showChecklistModal.set(false);
    this.activeChecklistPatient.set(null);
  }

  openScan() {
    this.showScanModal.set(true);
  }

  closeScan() {
    this.showScanModal.set(false);
  }

  resetSeedData() {
    if (typeof window !== 'undefined') {
      const confirmReset = window.confirm(
        '¿Desea restaurar los datos iniciales de demostración con pacientes de todas las especialidades?'
      );
      if (confirmReset) {
        this.service.resetSeedData();
      }
    }
  }
}
