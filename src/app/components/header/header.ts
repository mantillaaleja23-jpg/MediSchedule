import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PatientScheduleService } from '../../services/patient-schedule.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-header',
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-4">
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-100 shrink-0">
              <mat-icon class="text-[22px]">calendar_month</mat-icon>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-bold text-slate-900 tracking-tight truncate">MediSchedule Pro</h1>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  Intervencionismo & Cirugía
                </span>
              </div>
              <p class="text-xs text-slate-500 truncate hidden sm:block">
                Semaforización de Citas • Recordatorios WhatsApp & Correo (7d y 1d) • Checklist Clínico
              </p>
            </div>
          </div>

          <!-- Live Clinical Date Reference & Actions -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <!-- Reference Date Badge -->
            <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <mat-icon class="text-slate-500 text-[18px]">today</mat-icon>
              <span>Fecha del Sistema: <strong>30 Oct 2026</strong></span>
            </div>

            <!-- Botón Escanear Recordatorios -->
            <button
              (click)="openScanModal.emit()"
              class="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Escanear y disparar recordatorios de 7 días y 1 día"
            >
              <mat-icon class="text-amber-600 text-[18px]">notifications_active</mat-icon>
              <span class="hidden sm:inline">Escanear Recordatorios</span>
              @if (pendingRemindersTotal() > 0) {
                <span class="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-rose-600 rounded-full animate-pulse">
                  {{ pendingRemindersTotal() }}
                </span>
              }
            </button>

            <!-- Exportar CSV -->
            <button
              (click)="exportCsv()"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
              title="Descargar plantilla de programación en formato CSV"
            >
              <mat-icon class="text-slate-600 text-[18px]">download</mat-icon>
              <span>Exportar</span>
            </button>

            <!-- Imprimir -->
            <button
              (click)="printSchedule()"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
              title="Imprimir plantilla quirúrgica oficial"
            >
              <mat-icon class="text-slate-600 text-[18px]">print</mat-icon>
              <span>Imprimir</span>
            </button>

            <!-- Nueva Programación -->
            <button
              (click)="openNewPatientModal.emit()"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <mat-icon class="text-[18px]">person_add</mat-icon>
              <span>Programar Paciente</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class Header {
  private service = inject(PatientScheduleService);

  openNewPatientModal = output<void>();
  openScanModal = output<void>();

  pendingRemindersTotal = () => {
    const m = this.service.metrics();
    return m.pendientesRecordatorio7d + m.pendientesRecordatorio1d;
  };

  exportCsv() {
    this.service.exportToCsv();
  }

  printSchedule() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
