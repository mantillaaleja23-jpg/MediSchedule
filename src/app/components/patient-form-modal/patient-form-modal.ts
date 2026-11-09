import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PatientScheduleService } from '../../services/patient-schedule.service';
import {
  PatientSchedule,
  Specialty,
  SPECIALTY_CATALOG,
  Procedencia,
  AutorizacionEstado,
  AnestesiaEstado
} from '../../models/patient-schedule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-patient-form-modal',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <mat-icon class="text-[20px]">
                {{ patientToEdit() ? 'edit_calendar' : 'add_circle' }}
              </mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold">
                {{ patientToEdit() ? 'Modificar Programación de Paciente' : 'Nueva Programación Quirúrgica / Intervencionista' }}
              </h2>
              <p class="text-xs text-teal-100">
                Plantilla estandarizada con checklist y semaforización clínica
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

        <!-- Form Body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          <!-- 1. Cita y Especialidad -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <mat-icon class="text-teal-600 text-[18px]">access_time</mat-icon>
              <span>1. Datos de Cita y Especialidad</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- Fecha -->
              <div>
                <label for="f-fecha" class="block font-semibold text-slate-700 mb-1">Fecha de la Cita *</label>
                <input
                  id="f-fecha"
                  type="date"
                  formControlName="fecha"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                />
              </div>

              <!-- Hora -->
              <div>
                <label for="f-hora" class="block font-semibold text-slate-700 mb-1">Hora de Citación *</label>
                <input
                  id="f-hora"
                  type="time"
                  formControlName="hora"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                />
              </div>

              <!-- Especialidad -->
              <div>
                <label for="f-especialidad" class="block font-semibold text-slate-700 mb-1">Especialidad *</label>
                <select
                  id="f-especialidad"
                  formControlName="especialidad"
                  (change)="onSpecialtyChange()"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                >
                  <option value="radiologia_intervencionista">Radiología Intervencionista</option>
                  <option value="neurointervencionismo">Neurointervencionismo</option>
                  <option value="neumologia">Neumología</option>
                  <option value="dolor">Clínica del Dolor</option>
                  <option value="cinedegluciones">Cinedegluciones</option>
                </select>
              </div>

              <!-- Sala / Quirófano -->
              <div>
                <label for="f-sala" class="block font-semibold text-slate-700 mb-1">Sala / Quirófano *</label>
                <input
                  id="f-sala"
                  type="text"
                  formControlName="sala"
                  placeholder="Ej: Sala 1 Hemodinamia"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          <!-- 2. Datos del Paciente (Identificación, Edad, EPS, Procedencia) -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <mat-icon class="text-teal-600 text-[18px]">person</mat-icon>
              <span>2. Identificación y Cobertura del Paciente</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- Nombre del Paciente -->
              <div class="sm:col-span-2">
                <label for="f-nombre" class="block font-semibold text-slate-700 mb-1">Nombre Completo del Paciente *</label>
                <input
                  id="f-nombre"
                  type="text"
                  formControlName="nombrePaciente"
                  placeholder="Ej: Juan Camilo Pérez Restrepo"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white font-medium"
                />
              </div>

              <!-- Número de Identificación -->
              <div>
                <label for="f-id" class="block font-semibold text-slate-700 mb-1">Número de Identificación *</label>
                <input
                  id="f-id"
                  type="text"
                  formControlName="numeroIdentificacion"
                  placeholder="Ej: DEMO-123"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white font-mono"
                />
              </div>

              <!-- Edad y Género -->
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label for="f-edad" class="block font-semibold text-slate-700 mb-1">Edad *</label>
                  <input
                    id="f-edad"
                    type="number"
                    formControlName="edad"
                    min="0"
                    max="120"
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label for="f-genero" class="block font-semibold text-slate-700 mb-1">Género</label>
                  <select
                    id="f-genero"
                    formControlName="genero"
                    class="w-full px-2 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <!-- EPS -->
              <div>
                <label for="f-eps" class="block font-semibold text-slate-700 mb-1">EPS / Asegurador *</label>
                <input
                  id="f-eps"
                  type="text"
                  formControlName="eps"
                  placeholder="Ej: Sura EPS, Sanitas, Nueva EPS..."
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                />
              </div>

              <!-- Procedencia -->
              <div>
                <label for="f-procedencia" class="block font-semibold text-slate-700 mb-1">Procedencia *</label>
                <select
                  id="f-procedencia"
                  formControlName="procedencia"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                >
                  <option value="Ambulatorio">Ambulatorio</option>
                  <option value="Hospitalización (Piso)">Hospitalización (Piso)</option>
                  <option value="Urgencias">Urgencias</option>
                  <option value="UCI">UCI</option>
                  <option value="Remitido Interinstitucional">Remitido Interinstitucional</option>
                </select>
              </div>

              <!-- Cama / Ubicación -->
              <div>
                <label for="f-cama" class="block font-semibold text-slate-700 mb-1">Cama / Habitación (Si aplica)</label>
                <input
                  id="f-cama"
                  type="text"
                  formControlName="camaUbicacion"
                  placeholder="Ej: Cama 402-A"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                />
              </div>

              <!-- Médico Especialista -->
              <div>
                <label for="f-medico" class="block font-semibold text-slate-700 mb-1">Médico Especialista</label>
                <input
                  id="f-medico"
                  type="text"
                  formControlName="medicoEspecialista"
                  placeholder="Ej: Dr. Alejandro Valencia"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                />
              </div>

              <!-- Contacto WhatsApp -->
              <div class="sm:col-span-2">
                <label for="f-whatsapp" class="block font-semibold text-slate-700 mb-1">Teléfono Móvil / WhatsApp *</label>
                <div class="relative">
                  <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 text-[18px]">chat</mat-icon>
                  <input
                    id="f-whatsapp"
                    type="text"
                    formControlName="telefonoWhatsapp"
                    placeholder="Ej: +570000000000"
                    class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                  />
                </div>
              </div>

              <!-- Correo Institucional -->
              <div class="sm:col-span-2">
                <label for="f-correo" class="block font-semibold text-slate-700 mb-1">Correo Institucional / Paciente *</label>
                <div class="relative">
                  <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 text-sky-600 text-[18px]">mail</mat-icon>
                  <input
                    id="f-correo"
                    type="email"
                    formControlName="correoInstitucional"
                    placeholder="Ej: paciente.demo@example.invalid"
                    class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Diagnóstico y Procedimiento Programado -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <mat-icon class="text-teal-600 text-[18px]">medical_services</mat-icon>
              <span>3. Diagnóstico y Procedimiento Quirúrgico</span>
            </h3>

            <div class="space-y-3">
              <!-- Diagnóstico -->
              <div>
                <label for="f-diagnostico" class="block font-semibold text-slate-700 mb-1">Diagnóstico (CIE-10 y descripción) *</label>
                <input
                  id="f-diagnostico"
                  type="text"
                  formControlName="diagnostico"
                  placeholder="Ej: I67.1 Aneurisma sacular no roto de arteria comunicante anterior"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                />
              </div>

              <!-- Procedimiento Programado -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label for="f-procedimiento" class="font-semibold text-slate-700">Procedimiento Programado *</label>
                  <span class="text-[10px] text-teal-700 font-medium">Sugerencias por especialidad abajo</span>
                </div>
                <input
                  id="f-procedimiento"
                  type="text"
                  formControlName="procedimientoProgramado"
                  placeholder="Ej: Embolización endovascular de aneurisma cerebral con espirales"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white font-medium"
                />

                <!-- Chips de procedimientos frecuentes -->
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span class="text-[10px] text-slate-400 self-center">Frecuentes:</span>
                  @for (proc of currentSpecialtyMeta.procedimientosComunes; track proc) {
                    <button
                      type="button"
                      (click)="setProcedure(proc)"
                      class="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-[10px] text-slate-600 transition-colors"
                    >
                      {{ proc }}
                    </button>
                  }
                </div>
              </div>

              <!-- Observaciones Específicas del Procedimiento -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label for="f-observaciones" class="font-semibold text-slate-700">Observaciones Específicas del Procedimiento *</label>
                  <button
                    type="button"
                    (click)="loadStandardRecommendations()"
                    class="text-[10px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                  >
                    <mat-icon class="text-[14px]">auto_fix_high</mat-icon>
                    <span>Cargar Recomendaciones Estándar de la Especialidad</span>
                  </button>
                </div>
                <textarea
                  id="f-observaciones"
                  formControlName="observacionesEspecificas"
                  rows="2"
                  placeholder="Detallar ayuno requerido, suspensión de anticoagulantes, acompañante, creatinina o preparación especial..."
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- 4. Checklist Clínico y Administrativo Inicial -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3" formGroupName="checklist">
            <h3 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <mat-icon class="text-teal-600 text-[18px]">fact_check</mat-icon>
              <span>4. Checklist Inicial de Requisitos y Anestesia</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- Autorización EPS -->
              <div>
                <label for="f-aut-eps" class="block font-semibold text-slate-700 mb-1">Autorización EPS</label>
                <select
                  id="f-aut-eps"
                  formControlName="autorizacionEps"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                >
                  <option value="aprobada">Aprobada</option>
                  <option value="en_tramite">En trámite</option>
                  <option value="glosada">Glosada / Rechazada</option>
                  <option value="particular">Particular (Sin EPS)</option>
                </select>
              </div>

              <!-- Nro de Autorización -->
              <div>
                <label for="f-aut-num" class="block font-semibold text-slate-700 mb-1">N° de Autorización</label>
                <input
                  id="f-aut-num"
                  type="text"
                  formControlName="numeroAutorizacion"
                  placeholder="Ej: AUT-998822"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                />
              </div>

              <!-- Valoración de Anestesia -->
              <div>
                <label for="f-anes-val" class="block font-semibold text-slate-700 mb-1">Valoración Anestesia</label>
                <select
                  id="f-anes-val"
                  formControlName="valoracionAnestesia"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                >
                  <option value="aprobada">Aprobada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="no_requiere">No requiere</option>
                </select>
              </div>

              <!-- Clasificación ASA -->
              <div>
                <label for="f-anes-asa" class="block font-semibold text-slate-700 mb-1">Riesgo Anestésico (ASA)</label>
                <select
                  id="f-anes-asa"
                  formControlName="clasificacionAsa"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-white"
                >
                  <option value="ASA I">ASA I (Sano)</option>
                  <option value="ASA II">ASA II (Leve)</option>
                  <option value="ASA III">ASA III (Moderado/Severo)</option>
                  <option value="ASA IV">ASA IV (Amenaza a la vida)</option>
                  <option value="No aplica">No aplica</option>
                </select>
              </div>
            </div>

            <!-- Checkboxes de verificación clínica -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
              <label class="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white transition-colors">
                <input type="checkbox" formControlName="laboratoriosAlDia" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <span class="text-slate-700 font-medium">Laboratorios al día</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white transition-colors">
                <input type="checkbox" formControlName="consentimientoFirmado" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <span class="text-slate-700 font-medium">Consentimiento firmado</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white transition-colors">
                <input type="checkbox" formControlName="ayunoVerificado" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <span class="text-slate-700 font-medium">Ayuno verificado</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white transition-colors">
                <input type="checkbox" formControlName="acompananteConfirmado" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <span class="text-slate-700 font-medium">Acompañante confirmado</span>
              </label>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
            >
              <mat-icon class="text-[18px]">save</mat-icon>
              <span>{{ patientToEdit() ? 'Guardar Cambios' : 'Agendar Programación' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PatientFormModal implements OnInit {
  private service = inject(PatientScheduleService);

  patientToEdit = input<PatientSchedule | null>(null);
  closeModal = output<void>();

  form = new FormGroup({
    fecha: new FormControl('2026-11-06', [Validators.required]),
    hora: new FormControl('08:00', [Validators.required]),
    nombrePaciente: new FormControl('', [Validators.required]),
    numeroIdentificacion: new FormControl('', [Validators.required]),
    edad: new FormControl<number>(50, [Validators.required, Validators.min(0)]),
    genero: new FormControl<'M' | 'F' | 'Otro'>('M'),
    eps: new FormControl('Sura EPS', [Validators.required]),
    procedencia: new FormControl<Procedencia>('Ambulatorio', [Validators.required]),
    camaUbicacion: new FormControl(''),
    especialidad: new FormControl<Specialty>('radiologia_intervencionista', [Validators.required]),
    diagnostico: new FormControl('', [Validators.required]),
    procedimientoProgramado: new FormControl('', [Validators.required]),
    observacionesEspecificas: new FormControl('', [Validators.required]),
    telefonoWhatsapp: new FormControl('+57', [Validators.required]),
    correoInstitucional: new FormControl('', [Validators.required, Validators.email]),
    sala: new FormControl('Sala de Procedimientos 1', [Validators.required]),
    medicoEspecialista: new FormControl('Dr. Especialista Tratante'),
    checklist: new FormGroup({
      autorizacionEps: new FormControl<AutorizacionEstado>('aprobada'),
      numeroAutorizacion: new FormControl(''),
      valoracionAnestesia: new FormControl<AnestesiaEstado>('aprobada'),
      clasificacionAsa: new FormControl<'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'No aplica'>('ASA II'),
      laboratoriosAlDia: new FormControl(true),
      consentimientoFirmado: new FormControl(false),
      ayunoVerificado: new FormControl(false),
      acompananteConfirmado: new FormControl(true)
    })
  });

  get currentSpecialty(): Specialty {
    return (this.form.get('especialidad')?.value as Specialty) || 'radiologia_intervencionista';
  }

  get currentSpecialtyMeta() {
    return SPECIALTY_CATALOG[this.currentSpecialty];
  }

  ngOnInit() {
    const existing = this.patientToEdit();
    if (existing) {
      this.form.patchValue({
        fecha: existing.fecha,
        hora: existing.hora,
        nombrePaciente: existing.nombrePaciente,
        numeroIdentificacion: existing.numeroIdentificacion,
        edad: existing.edad,
        genero: existing.genero,
        eps: existing.eps,
        procedencia: existing.procedencia,
        camaUbicacion: existing.camaUbicacion || '',
        especialidad: existing.especialidad,
        diagnostico: existing.diagnostico,
        procedimientoProgramado: existing.procedimientoProgramado,
        observacionesEspecificas: existing.observacionesEspecificas,
        telefonoWhatsapp: existing.telefonoWhatsapp,
        correoInstitucional: existing.correoInstitucional,
        sala: existing.sala,
        medicoEspecialista: existing.medicoEspecialista,
        checklist: {
          autorizacionEps: existing.checklist.autorizacionEps,
          numeroAutorizacion: existing.checklist.numeroAutorizacion || '',
          valoracionAnestesia: existing.checklist.valoracionAnestesia,
          clasificacionAsa: existing.checklist.clasificacionAsa || 'ASA II',
          laboratoriosAlDia: existing.checklist.laboratoriosAlDia,
          consentimientoFirmado: existing.checklist.consentimientoFirmado,
          ayunoVerificado: existing.checklist.ayunoVerificado,
          acompananteConfirmado: existing.checklist.acompananteConfirmado
        }
      });
    } else {
      this.loadStandardRecommendations();
    }
  }

  onSpecialtyChange() {
    if (!this.form.get('observacionesEspecificas')?.value) {
      this.loadStandardRecommendations();
    }
  }

  setProcedure(proc: string) {
    this.form.patchValue({ procedimientoProgramado: proc });
  }

  loadStandardRecommendations() {
    const meta = this.currentSpecialtyMeta;
    if (meta) {
      this.form.patchValue({
        observacionesEspecificas: meta.recomendacionesEstandar
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    const existing = this.patientToEdit();

    const chk = val.checklist;
    const autorizacionEps: AutorizacionEstado = (chk?.autorizacionEps ?? 'aprobada') as AutorizacionEstado;
    const valoracionAnestesia: AnestesiaEstado = (chk?.valoracionAnestesia ?? 'aprobada') as AnestesiaEstado;
    const clasificacionAsa = (chk?.clasificacionAsa ?? 'ASA II') as 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'No aplica';

    if (existing) {
      this.service.updatePatient(existing.id, {
        fecha: val.fecha!,
        hora: val.hora!,
        nombrePaciente: val.nombrePaciente!,
        numeroIdentificacion: val.numeroIdentificacion!,
        edad: Number(val.edad),
        genero: val.genero!,
        eps: val.eps!,
        procedencia: val.procedencia!,
        camaUbicacion: val.camaUbicacion || undefined,
        especialidad: val.especialidad!,
        diagnostico: val.diagnostico!,
        procedimientoProgramado: val.procedimientoProgramado!,
        observacionesEspecificas: val.observacionesEspecificas!,
        telefonoWhatsapp: val.telefonoWhatsapp!,
        correoInstitucional: val.correoInstitucional!,
        sala: val.sala!,
        medicoEspecialista: val.medicoEspecialista || 'Dr. Especialista',
        checklist: {
          autorizacionEps,
          numeroAutorizacion: chk?.numeroAutorizacion || undefined,
          valoracionAnestesia,
          clasificacionAsa,
          laboratoriosAlDia: !!chk?.laboratoriosAlDia,
          consentimientoFirmado: !!chk?.consentimientoFirmado,
          ayunoVerificado: !!chk?.ayunoVerificado,
          acompananteConfirmado: !!chk?.acompananteConfirmado
        }
      });
    } else {
      this.service.addPatient({
        fecha: val.fecha!,
        hora: val.hora!,
        nombrePaciente: val.nombrePaciente!,
        numeroIdentificacion: val.numeroIdentificacion!,
        edad: Number(val.edad),
        genero: val.genero!,
        eps: val.eps!,
        procedencia: val.procedencia!,
        camaUbicacion: val.camaUbicacion || undefined,
        especialidad: val.especialidad!,
        diagnostico: val.diagnostico!,
        procedimientoProgramado: val.procedimientoProgramado!,
        observacionesEspecificas: val.observacionesEspecificas!,
        telefonoWhatsapp: val.telefonoWhatsapp!,
        correoInstitucional: val.correoInstitucional!,
        sala: val.sala!,
        medicoEspecialista: val.medicoEspecialista || 'Dr. Especialista',
        estadoCita: 'programada',
        checklist: {
          autorizacionEps,
          numeroAutorizacion: chk?.numeroAutorizacion || undefined,
          valoracionAnestesia,
          clasificacionAsa,
          laboratoriosAlDia: !!chk?.laboratoriosAlDia,
          consentimientoFirmado: !!chk?.consentimientoFirmado,
          ayunoVerificado: !!chk?.ayunoVerificado,
          acompananteConfirmado: !!chk?.acompananteConfirmado
        },
        recordatorio7Dias: {
          enviado: false
        },
        recordatorio1Dia: {
          enviado: false
        }
      });
    }

    this.closeModal.emit();
  }
}
