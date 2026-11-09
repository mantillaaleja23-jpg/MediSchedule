import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PatientScheduleService } from '../../services/patient-schedule.service';
import { PatientSchedule, AutorizacionEstado, AnestesiaEstado } from '../../models/patient-schedule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-checklist-modal',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <mat-icon class="text-[20px]">fact_check</mat-icon>
            </div>
            <div>
              <h2 class="text-base font-bold">Auditoría de Checklist y Requisitos Clínicos</h2>
              <p class="text-xs text-teal-200">
                {{ patient().nombrePaciente }} ({{ patient().numeroIdentificacion }})
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

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4 text-xs">
          <!-- Datos Clave del Procedimiento -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase">Procedimiento Programado</span>
              <div class="font-bold text-slate-900 text-xs">{{ patient().procedimientoProgramado }}</div>
              <div class="text-[11px] text-slate-500">{{ patient().fecha }} a las {{ patient().hora }} • {{ patient().eps }}</div>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Procedencia</span>
              <div class="font-semibold text-slate-800">{{ patient().procedencia }}</div>
            </div>
          </div>

          <!-- 1. Autorización EPS -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <div class="flex items-center justify-between">
              <div class="font-bold text-slate-800 flex items-center gap-1.5">
                <mat-icon class="text-teal-600 text-[18px]">verified_user</mat-icon>
                <span>1. Estado de Autorización de la EPS ({{ patient().eps }})</span>
              </div>
              <button
                type="button"
                (click)="quickApproveEps()"
                class="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
              >
                Aprobar Inmediato
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="chk-eps-estado" class="block font-medium text-slate-600 mb-1">Estado</label>
                <select
                  id="chk-eps-estado"
                  formControlName="autorizacionEps"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-slate-50/50"
                >
                  <option value="aprobada">Aprobada</option>
                  <option value="en_tramite">En trámite</option>
                  <option value="glosada">Glosada / Rechazada</option>
                  <option value="particular">Particular</option>
                </select>
              </div>

              <div>
                <label for="chk-eps-num" class="block font-medium text-slate-600 mb-1">N° de Autorización Radicado</label>
                <input
                  id="chk-eps-num"
                  type="text"
                  formControlName="numeroAutorizacion"
                  placeholder="Ej: AUT-2026-991823"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-slate-50/50 font-mono"
                />
              </div>
            </div>
          </div>

          <!-- 2. Valoración de Anestesia -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
            <div class="flex items-center justify-between">
              <div class="font-bold text-slate-800 flex items-center gap-1.5">
                <mat-icon class="text-indigo-600 text-[18px]">medical_services</mat-icon>
                <span>2. Valoración Pre-Anestésica</span>
              </div>
              <button
                type="button"
                (click)="quickApproveAnesthesia()"
                class="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
              >
                Marcar Aprobada (ASA II)
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="chk-anes-estado" class="block font-medium text-slate-600 mb-1">Estado de Valoración</label>
                <select
                  id="chk-anes-estado"
                  formControlName="valoracionAnestesia"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-slate-50/50"
                >
                  <option value="aprobada">Aprobada</option>
                  <option value="pendiente">Pendiente por realizar</option>
                  <option value="no_requiere">No requiere valoración anestésica</option>
                </select>
              </div>

              <div>
                <label for="chk-anes-asa" class="block font-medium text-slate-600 mb-1">Clasificación de Riesgo ASA</label>
                <select
                  id="chk-anes-asa"
                  formControlName="clasificacionAsa"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 bg-slate-50/50"
                >
                  <option value="ASA I">ASA I - Paciente sano</option>
                  <option value="ASA II">ASA II - Enfermedad sistémica leve</option>
                  <option value="ASA III">ASA III - Enfermedad sistémica severa</option>
                  <option value="ASA IV">ASA IV - Enfermedad severa con amenaza vital</option>
                  <option value="No aplica">No aplica</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 3. Controles Quirúrgicos y de Seguridad -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <mat-icon class="text-teal-600 text-[18px]">checklist_rtl</mat-icon>
              <span>3. Criterios de Seguridad y Preparación del Paciente</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input type="checkbox" formControlName="laboratoriosAlDia" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <div>
                  <div class="font-bold text-slate-800">Laboratorios al día</div>
                  <div class="text-[10px] text-slate-500">Creatinina, TP, TPT y plaquetas revisados</div>
                </div>
              </label>

              <label class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input type="checkbox" formControlName="consentimientoFirmado" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <div>
                  <div class="font-bold text-slate-800">Consentimiento informado</div>
                  <div class="text-[10px] text-slate-500">Firma física o digital del paciente/familiar</div>
                </div>
              </label>

              <label class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input type="checkbox" formControlName="ayunoVerificado" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <div>
                  <div class="font-bold text-slate-800">Ayuno verificado</div>
                  <div class="text-[10px] text-slate-500">Cumplimiento estricto de horas requeridas</div>
                </div>
              </label>

              <label class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input type="checkbox" formControlName="acompananteConfirmado" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <div>
                  <div class="font-bold text-slate-800">Acompañante adulto</div>
                  <div class="text-[10px] text-slate-500">Adulto responsable confirmado para egreso</div>
                </div>
              </label>

              <label class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors sm:col-span-2">
                <input type="checkbox" formControlName="reservaCamaUci" class="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" />
                <div>
                  <div class="font-bold text-slate-800">Reserva de Cama en UCI / Cuidado Intermedio</div>
                  <div class="text-[10px] text-slate-500">Requerido en neurointervencionismo o alta complejidad</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
            >
              <mat-icon class="text-[18px]">save</mat-icon>
              <span>Actualizar Checklist Clínico</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChecklistModal implements OnInit {
  private service = inject(PatientScheduleService);

  patient = input.required<PatientSchedule>();
  closeModal = output<void>();

  form = new FormGroup({
    autorizacionEps: new FormControl<AutorizacionEstado>('aprobada'),
    numeroAutorizacion: new FormControl(''),
    valoracionAnestesia: new FormControl<AnestesiaEstado>('aprobada'),
    clasificacionAsa: new FormControl<'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'No aplica'>('ASA II'),
    laboratoriosAlDia: new FormControl(true),
    consentimientoFirmado: new FormControl(false),
    ayunoVerificado: new FormControl(false),
    acompananteConfirmado: new FormControl(true),
    reservaCamaUci: new FormControl(false)
  });

  ngOnInit() {
    const cl = this.patient().checklist;
    this.form.patchValue({
      autorizacionEps: cl.autorizacionEps,
      numeroAutorizacion: cl.numeroAutorizacion || '',
      valoracionAnestesia: cl.valoracionAnestesia,
      clasificacionAsa: cl.clasificacionAsa || 'ASA II',
      laboratoriosAlDia: cl.laboratoriosAlDia,
      consentimientoFirmado: cl.consentimientoFirmado,
      ayunoVerificado: cl.ayunoVerificado,
      acompananteConfirmado: cl.acompananteConfirmado,
      reservaCamaUci: !!cl.reservaCamaUci
    });
  }

  quickApproveEps() {
    this.form.patchValue({
      autorizacionEps: 'aprobada',
      numeroAutorizacion: `AUT-VALID-${Math.floor(100000 + Math.random() * 900000)}`
    });
  }

  quickApproveAnesthesia() {
    this.form.patchValue({
      valoracionAnestesia: 'aprobada',
      clasificacionAsa: 'ASA II'
    });
  }

  onSubmit() {
    const val = this.form.getRawValue();
    this.service.updateChecklist(this.patient().id, {
      autorizacionEps: (val.autorizacionEps ?? 'aprobada') as AutorizacionEstado,
      numeroAutorizacion: val.numeroAutorizacion || undefined,
      valoracionAnestesia: (val.valoracionAnestesia ?? 'aprobada') as AnestesiaEstado,
      clasificacionAsa: (val.clasificacionAsa ?? 'ASA II') as 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'No aplica',
      laboratoriosAlDia: !!val.laboratoriosAlDia,
      consentimientoFirmado: !!val.consentimientoFirmado,
      ayunoVerificado: !!val.ayunoVerificado,
      acompananteConfirmado: !!val.acompananteConfirmado,
      reservaCamaUci: !!val.reservaCamaUci
    });
    this.closeModal.emit();
  }
}
