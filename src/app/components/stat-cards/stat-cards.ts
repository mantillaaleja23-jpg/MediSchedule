import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PatientScheduleService } from '../../services/patient-schedule.service';
import { SemaforoStatus } from '../../models/patient-schedule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-stat-cards',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <!-- Rojo: Inminentes (<= 1 día) -->
      <button
        type="button"
        (click)="setSemaforoFilter('rojo')"
        [class.ring-2]="currentSemaforo() === 'rojo'"
        [class.ring-rose-500]="currentSemaforo() === 'rojo'"
        class="text-left bg-white p-3.5 rounded-xl border border-rose-200/80 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all group relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-rose-600 -ml-4"></span>
            <span class="text-xs font-bold text-rose-700 uppercase tracking-wider">Inminente</span>
          </div>
          <mat-icon class="text-rose-500 text-[20px]">warning</mat-icon>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 leading-none">
          {{ metrics().inminentesRojo }}
        </div>
        <p class="text-[11px] font-medium text-slate-500 mt-1 truncate">
          Cita hoy o mañana (≤ 24-48h)
        </p>
      </button>

      <!-- Amarillo: Próximos (2 a 7 días) -->
      <button
        type="button"
        (click)="setSemaforoFilter('amarillo')"
        [class.ring-2]="currentSemaforo() === 'amarillo'"
        [class.ring-amber-500]="currentSemaforo() === 'amarillo'"
        class="text-left bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all group relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span class="text-xs font-bold text-amber-700 uppercase tracking-wider">Ventana 7D</span>
          </div>
          <mat-icon class="text-amber-500 text-[20px]">schedule</mat-icon>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 leading-none">
          {{ metrics().proximosAmarillo }}
        </div>
        <p class="text-[11px] font-medium text-slate-500 mt-1 truncate">
          2 a 7 días (Alerta trámite)
        </p>
      </button>

      <!-- Verde: A Tiempo (> 7 días) -->
      <button
        type="button"
        (click)="setSemaforoFilter('verde')"
        [class.ring-2]="currentSemaforo() === 'verde'"
        [class.ring-emerald-500]="currentSemaforo() === 'verde'"
        class="text-left bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all group relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">A Tiempo</span>
          </div>
          <mat-icon class="text-emerald-500 text-[20px]">check_circle</mat-icon>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 leading-none">
          {{ metrics().aTiempoVerde }}
        </div>
        <p class="text-[11px] font-medium text-slate-500 mt-1 truncate">
          Más de 7 días previstos
        </p>
      </button>

      <!-- Pendientes de Autorización EPS -->
      <button
        type="button"
        (click)="setChecklistFilter('sin_autorizacion')"
        [class.ring-2]="currentChecklistFilter() === 'sin_autorizacion'"
        [class.ring-orange-500]="currentChecklistFilter() === 'sin_autorizacion'"
        class="text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-sm transition-all group"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Falta EPS</span>
          <mat-icon class="text-orange-500 text-[20px]">assignment_late</mat-icon>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 leading-none">
          {{ metrics().pendientesAutorizacion }}
        </div>
        <p class="text-[11px] font-medium text-orange-600 mt-1 truncate">
          Autorización no aprobada
        </p>
      </button>

      <!-- Pendientes de Valoración Anestésica -->
      <button
        type="button"
        (click)="setChecklistFilter('sin_anestesia')"
        [class.ring-2]="currentChecklistFilter() === 'sin_anestesia'"
        [class.ring-indigo-500]="currentChecklistFilter() === 'sin_anestesia'"
        class="text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Preanestesia</span>
          <mat-icon class="text-indigo-500 text-[20px]">medical_services</mat-icon>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 leading-none">
          {{ metrics().pendientesAnestesia }}
        </div>
        <p class="text-[11px] font-medium text-indigo-600 mt-1 truncate">
          Pendiente valoración ASA
        </p>
      </button>

      <!-- Recordatorios Enviados Total -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">Envíos Total</span>
          <mat-icon class="text-teal-600 text-[20px]">send</mat-icon>
        </div>
        <div class="text-2xl font-extrabold text-slate-900 leading-none">
          {{ metrics().recordatoriosEnviadosTotal }}
        </div>
        <p class="text-[11px] font-medium text-teal-600 mt-1 truncate">
          Notificaciones generadas
        </p>
      </div>
    </div>
  `
})
export class StatCards {
  private service = inject(PatientScheduleService);

  metrics = this.service.metrics;
  currentSemaforo = this.service.selectedSemaforo;
  currentChecklistFilter = this.service.selectedChecklistFilter;

  setSemaforoFilter(status: SemaforoStatus) {
    if (this.currentSemaforo() === status) {
      this.service.selectedSemaforo.set('todos');
    } else {
      this.service.selectedSemaforo.set(status);
    }
  }

  setChecklistFilter(filter: 'sin_autorizacion' | 'sin_anestesia') {
    if (this.currentChecklistFilter() === filter) {
      this.service.selectedChecklistFilter.set('todos');
    } else {
      this.service.selectedChecklistFilter.set(filter);
    }
  }
}
