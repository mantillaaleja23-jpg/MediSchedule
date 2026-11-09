import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PatientScheduleService } from '../../services/patient-schedule.service';
import { Specialty, SPECIALTY_CATALOG } from '../../models/patient-schedule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-filters',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-3">
      <!-- Barra de Especialidades (Tabs Horizontales Estilo Clínico) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <!-- Tab Todas -->
        <button
          type="button"
          (click)="setSpecialty('todas')"
          [class.bg-slate-900]="selectedSpecialty() === 'todas'"
          [class.text-white]="selectedSpecialty() === 'todas'"
          [class.bg-white]="selectedSpecialty() !== 'todas'"
          [class.text-slate-700]="selectedSpecialty() !== 'todas'"
          [class.border-slate-300]="selectedSpecialty() !== 'todas'"
          class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-xs transition-colors"
        >
          <mat-icon class="text-[16px]">domain</mat-icon>
          <span>Todas las Especialidades</span>
          <span
            [class.bg-slate-800]="selectedSpecialty() === 'todas'"
            [class.text-slate-200]="selectedSpecialty() === 'todas'"
            [class.bg-slate-100]="selectedSpecialty() !== 'todas'"
            [class.text-slate-600]="selectedSpecialty() !== 'todas'"
            class="px-1.5 py-0.2 rounded-md text-[10px]"
          >
            {{ totalPatientsCount() }}
          </span>
        </button>

        <!-- Tabs de Especialidades individuales -->
        @for (spec of specialtyKeys; track spec) {
          @let meta = specialtyCatalog[spec];
          @let isSelected = selectedSpecialty() === spec;
          <button
            type="button"
            (click)="setSpecialty(spec)"
            [class.bg-teal-700]="isSelected && spec === 'radiologia_intervencionista'"
            [class.bg-purple-700]="isSelected && spec === 'neurointervencionismo'"
            [class.bg-sky-700]="isSelected && spec === 'neumologia'"
            [class.bg-amber-700]="isSelected && spec === 'dolor'"
            [class.bg-emerald-700]="isSelected && spec === 'cinedegluciones'"
            [class.text-white]="isSelected"
            [class.bg-white]="!isSelected"
            [class.text-slate-700]="!isSelected"
            [class.border-slate-300]="!isSelected"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-xs hover:border-slate-400 transition-colors"
          >
            <mat-icon class="text-[16px]">{{ meta.icono }}</mat-icon>
            <span>{{ meta.nombreCorto }}</span>
            <span
              [class.bg-white/20]="isSelected"
              [class.text-white]="isSelected"
              [class.bg-slate-100]="!isSelected"
              [class.text-slate-600]="!isSelected"
              class="px-1.5 py-0.2 rounded-md text-[10px]"
            >
              {{ countBySpecialty(spec) }}
            </span>
          </button>
        }
      </div>

      <!-- Barra de Búsqueda y Filtros Rápidos -->
      <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <!-- Input de búsqueda -->
        <div class="relative flex-1 min-w-[240px]">
          <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</mat-icon>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Buscar por paciente, cédula, EPS, diagnóstico o procedimiento..."
            class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 placeholder-slate-400 bg-slate-50/50"
          />
          @if (searchQuery()) {
            <button
              (click)="clearSearch()"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <mat-icon class="text-[16px]">close</mat-icon>
            </button>
          }
        </div>

        <!-- Filtros desplegables y controles -->
        <div class="flex items-center flex-wrap gap-2 text-xs">
          <!-- Filtro de Semáforo -->
          <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span class="text-slate-500 font-medium">Semáforo:</span>
            <select
              [value]="selectedSemaforo()"
              (change)="onSemaforoChange($event)"
              class="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="rojo">🔴 Inminente (≤ 1 día)</option>
              <option value="amarillo">🟡 Próximo (2 a 7 días)</option>
              <option value="verde">🟢 A tiempo (> 7 días)</option>
              <option value="completado">🔵 Realizado</option>
            </select>
          </div>

          <!-- Filtro de Fecha -->
          <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span class="text-slate-500 font-medium">Fecha:</span>
            <select
              [value]="selectedDateFilter()"
              (change)="onDateChange($event)"
              class="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todas las fechas</option>
              <option value="hoy">Hoy (30 Oct)</option>
              <option value="manana">Mañana (31 Oct)</option>
              <option value="proximos_7d">Próximos 7 días</option>
            </select>
          </div>

          <!-- Filtro de Requisitos / Checklist -->
          <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span class="text-slate-500 font-medium">Requisitos:</span>
            <select
              [value]="selectedChecklistFilter()"
              (change)="onChecklistChange($event)"
              class="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="sin_autorizacion">Falta Autorización EPS</option>
              <option value="sin_anestesia">Falta Valoración Anestesia</option>
              <option value="completos">Checklist 100% Completo</option>
            </select>
          </div>

          <!-- Filtro de Recordatorios -->
          <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span class="text-slate-500 font-medium">Recordatorios:</span>
            <select
              [value]="selectedReminderFilter()"
              (change)="onReminderChange($event)"
              class="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="pendiente_7d">Pendiente 7 Días</option>
              <option value="pendiente_1d">Pendiente 1 Día (Urgente)</option>
            </select>
          </div>

          <!-- Reset filtros si hay alguno activo -->
          @if (hasActiveFilters()) {
            <button
              (click)="resetFilters()"
              class="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium px-2 py-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <mat-icon class="text-[16px]">restart_alt</mat-icon>
              <span>Restablecer</span>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class Filters {
  private service = inject(PatientScheduleService);

  specialtyCatalog = SPECIALTY_CATALOG;
  specialtyKeys: Specialty[] = [
    'radiologia_intervencionista',
    'neurointervencionismo',
    'neumologia',
    'dolor',
    'cinedegluciones'
  ];

  selectedSpecialty = this.service.selectedSpecialty;
  selectedSemaforo = this.service.selectedSemaforo;
  selectedChecklistFilter = this.service.selectedChecklistFilter;
  selectedReminderFilter = this.service.selectedReminderFilter;
  searchQuery = this.service.searchQuery;
  selectedDateFilter = this.service.selectedDateFilter;

  totalPatientsCount = () => this.service.patients().length;

  countBySpecialty(spec: Specialty): number {
    return this.service.patients().filter((p) => p.especialidad === spec).length;
  }

  setSpecialty(spec: Specialty | 'todas') {
    this.service.selectedSpecialty.set(spec);
  }

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.service.searchQuery.set(val);
  }

  clearSearch() {
    this.service.searchQuery.set('');
  }

  onSemaforoChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'todos' | 'rojo' | 'amarillo' | 'verde' | 'completado';
    this.service.selectedSemaforo.set(val);
  }

  onDateChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'todos' | 'hoy' | 'manana' | 'proximos_7d';
    this.service.selectedDateFilter.set(val);
  }

  onChecklistChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'todos' | 'sin_autorizacion' | 'sin_anestesia' | 'completos';
    this.service.selectedChecklistFilter.set(val);
  }

  onReminderChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'todos' | 'pendiente_7d' | 'pendiente_1d';
    this.service.selectedReminderFilter.set(val);
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedSpecialty() !== 'todas' ||
      this.selectedSemaforo() !== 'todos' ||
      this.selectedChecklistFilter() !== 'todos' ||
      this.selectedReminderFilter() !== 'todos' ||
      this.selectedDateFilter() !== 'todos' ||
      !!this.searchQuery()
    );
  }

  resetFilters() {
    this.service.selectedSpecialty.set('todas');
    this.service.selectedSemaforo.set('todos');
    this.service.selectedChecklistFilter.set('todos');
    this.service.selectedReminderFilter.set('todos');
    this.service.selectedDateFilter.set('todos');
    this.service.searchQuery.set('');
  }
}
