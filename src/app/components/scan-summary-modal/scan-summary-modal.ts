import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PatientScheduleService } from '../../services/patient-schedule.service';
import { PatientSchedule, SPECIALTY_CATALOG } from '../../models/patient-schedule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-scan-summary-modal',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-amber-700 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <mat-icon class="text-[22px]">auto_mode</mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold">Escáner Automatizado de Recordatorios Clínicos</h2>
              <p class="text-xs text-amber-100">
                Identificación de pacientes en ventana de 7 días y 1 día (24h)
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          <!-- Banner explicativo del algoritmo -->
          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <mat-icon class="text-amber-600 text-[20px] shrink-0 mt-0.5">info</mat-icon>
            <div>
              <div class="font-bold text-xs">Criterios de Automatización Configurados:</div>
              <ul class="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-amber-800">
                <li><strong>Hito 7 Días Antes:</strong> Se dispara para citas agendadas entre 6 y 7 días a futuro. Enfatiza radicación de autorizaciones con la EPS y agendamiento de pre-anestesia.</li>
                <li><strong>Hito 1 Día Antes (24h):</strong> Se dispara para citas de mañana. Enfatiza ayuno estricto, no joyas, ropa cómoda, suspensión de medicamentos y confirmación con acompañante.</li>
              </ul>
            </div>
          </div>

          <!-- 1. Pacientes en Ventana de 1 Día (Inminentes) -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-rose-600 -ml-4"></span>
                <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Citas Mañana / Inminentes (Ventana 1 Día)
                </h3>
                <span class="px-2 py-0.2 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800">
                  {{ pending1DayList().length }} pendientes
                </span>
              </div>
            </div>

            @if (pending1DayList().length > 0) {
              <div class="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                @for (p of pending1DayList(); track p.id) {
                  @let meta = specialtyCatalog[p.especialidad];
                  <div class="p-3 bg-white flex flex-wrap items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900">{{ p.nombrePaciente }}</span>
                        <span class="font-mono text-slate-500 text-[10px]">({{ p.numeroIdentificacion }})</span>
                        <span class="px-1.5 py-0.2 rounded text-[10px] font-bold border" [class]="meta.badgeBg + ' ' + meta.badgeText + ' ' + meta.borderCol">
                          {{ meta.nombreCorto }}
                        </span>
                      </div>
                      <div class="text-[11px] text-slate-600 mt-0.5">
                        {{ p.procedimientoProgramado }} • <strong>Hora: {{ p.hora }}</strong>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        (click)="dispatchSingle(p, '1_dia', 'whatsapp')"
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                      >
                        <mat-icon class="text-[14px]">chat</mat-icon>
                        <span>WhatsApp (1d)</span>
                      </button>
                      <button
                        type="button"
                        (click)="dispatchSingle(p, '1_dia', 'email')"
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                      >
                        <mat-icon class="text-[14px]">mail</mat-icon>
                        <span>Correo</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-500 bg-slate-50">
                <mat-icon class="text-emerald-500 text-[24px]">verified</mat-icon>
                <p class="font-medium mt-1">Todos los recordatorios de 1 día están al día y notificados.</p>
              </div>
            }
          </div>

          <!-- 2. Pacientes en Ventana de 7 Días -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Citas en 7 Días (Requisitos & Auditoría)
                </h3>
                <span class="px-2 py-0.2 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800">
                  {{ pending7DaysList().length }} pendientes
                </span>
              </div>
            </div>

            @if (pending7DaysList().length > 0) {
              <div class="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                @for (p of pending7DaysList(); track p.id) {
                  @let meta = specialtyCatalog[p.especialidad];
                  <div class="p-3 bg-white flex flex-wrap items-center justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900">{{ p.nombrePaciente }}</span>
                        <span class="font-mono text-slate-500 text-[10px]">({{ p.numeroIdentificacion }})</span>
                        <span class="px-1.5 py-0.2 rounded text-[10px] font-bold border" [class]="meta.badgeBg + ' ' + meta.badgeText + ' ' + meta.borderCol">
                          {{ meta.nombreCorto }}
                        </span>
                      </div>
                      <div class="text-[11px] text-slate-600 mt-0.5">
                        {{ p.procedimientoProgramado }} • <strong>Fecha: {{ p.fecha }} ({{ p.hora }})</strong>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        (click)="dispatchSingle(p, '7_dias', 'whatsapp')"
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                      >
                        <mat-icon class="text-[14px]">chat</mat-icon>
                        <span>WhatsApp (7d)</span>
                      </button>
                      <button
                        type="button"
                        (click)="dispatchSingle(p, '7_dias', 'email')"
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                      >
                        <mat-icon class="text-[14px]">mail</mat-icon>
                        <span>Correo</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-500 bg-slate-50">
                <mat-icon class="text-emerald-500 text-[24px]">verified</mat-icon>
                <p class="font-medium mt-1">Todos los recordatorios de 7 días están tramitados.</p>
              </div>
            }
          </div>

          <!-- Banner de éxito tras disparo masivo -->
          @if (batchSuccess()) {
            <div class="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-center">
              ¡Disparo masivo de recordatorios ejecutado y registrado en el historial de cada paciente!
            </div>
          }

          <!-- Botones de Acción Global -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cerrar
            </button>

            @if (pending1DayList().length > 0 || pending7DaysList().length > 0) {
              <button
                type="button"
                (click)="dispatchBatch()"
                class="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
              >
                <mat-icon class="text-[18px]">send_and_archive</mat-icon>
                <span>Ejecutar Envío Masivo Automatizado ({{ totalPending() }})</span>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScanSummaryModal {
  private service = inject(PatientScheduleService);

  closeModal = output<void>();
  openReminder = output<{ patient: PatientSchedule; tipo: '7_dias' | '1_dia' }>();

  specialtyCatalog = SPECIALTY_CATALOG;
  batchSuccess = signal<boolean>(false);

  pending1DayList = () => {
    return this.service.patients().filter(
      (p) => (p.diasRestantes ?? 99) <= 1 && (p.diasRestantes ?? 99) >= 0 && !p.recordatorio1Dia.enviado
    );
  };

  pending7DaysList = () => {
    return this.service.patients().filter(
      (p) => (p.diasRestantes ?? 99) <= 7 && (p.diasRestantes ?? 99) >= 6 && !p.recordatorio7Dias.enviado
    );
  };

  totalPending = () => this.pending1DayList().length + this.pending7DaysList().length;

  dispatchSingle(patient: PatientSchedule, tipo: '7_dias' | '1_dia', canal: 'whatsapp' | 'email') {
    const text = canal === 'whatsapp'
      ? this.service.buildWhatsAppMessage(patient, tipo)
      : this.service.buildInstitutionalEmail(patient, tipo).body;

    if (canal === 'whatsapp') {
      const url = this.service.getWhatsAppUrl(patient.telefonoWhatsapp, text);
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }

    this.service.markReminderSent(patient.id, tipo, canal, text);
  }

  dispatchBatch() {
    // Process 1-day reminders
    for (const p of this.pending1DayList()) {
      const text = this.service.buildWhatsAppMessage(p, '1_dia');
      this.service.markReminderSent(p.id, '1_dia', 'ambos', text);
    }

    // Process 7-day reminders
    for (const p of this.pending7DaysList()) {
      const text = this.service.buildWhatsAppMessage(p, '7_dias');
      this.service.markReminderSent(p.id, '7_dias', 'ambos', text);
    }

    this.batchSuccess.set(true);
    setTimeout(() => {
      this.batchSuccess.set(false);
    }, 4000);
  }
}
