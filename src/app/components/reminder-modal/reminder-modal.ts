import { ChangeDetectionStrategy, Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PatientScheduleService } from '../../services/patient-schedule.service';
import { PatientSchedule, SPECIALTY_CATALOG } from '../../models/patient-schedule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reminder-modal',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <mat-icon class="text-[22px]">outgoing_mail</mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold flex items-center gap-2">
                <span>Centro de Recordatorios Automatizados</span>
                @if (tipo() === '7_dias') {
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    7 DÍAS ANTES
                  </span>
                } @else {
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                    1 DÍA ANTES (INMEDIATO)
                  </span>
                }
              </h2>
              <p class="text-xs text-slate-400">
                Notificación a {{ patient().nombrePaciente }} ({{ patient().numeroIdentificacion }})
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="p-6 space-y-5 text-xs">
          <!-- Selector de Tipo de Recordatorio y Canal -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Selector de Hito Temporal -->
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span class="block font-bold text-slate-700 mb-2">Hito del Recordatorio:</span>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="setTipo('7_dias')"
                  [class.bg-amber-100]="tipo() === '7_dias'"
                  [class.text-amber-900]="tipo() === '7_dias'"
                  [class.border-amber-400]="tipo() === '7_dias'"
                  [class.bg-white]="tipo() !== '7_dias'"
                  [class.text-slate-700]="tipo() !== '7_dias'"
                  class="p-2 rounded-lg border font-bold text-xs flex flex-col items-center justify-center text-center transition-all"
                >
                  <mat-icon class="text-amber-600 text-[18px]">event_repeat</mat-icon>
                  <span class="mt-0.5">7 Días Antes</span>
                  <span class="text-[9px] font-normal text-slate-500">Requisitos y Preanestesia</span>
                </button>

                <button
                  type="button"
                  (click)="setTipo('1_dia')"
                  [class.bg-rose-100]="tipo() === '1_dia'"
                  [class.text-rose-900]="tipo() === '1_dia'"
                  [class.border-rose-400]="tipo() === '1_dia'"
                  [class.bg-white]="tipo() !== '1_dia'"
                  [class.text-slate-700]="tipo() !== '1_dia'"
                  class="p-2 rounded-lg border font-bold text-xs flex flex-col items-center justify-center text-center transition-all"
                >
                  <mat-icon class="text-rose-600 text-[18px]">alarm_on</mat-icon>
                  <span class="mt-0.5">1 Día Antes</span>
                  <span class="text-[9px] font-normal text-slate-500">Ayuno y Horas Inmediatas</span>
                </button>
              </div>
            </div>

            <!-- Selector de Canal -->
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span class="block font-bold text-slate-700 mb-2">Canal de Notificación:</span>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="setChannel('whatsapp')"
                  [class.bg-emerald-600]="channel() === 'whatsapp'"
                  [class.text-white]="channel() === 'whatsapp'"
                  [class.border-emerald-700]="channel() === 'whatsapp'"
                  [class.bg-white]="channel() !== 'whatsapp'"
                  [class.text-slate-700]="channel() !== 'whatsapp'"
                  class="p-2 rounded-lg border font-bold text-xs flex flex-col items-center justify-center text-center transition-all"
                >
                  <mat-icon class="text-[18px]">chat</mat-icon>
                  <span class="mt-0.5">WhatsApp Móvil</span>
                  <span class="text-[9px] opacity-80">{{ patient().telefonoWhatsapp }}</span>
                </button>

                <button
                  type="button"
                  (click)="setChannel('email')"
                  [class.bg-sky-600]="channel() === 'email'"
                  [class.text-white]="channel() === 'email'"
                  [class.border-sky-700]="channel() === 'email'"
                  [class.bg-white]="channel() !== 'email'"
                  [class.text-slate-700]="channel() !== 'email'"
                  class="p-2 rounded-lg border font-bold text-xs flex flex-col items-center justify-center text-center transition-all"
                >
                  <mat-icon class="text-[18px]">mail</mat-icon>
                  <span class="mt-0.5">Correo Institucional</span>
                  <span class="text-[9px] opacity-80 truncate max-w-[120px]">{{ patient().correoInstitucional }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Resumen Clínico del Procedimiento -->
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400">Procedimiento:</span>
              <div class="font-bold text-slate-900 text-xs">{{ patient().procedimientoProgramado }}</div>
              <div class="text-[11px] text-teal-700 font-medium">{{ specialtyInfo.nombre }} • {{ patient().fecha }} a las {{ patient().hora }}</div>
            </div>
            <div class="flex items-center gap-1.5">
              @if (patient().checklist.autorizacionEps === 'aprobada') {
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  EPS Autorizada
                </span>
              } @else {
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                  Falta EPS
                </span>
              }
              @if (patient().checklist.valoracionAnestesia === 'aprobada') {
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  {{ patient().checklist.clasificacionAsa || 'Anestesia OK' }}
                </span>
              }
            </div>
          </div>

          <!-- Previsualización del Mensaje -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="reminder-msg-textarea" class="font-bold text-slate-800 flex items-center gap-1.5">
                <mat-icon class="text-teal-600 text-[18px]">preview</mat-icon>
                <span>Vista Previa del Mensaje Oficial</span>
              </label>

              <!-- Botón Generar / Mejorar con IA -->
              <button
                type="button"
                (click)="generateWithAi()"
                [disabled]="isAiLoading()"
                class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors disabled:opacity-50"
              >
                <mat-icon class="text-[15px]" [class.animate-spin]="isAiLoading()">auto_awesome</mat-icon>
                <span>{{ isAiLoading() ? 'Optimizando con IA...' : '✨ Personalizar con IA Clínica' }}</span>
              </button>
            </div>

            <!-- Caja de texto editable del mensaje -->
            <div class="relative">
              <textarea
                id="reminder-msg-textarea"
                [value]="messageText()"
                (input)="onTextEdit($event)"
                rows="10"
                class="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-slate-900/5 leading-relaxed"
              ></textarea>
            </div>
          </div>

          <!-- Feedback de Copiado -->
          @if (copied()) {
            <div class="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-center font-bold text-xs animate-in fade-in">
              ¡Texto copiado al portapapeles con éxito!
            </div>
          }

          <!-- Botones de Acción de Envío -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <!-- Botón copiar -->
            <button
              type="button"
              (click)="copyToClipboard()"
              class="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              <mat-icon class="text-[16px]">content_copy</mat-icon>
              <span>Copiar Texto</span>
            </button>

            <div class="flex items-center gap-2">
              <!-- Si es WhatsApp: Abrir enlace directo -->
              @if (channel() === 'whatsapp') {
                <button
                  type="button"
                  (click)="openWhatsApp()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <mat-icon class="text-[18px]">open_in_new</mat-icon>
                  <span>Abrir en WhatsApp</span>
                </button>
              } @else {
                <!-- Si es Correo: Abrir cliente de correo -->
                <button
                  type="button"
                  (click)="openEmailClient()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <mat-icon class="text-[18px]">email</mat-icon>
                  <span>Abrir Cliente de Correo</span>
                </button>
              }

              <!-- Marcar como Enviado -->
              <button
                type="button"
                (click)="markAsSent()"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <mat-icon class="text-[18px]">check_circle</mat-icon>
                <span>Registrar Envío Institucional</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReminderModal implements OnInit {
  private service = inject(PatientScheduleService);

  patient = input.required<PatientSchedule>();
  initialTipo = input<'7_dias' | '1_dia'>('7_dias');
  closeModal = output<void>();

  tipo = signal<'7_dias' | '1_dia'>('7_dias');
  channel = signal<'whatsapp' | 'email'>('whatsapp');
  messageText = signal<string>('');
  copied = signal<boolean>(false);
  isAiLoading = signal<boolean>(false);

  get specialtyInfo() {
    return SPECIALTY_CATALOG[this.patient().especialidad];
  }

  ngOnInit() {
    this.tipo.set(this.initialTipo());
    this.updateMessage();
  }

  setTipo(t: '7_dias' | '1_dia') {
    this.tipo.set(t);
    this.updateMessage();
  }

  setChannel(c: 'whatsapp' | 'email') {
    this.channel.set(c);
    this.updateMessage();
  }

  updateMessage() {
    const p = this.patient();
    const t = this.tipo();
    const c = this.channel();

    if (c === 'whatsapp') {
      this.messageText.set(this.service.buildWhatsAppMessage(p, t));
    } else {
      this.messageText.set(this.service.buildInstitutionalEmail(p, t).body);
    }
  }

  onTextEdit(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.messageText.set(val);
  }

  async generateWithAi() {
    this.isAiLoading.set(true);
    try {
      const text = await this.service.generateAiReminder(this.patient(), this.tipo(), this.channel());
      this.messageText.set(text);
    } finally {
      this.isAiLoading.set(false);
    }
  }

  copyToClipboard() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.messageText());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 3000);
    }
  }

  openWhatsApp() {
    const url = this.service.getWhatsAppUrl(this.patient().telefonoWhatsapp, this.messageText());
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
    this.markAsSent();
  }

  openEmailClient() {
    const p = this.patient();
    const { subject } = this.service.buildInstitutionalEmail(p, this.tipo());
    const mailto = `mailto:${encodeURIComponent(p.correoInstitucional)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(this.messageText())}`;
    if (typeof window !== 'undefined') {
      window.location.href = mailto;
    }
    this.markAsSent();
  }

  markAsSent() {
    this.service.markReminderSent(
      this.patient().id,
      this.tipo(),
      this.channel(),
      this.messageText()
    );
    this.closeModal.emit();
  }
}
