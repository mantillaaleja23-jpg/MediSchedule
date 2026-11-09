import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PatientScheduleService } from '../../services/patient-schedule.service';
import { PatientSchedule, SPECIALTY_CATALOG } from '../../models/patient-schedule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-schedule-table',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <!-- Encabezado de la tabla y resumen de resultados -->
      <div class="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <mat-icon class="text-teal-700 text-[20px]">table_chart</mat-icon>
          <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Planilla Oficial de Programación Quirúrgica e Intervencionista
          </h2>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
            {{ patients().length }} pacientes programados
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Rojo: ≤ 1 día</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Amarillo: 2-7 días</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Verde: > 7 días</span>
          </span>
        </div>
      </div>

      <!-- Contenedor scrollable horizontal para la tabla de alta densidad clínica -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-100/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th scope="col" class="py-3 px-3 w-28">Hora / Fecha</th>
              <th scope="col" class="py-3 px-3 w-32">Semáforo</th>
              <th scope="col" class="py-3 px-3 min-w-[200px]">Paciente / Cédula / Edad</th>
              <th scope="col" class="py-3 px-3 min-w-[140px]">EPS & Procedencia</th>
              <th scope="col" class="py-3 px-3 min-w-[220px]">Procedimiento & Especialidad</th>
              <th scope="col" class="py-3 px-3 min-w-[190px]">Diagnóstico Clínico</th>
              <th scope="col" class="py-3 px-3 min-w-[220px]">Observaciones Específicas</th>
              <th scope="col" class="py-3 px-3 min-w-[220px]">Checklist (EPS / Anestesia)</th>
              <th scope="col" class="py-3 px-3 min-w-[160px]">Recordatorios</th>
              <th scope="col" class="py-3 px-3 w-36 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/80">
            @for (p of patients(); track p.id) {
              @let meta = specialtyCatalog[p.especialidad];
              <tr
                class="hover:bg-slate-50/80 transition-colors group"
                [class.bg-rose-50/20]="p.semaforo === 'rojo'"
                [class.bg-amber-50/15]="p.semaforo === 'amarillo'"
                [class.opacity-70]="p.semaforo === 'completado'"
              >
                <!-- 1. Hora / Fecha -->
                <td class="py-3 px-3 whitespace-nowrap">
                  <div class="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                    <mat-icon class="text-teal-600 text-[16px]">schedule</mat-icon>
                    {{ p.hora }}
                  </div>
                  <div class="text-[11px] font-medium text-slate-500 mt-0.5">
                    {{ p.fecha }}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5 truncate max-w-[110px]" title="{{ p.sala }}">
                    {{ p.sala }}
                  </div>
                </td>

                <!-- 2. Semáforo Status (Visual Badge) -->
                <td class="py-3 px-3">
                  @if (p.semaforo === 'rojo') {
                    <div class="inline-flex flex-col gap-0.5">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300">
                        <span class="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                        INMINENTE
                      </span>
                      <span class="text-[10px] font-semibold text-rose-700">
                        @if (p.diasRestantes === 0) {
                          ¡HOY!
                        } @else {
                          En {{ p.diasRestantes }} día
                        }
                      </span>
                    </div>
                  } @else if (p.semaforo === 'amarillo') {
                    <div class="inline-flex flex-col gap-0.5">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                        PRÓXIMO
                      </span>
                      <span class="text-[10px] font-semibold text-amber-700">
                        En {{ p.diasRestantes }} días
                      </span>
                    </div>
                  } @else if (p.semaforo === 'verde') {
                    <div class="inline-flex flex-col gap-0.5">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                        A TIEMPO
                      </span>
                      <span class="text-[10px] font-medium text-emerald-700">
                        En {{ p.diasRestantes }} días
                      </span>
                    </div>
                  } @else {
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-300">
                      <mat-icon class="text-[12px]">done_all</mat-icon>
                      REALIZADO
                    </span>
                  }
                </td>

                <!-- 3. Paciente / Cédula / Edad -->
                <td class="py-3 px-3">
                  <button
                    type="button"
                    class="font-bold text-slate-900 text-xs hover:text-teal-700 cursor-pointer text-left block"
                    (click)="editPatient.emit(p)"
                  >
                    {{ p.nombrePaciente }}
                  </button>
                  <div class="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px]">
                    <span class="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {{ p.numeroIdentificacion }}
                    </span>
                    <span>{{ p.edad }} años</span>
                    <span class="text-slate-400">({{ p.genero }})</span>
                  </div>
                  <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span class="truncate max-w-[140px]">{{ p.telefonoWhatsapp }}</span>
                  </div>
                </td>

                <!-- 4. EPS & Procedencia -->
                <td class="py-3 px-3">
                  <div class="font-semibold text-slate-800 flex items-center gap-1">
                    <mat-icon class="text-slate-400 text-[14px]">assured_workload</mat-icon>
                    <span>{{ p.eps }}</span>
                  </div>
                  <div class="mt-1">
                    <span
                      [class.bg-blue-50]="p.procedencia === 'Ambulatorio'"
                      [class.text-blue-700]="p.procedencia === 'Ambulatorio'"
                      [class.border-blue-200]="p.procedencia === 'Ambulatorio'"
                      [class.bg-amber-50]="p.procedencia.includes('Hospitalización')"
                      [class.text-amber-700]="p.procedencia.includes('Hospitalización')"
                      [class.border-amber-200]="p.procedencia.includes('Hospitalización')"
                      [class.bg-rose-50]="p.procedencia === 'Urgencias' || p.procedencia === 'UCI'"
                      [class.text-rose-700]="p.procedencia === 'Urgencias' || p.procedencia === 'UCI'"
                      [class.border-rose-200]="p.procedencia === 'Urgencias' || p.procedencia === 'UCI'"
                      class="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded border"
                    >
                      {{ p.procedencia }}
                    </span>
                    @if (p.camaUbicacion) {
                      <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                        {{ p.camaUbicacion }}
                      </div>
                    }
                  </div>
                </td>

                <!-- 5. Procedimiento & Especialidad -->
                <td class="py-3 px-3">
                  <div class="mb-1">
                    <span
                      class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold border"
                      [class]="meta.badgeBg + ' ' + meta.badgeText + ' ' + meta.borderCol"
                    >
                      <mat-icon class="text-[12px]">{{ meta.icono }}</mat-icon>
                      {{ meta.nombreCorto }}
                    </span>
                  </div>
                  <div class="font-semibold text-slate-900 leading-snug">
                    {{ p.procedimientoProgramado }}
                  </div>
                  <div class="text-[10px] text-slate-500 mt-0.5">
                    {{ p.medicoEspecialista }}
                  </div>
                </td>

                <!-- 6. Diagnóstico Clínico -->
                <td class="py-3 px-3">
                  <div class="text-slate-700 line-clamp-3 leading-snug" title="{{ p.diagnostico }}">
                    {{ p.diagnostico }}
                  </div>
                </td>

                <!-- 7. Observaciones Específicas del Procedimiento -->
                <td class="py-3 px-3">
                  <div class="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 leading-snug text-[11px] line-clamp-3 hover:line-clamp-none transition-all">
                    <span class="font-semibold text-slate-900 block mb-0.5">Indicaciones:</span>
                    {{ p.observacionesEspecificas || 'Sin observaciones adicionales registradas.' }}
                  </div>
                </td>

                <!-- 8. Checklist Clínico (EPS, Anestesia, Labs, Ayuno) -->
                <td class="py-3 px-3">
                  <div class="space-y-1">
                    <!-- Autorización EPS -->
                    <div class="flex items-center justify-between gap-1 text-[10px]">
                      <span class="text-slate-500 font-medium">EPS:</span>
                      @if (p.checklist.autorizacionEps === 'aprobada') {
                        <span class="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200" title="{{ p.checklist.numeroAutorizacion }}">
                          <mat-icon class="text-[12px]">check</mat-icon>
                          Aprobada ({{ p.checklist.numeroAutorizacion || 'OK' }})
                        </span>
                      } @else if (p.checklist.autorizacionEps === 'particular') {
                        <span class="text-slate-600 bg-slate-100 px-1 py-0.2 rounded border font-medium">Particular</span>
                      } @else {
                        <span class="inline-flex items-center gap-0.5 text-rose-700 font-bold bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                          <mat-icon class="text-[12px]">priority_high</mat-icon>
                          {{ p.checklist.autorizacionEps === 'glosada' ? 'Glosada' : 'En Trámite' }}
                        </span>
                      }
                    </div>

                    <!-- Valoración Anestesia -->
                    <div class="flex items-center justify-between gap-1 text-[10px]">
                      <span class="text-slate-500 font-medium">Anestesia:</span>
                      @if (p.checklist.valoracionAnestesia === 'aprobada') {
                        <span class="text-indigo-700 font-bold bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">
                          {{ p.checklist.clasificacionAsa || 'Aprobada' }}
                        </span>
                      } @else if (p.checklist.valoracionAnestesia === 'no_requiere') {
                        <span class="text-slate-500 bg-slate-100 px-1 py-0.2 rounded">No requiere</span>
                      } @else {
                        <span class="text-amber-800 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-300">
                          Pendiente
                        </span>
                      }
                    </div>

                    <!-- Botón para auditar checklist -->
                    <button
                      type="button"
                      (click)="openChecklist.emit(p)"
                      class="w-full mt-1 text-center py-0.5 text-[10px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded transition-colors"
                    >
                      Auditar Checklist Completo
                    </button>
                  </div>
                </td>

                <!-- 9. Recordatorios (7d y 1d) -->
                <td class="py-3 px-3">
                  <div class="space-y-1 text-[10px]">
                    <!-- Hito 7 días -->
                    <div class="flex items-center justify-between gap-1">
                      <span class="font-medium text-slate-500">7 Días:</span>
                      @if (p.recordatorio7Dias.enviado) {
                        <span class="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                          <mat-icon class="text-[12px]">done</mat-icon>
                          Enviado
                        </span>
                      } @else {
                        <button
                          type="button"
                          (click)="openReminderModal.emit({ patient: p, tipo: '7_dias' })"
                          class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold border border-amber-200 transition-colors"
                        >
                          <mat-icon class="text-[12px]">send</mat-icon>
                          Enviar
                        </button>
                      }
                    </div>

                    <!-- Hito 1 día -->
                    <div class="flex items-center justify-between gap-1">
                      <span class="font-medium text-slate-500">1 Día (24h):</span>
                      @if (p.recordatorio1Dia.enviado) {
                        <span class="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                          <mat-icon class="text-[12px]">done_all</mat-icon>
                          Enviado
                        </span>
                      } @else {
                        <button
                          type="button"
                          (click)="openReminderModal.emit({ patient: p, tipo: '1_dia' })"
                          [class.animate-bounce]="p.diasRestantes !== undefined && p.diasRestantes <= 1"
                          class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold border border-rose-300 transition-colors"
                        >
                          <mat-icon class="text-[12px]">notification_important</mat-icon>
                          Disparar
                        </button>
                      }
                    </div>
                  </div>
                </td>

                <!-- 10. Acciones Rápidas -->
                <td class="py-3 px-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <!-- WhatsApp Direct -->
                    <button
                      type="button"
                      (click)="openReminderModal.emit({ patient: p, tipo: (p.diasRestantes !== undefined && p.diasRestantes <= 1) ? '1_dia' : '7_dias' })"
                      class="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                      title="Enviar recordatorio vía WhatsApp"
                    >
                      <mat-icon class="text-[16px]">chat</mat-icon>
                    </button>

                    <!-- Correo Direct -->
                    <button
                      type="button"
                      (click)="openEmailPreview(p)"
                      class="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors border border-sky-200"
                      title="Enviar citación por Correo Institucional"
                    >
                      <mat-icon class="text-[16px]">mail</mat-icon>
                    </button>

                    <!-- Editar -->
                    <button
                      type="button"
                      (click)="editPatient.emit(p)"
                      class="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Modificar datos de la programación"
                    >
                      <mat-icon class="text-[16px]">edit</mat-icon>
                    </button>

                    <!-- Marcar Realizado o Cancelar -->
                    <button
                      type="button"
                      (click)="toggleCompletado(p)"
                      class="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                      [title]="p.estadoCita === 'realizada' ? 'Revertir a programado' : 'Marcar como procedimiento realizado'"
                    >
                      <mat-icon class="text-[16px]">
                        {{ p.estadoCita === 'realizada' ? 'undo' : 'check_circle' }}
                      </mat-icon>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="10" class="py-12 text-center text-slate-500">
                  <mat-icon class="text-slate-300 text-4xl mb-2">event_busy</mat-icon>
                  <p class="font-bold text-slate-700 text-sm">No se encontraron pacientes con los filtros seleccionados</p>
                  <p class="text-xs text-slate-400 mt-1">Pruebe ajustando la búsqueda o seleccionando "Todas las Especialidades".</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ScheduleTable {
  private service = inject(PatientScheduleService);

  patients = this.service.filteredPatients;
  specialtyCatalog = SPECIALTY_CATALOG;

  editPatient = output<PatientSchedule>();
  openChecklist = output<PatientSchedule>();
  openReminderModal = output<{ patient: PatientSchedule; tipo: '7_dias' | '1_dia' }>();

  openEmailPreview(patient: PatientSchedule) {
    const tipo = (patient.diasRestantes !== undefined && patient.diasRestantes <= 1) ? '1_dia' : '7_dias';
    this.openReminderModal.emit({ patient, tipo });
  }

  toggleCompletado(patient: PatientSchedule) {
    const nextState = patient.estadoCita === 'realizada' ? 'programada' : 'realizada';
    this.service.updatePatient(patient.id, { estadoCita: nextState });
  }
}
