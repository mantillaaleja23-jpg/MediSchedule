import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PatientSchedule,
  Specialty,
  SemaforoStatus,
  SPECIALTY_CATALOG,
  Checklist
} from '../models/patient-schedule.model';

const STORAGE_KEY = 'medischedule_patients_v1';

@Injectable({
  providedIn: 'root'
})
export class PatientScheduleService {
  private http = inject(HttpClient);

  // Fecha de referencia simulada del sistema clínico (2026-10-30)
  readonly todayDateString = '2026-10-30';

  // Signals
  private patientsSignal = signal<PatientSchedule[]>([]);
  readonly patients = computed(() => this.enrichPatients(this.patientsSignal()));

  // Filtros
  readonly selectedSpecialty = signal<Specialty | 'todas'>('todas');
  readonly selectedSemaforo = signal<SemaforoStatus | 'todos'>('todos');
  readonly selectedChecklistFilter = signal<'todos' | 'sin_autorizacion' | 'sin_anestesia' | 'completos'>('todos');
  readonly selectedReminderFilter = signal<'todos' | 'pendiente_7d' | 'pendiente_1d'>('todos');
  readonly searchQuery = signal<string>('');
  readonly selectedDateFilter = signal<'todos' | 'hoy' | 'manana' | 'proximos_7d'>('todos');

  // Pacientes filtrados
  readonly filteredPatients = computed(() => {
    const list = this.patients();
    const specialty = this.selectedSpecialty();
    const semaforo = this.selectedSemaforo();
    const checklistFilter = this.selectedChecklistFilter();
    const reminderFilter = this.selectedReminderFilter();
    const query = this.searchQuery().trim().toLowerCase();
    const dateFilter = this.selectedDateFilter();

    return list.filter((p) => {
      // Especialidad
      if (specialty !== 'todas' && p.especialidad !== specialty) {
        return false;
      }

      // Semáforo
      if (semaforo !== 'todos' && p.semaforo !== semaforo) {
        return false;
      }

      // Filtro checklist
      if (checklistFilter === 'sin_autorizacion' && p.checklist.autorizacionEps === 'aprobada') {
        return false;
      }
      if (checklistFilter === 'sin_anestesia' && (p.checklist.valoracionAnestesia === 'aprobada' || p.checklist.valoracionAnestesia === 'no_requiere')) {
        return false;
      }
      if (checklistFilter === 'completos') {
        const isComplete = p.checklist.autorizacionEps === 'aprobada' &&
          (p.checklist.valoracionAnestesia === 'aprobada' || p.checklist.valoracionAnestesia === 'no_requiere') &&
          p.checklist.laboratoriosAlDia &&
          p.checklist.consentimientoFirmado;
        if (!isComplete) return false;
      }

      // Filtro de recordatorios
      if (reminderFilter === 'pendiente_7d' && p.recordatorio7Dias.enviado) {
        return false;
      }
      if (reminderFilter === 'pendiente_1d' && p.recordatorio1Dia.enviado) {
        return false;
      }

      // Filtro de fecha
      const dias = p.diasRestantes ?? 0;
      if (dateFilter === 'hoy' && dias !== 0) return false;
      if (dateFilter === 'manana' && dias !== 1) return false;
      if (dateFilter === 'proximos_7d' && (dias < 0 || dias > 7)) return false;

      // Búsqueda textual libre
      if (query) {
        const matchName = p.nombrePaciente.toLowerCase().includes(query);
        const matchId = p.numeroIdentificacion.toLowerCase().includes(query);
        const matchEps = p.eps.toLowerCase().includes(query);
        const matchProc = p.procedimientoProgramado.toLowerCase().includes(query);
        const matchDiag = p.diagnostico.toLowerCase().includes(query);
        const matchObs = p.observacionesEspecificas.toLowerCase().includes(query);
        if (!matchName && !matchId && !matchEps && !matchProc && !matchDiag && !matchObs) {
          return false;
        }
      }

      return true;
    });
  });

  // Métricas para Dashboard
  readonly metrics = computed(() => {
    const list = this.patients();
    const total = list.length;
    const inminentesRojo = list.filter((p) => p.semaforo === 'rojo').length;
    const proximosAmarillo = list.filter((p) => p.semaforo === 'amarillo').length;
    const aTiempoVerde = list.filter((p) => p.semaforo === 'verde').length;
    const completados = list.filter((p) => p.semaforo === 'completado').length;

    const pendientesAutorizacion = list.filter(
      (p) => p.checklist.autorizacionEps !== 'aprobada' && p.checklist.autorizacionEps !== 'particular'
    ).length;

    const pendientesAnestesia = list.filter(
      (p) => p.checklist.valoracionAnestesia === 'pendiente'
    ).length;

    const pendientesRecordatorio7d = list.filter(
      (p) => (p.diasRestantes ?? 99) <= 7 && (p.diasRestantes ?? 99) >= 6 && !p.recordatorio7Dias.enviado
    ).length;

    const pendientesRecordatorio1d = list.filter(
      (p) => (p.diasRestantes ?? 99) <= 1 && (p.diasRestantes ?? 99) >= 0 && !p.recordatorio1Dia.enviado
    ).length;

    const recordatoriosEnviadosTotal = list.reduce(
      (acc, p) => acc + (p.recordatorio7Dias.enviado ? 1 : 0) + (p.recordatorio1Dia.enviado ? 1 : 0),
      0
    );

    return {
      total,
      inminentesRojo,
      proximosAmarillo,
      aTiempoVerde,
      completados,
      pendientesAutorizacion,
      pendientesAnestesia,
      pendientesRecordatorio7d,
      pendientesRecordatorio1d,
      recordatoriosEnviadosTotal
    };
  });

  constructor() {
    this.initPatients();
  }

  private initPatients() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.patientsSignal.set(parsed);
            return;
          }
        } catch {
          // ignore error
        }
      }
    }

    // Casos ficticios para demostrar las cinco especialidades.
    const seed = this.getSeedPatients();
    this.patientsSignal.set(seed);
    this.persist(seed);
  }

  private persist(data: PatientSchedule[]) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  }

  private enrichPatients(list: PatientSchedule[]): PatientSchedule[] {
    const today = new Date(`${this.todayDateString}T00:00:00`);

    return list.map((p) => {
      const pDate = new Date(`${p.fecha}T00:00:00`);
      const diffTime = pDate.getTime() - today.getTime();
      const diasRestantes = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let semaforo: SemaforoStatus = 'verde';
      let semaforoMensaje = '';

      if (p.estadoCita === 'realizada') {
        semaforo = 'completado';
        semaforoMensaje = 'Procedimiento realizado con éxito';
      } else if (diasRestantes <= 1) {
        semaforo = 'rojo';
        const faltanRequisitos = p.checklist.autorizacionEps !== 'aprobada' || p.checklist.valoracionAnestesia === 'pendiente';
        semaforoMensaje = faltanRequisitos
          ? `ALERTA CRÍTICA: Cita en ${diasRestantes === 0 ? 'HOY' : '1 DÍA'} con requisitos pendientes`
          : `INMINENTE: Cita ${diasRestantes === 0 ? 'HOY' : 'MAÑANA'} (Requisitos verificados)`;
      } else if (diasRestantes <= 7) {
        semaforo = 'amarillo';
        semaforoMensaje = `PRÓXIMO: ${diasRestantes} días restantes (Auditar autorización y anestesia)`;
      } else {
        semaforo = 'verde';
        semaforoMensaje = `A TIEMPO: ${diasRestantes} días restantes`;
      }

      return {
        ...p,
        diasRestantes,
        semaforo,
        semaforoMensaje
      };
    }).sort((a, b) => {
      // Orden cronológico por fecha y luego hora
      const dateCmp = a.fecha.localeCompare(b.fecha);
      if (dateCmp !== 0) return dateCmp;
      return a.hora.localeCompare(b.hora);
    });
  }

  // Operaciones CRUD
  addPatient(patient: Omit<PatientSchedule, 'id'>) {
    const newPatient: PatientSchedule = {
      ...patient,
      id: 'PT-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
    };
    this.patientsSignal.update((prev) => {
      const updated = [newPatient, ...prev];
      this.persist(updated);
      return updated;
    });
  }

  updatePatient(id: string, updates: Partial<PatientSchedule>) {
    this.patientsSignal.update((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      this.persist(updated);
      return updated;
    });
  }

  deletePatient(id: string) {
    this.patientsSignal.update((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      this.persist(updated);
      return updated;
    });
  }

  resetSeedData() {
    const seed = this.getSeedPatients();
    this.patientsSignal.set(seed);
    this.persist(seed);
  }

  // Toggle rápido de elementos del Checklist
  updateChecklist(id: string, updates: Partial<Checklist>) {
    this.patientsSignal.update((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          checklist: {
            ...p.checklist,
            ...updates
          }
        };
      });
      this.persist(updated);
      return updated;
    });
  }

  // Registrar envío de recordatorio
  markReminderSent(id: string, tipo: '7_dias' | '1_dia', canal: 'whatsapp' | 'email' | 'ambos', mensaje: string) {
    const nowIso = new Date().toISOString();
    this.patientsSignal.update((prev) => {
      const updated: PatientSchedule[] = prev.map((p) => {
        if (p.id !== id) return p;
        if (tipo === '7_dias') {
          return {
            ...p,
            recordatorio7Dias: {
              enviado: true,
              fechaEnvio: nowIso,
              canal,
              mensaje,
              estadoLectura: 'entregado' as const
            }
          };
        } else {
          return {
            ...p,
            recordatorio1Dia: {
              enviado: true,
              fechaEnvio: nowIso,
              canal,
              mensaje,
              estadoLectura: 'entregado' as const
            }
          };
        }
      });
      this.persist(updated);
      return updated;
    });
  }

  // Generador de plantillas de WhatsApp preformateadas
  buildWhatsAppMessage(patient: PatientSchedule, tipo: '7_dias' | '1_dia'): string {
    const specialtyInfo = SPECIALTY_CATALOG[patient.especialidad];
    const is7Days = tipo === '7_dias';

    if (is7Days) {
      return (
        `🏥 *CENTRO DE INTERVENCIONISMO Y PROCEDIMIENTOS MÉDICOS*\n` +
        `*RECORDATORIO PREVENTIVO DE PROGRAMACIÓN (7 DÍAS)*\n\n` +
        `Apreciado(a) *${patient.nombrePaciente}* (ID: ${patient.numeroIdentificacion}):\n\n` +
        `Le confirmamos que su procedimiento está agendado para dentro de *7 días*:\n` +
        `🗓️ *Fecha:* ${patient.fecha}\n` +
        `⏰ *Hora:* ${patient.hora} AM/PM\n` +
        `🩺 *Especialidad:* ${specialtyInfo?.nombre || patient.especialidad}\n` +
        `🔬 *Procedimiento:* ${patient.procedimientoProgramado}\n` +
        `🏥 *Sala/Ubicación:* ${patient.sala} - ${patient.procedencia}\n` +
        `👨‍⚕️ *Especialista:* ${patient.medicoEspecialista}\n\n` +
        `📋 *ESTADO DE SU CHECKLIST OBLIGATORIO:*\n` +
        `• Autorización EPS (${patient.eps}): ${
          patient.checklist.autorizacionEps === 'aprobada'
            ? `✅ Aprobada (N° ${patient.checklist.numeroAutorizacion || 'OK'})`
            : '⚠️ PENDIENTE: Por favor comuníquese hoy con su EPS para radicarla'
        }\n` +
        `• Valoración Pre-Anestésica: ${
          patient.checklist.valoracionAnestesia === 'aprobada'
            ? `✅ Aprobada (${patient.checklist.clasificacionAsa || 'Apta'})`
            : patient.checklist.valoracionAnestesia === 'no_requiere'
            ? 'ℹ️ No requiere anestesia general'
            : '⚠️ PENDIENTE: Debe agendar su consulta de preanestesia esta semana'
        }\n` +
        `• Laboratorios clínicos: ${patient.checklist.laboratoriosAlDia ? '✅ Al día' : '⚠️ Debe traer creatinina y pruebas de coagulación'}\n\n` +
        `⚠️ *OBSERVACIONES ESPECÍFICAS DE PREPARACIÓN:*\n` +
        `${patient.observacionesEspecificas || specialtyInfo?.recomendacionesEstandar || 'Presentar cédula y orden médica original.'}\n\n` +
        `📲 *Por favor responda a este mensaje con la palabra "RECIBIDO" para registrar su acuse de recibo institucional.*`
      );
    } else {
      return (
        `🚨 *RECORDATORIO URGENTE: SU PROCEDIMIENTO ES MAÑANA (1 DÍA)*\n` +
        `*CENTRO DE PROCEDIMIENTOS E INTERVENCIONISMO*\n\n` +
        `Apreciado(a) *${patient.nombrePaciente}*:\n\n` +
        `Su cita médica es *MAÑANA*:\n` +
        `🗓️ *Fecha:* ${patient.fecha}\n` +
        `⏰ *Hora de presentación:* ${patient.hora} (Presentarse 1 hora antes en Admisiones)\n` +
        `🔬 *Procedimiento:* ${patient.procedimientoProgramado}\n` +
        `🩺 *Servicio:* ${specialtyInfo?.nombre || patient.especialidad}\n` +
        `🏥 *Sala:* ${patient.sala}\n\n` +
        `⚠️ *INDICACIONES OBLIGATORIAS PARA MAÑANA:*\n` +
        `1. *Ayuno estricto:* Mínimo 8 horas completas (no agua, no café, no goma de mascar).\n` +
        `2. *Acompañante:* Obligatorio acudir con un adulto responsable con disponibilidad de tiempo.\n` +
        `3. *Documentos:* Cédula física original, bono/autorización física de ${patient.eps} y exámenes previos.\n` +
        `4. *Prendas:* Ropa cómoda de dos piezas, sin maquillaje, sin esmalte en uñas y sin joyas o piercings.\n` +
        `5. *Medicamentos:* ${patient.observacionesEspecificas || 'Siga estrictamente las pautas de su médico tratante.'}\n\n` +
        `✅ *Por favor confirme su asistencia respondiendo: "CONFIRMO ASISTENCIA".*`
      );
    }
  }

  // Generador de correo institucional HTML / formal
  buildInstitutionalEmail(patient: PatientSchedule, tipo: '7_dias' | '1_dia'): { subject: string; body: string } {
    const specialtyInfo = SPECIALTY_CATALOG[patient.especialidad];
    const is7Days = tipo === '7_dias';

    const subject = is7Days
      ? `[CITACIÓN MÉDICA A 7 DÍAS] Notificación y Requisitos: ${patient.procedimientoProgramado} - ${patient.nombrePaciente}`
      : `[CITACIÓN INMEDIATA 24 HORAS] Indicaciones de Preparación Quirúrgica: ${patient.nombrePaciente}`;

    const body = `HOSPITAL UNIVERSITARIO / CENTRO DE ALTA COMPLEJIDAD
DEPARTAMENTO DE PROGRAMACIÓN MÉDICA, QUIRÚRGICA E INTERVENCIONISTA

Fecha de notificación: ${new Date().toLocaleDateString('es-ES')}
Destinatario: ${patient.nombrePaciente} (${patient.correoInstitucional})
Identificación: ${patient.numeroIdentificacion} | Edad: ${patient.edad} años
EPS / Asegurador: ${patient.eps} | Procedencia: ${patient.procedencia}

Estimado(a) paciente y equipo de salud:

Por medio de la presente comunicación oficial, notificamos la programación y condiciones operativas para el procedimiento médico programado:

DATOS DE LA PROGRAMACIÓN:
---------------------------------------------------------------------------------
• Procedimiento: ${patient.procedimientoProgramado}
• Especialidad: ${specialtyInfo?.nombre || patient.especialidad}
• Diagnóstico CIE: ${patient.diagnostico}
• Fecha programada: ${patient.fecha}
• Hora de cita: ${patient.hora}
• Sala asignada: ${patient.sala}
• Especialista a cargo: ${patient.medicoEspecialista}
---------------------------------------------------------------------------------

CHECKLIST DE REQUISITOS CLÍNICOS Y ADMINISTRATIVOS:
1. Autorización de EPS: ${patient.checklist.autorizacionEps.toUpperCase()} (Número: ${patient.checklist.numeroAutorizacion || 'Por registrar'})
2. Valoración Pre-Anestésica: ${patient.checklist.valoracionAnestesia.toUpperCase()} (Clasificación: ${patient.checklist.clasificacionAsa || 'Pendiente'})
3. Laboratorios al día: ${patient.checklist.laboratoriosAlDia ? 'APROBADO' : 'PENDIENTES (Creatinina, Hemograma, TP/TPT)'}
4. Consentimiento informado: ${patient.checklist.consentimientoFirmado ? 'FIRMADO' : 'PENDIENTE DE FIRMA EN SALA'}
5. Ayuno requerido: ${patient.checklist.ayunoVerificado ? 'CONFIRMADO' : 'VERIFICAR 8 HORAS PREVIAS'}

OBSERVACIONES CLÍNICAS ESPECÍFICAS DEL PROCEDIMIENTO:
"${patient.observacionesEspecificas || specialtyInfo?.recomendacionesEstandar}"

RECOMENDACIONES INSTITUCIONALES GENERALES:
- Presentarse en la oficina de Admisiones del piso quirúrgico con 60 a 90 minutos de anticipación.
- Traer documento de identidad original en físico, carnet de EPS y carpeta con estudios radiológicos previos (RMN, TAC, Ecografías).
- Debe asistir en compañía de un adulto responsable y no conducir vehículos al egreso.

En caso de dudas o reprogramación, comuníquese mediante los canales institucionales validados.

Atentamente,
COORDINACIÓN MÉDICA DE CIRUGÍA E INTERVENCIONISMO
Centro Hospitalario`;

    return { subject, body };
  }

  // Genera URL directa de WhatsApp
  getWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  // Llamada al endpoint con IA de Gemini o plantilla
  async generateAiReminder(patient: PatientSchedule, tipo: '7_dias' | '1_dia', channel: 'whatsapp' | 'email'): Promise<string> {
    try {
      const res = await fetch('/api/generate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, type: tipo, channel })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          return data.message;
        }
      }
    } catch {
      // fallback
    }

    if (channel === 'whatsapp') {
      return this.buildWhatsAppMessage(patient, tipo);
    } else {
      return this.buildInstitutionalEmail(patient, tipo).body;
    }
  }

  // Exportar plantilla de programación oficial a CSV
  exportToCsv() {
    const list = this.patients();
    const headers = [
      'Hora',
      'Fecha',
      'Nombre del Paciente',
      'Número de Identificación',
      'Edad',
      'EPS',
      'Procedencia',
      'Especialidad',
      'Diagnóstico',
      'Procedimiento Programado',
      'Observaciones Específicas',
      'Autorización EPS',
      'Valoración Anestesia',
      'Semáforo',
      'Días Restantes',
      'Teléfono WhatsApp',
      'Correo Institucional'
    ];

    const rows = list.map((p) => [
      `"${p.hora}"`,
      `"${p.fecha}"`,
      `"${p.nombrePaciente.replace(/"/g, '""')}"`,
      `"${p.numeroIdentificacion}"`,
      p.edad,
      `"${p.eps}"`,
      `"${p.procedencia}"`,
      `"${SPECIALTY_CATALOG[p.especialidad]?.nombre || p.especialidad}"`,
      `"${p.diagnostico.replace(/"/g, '""')}"`,
      `"${p.procedimientoProgramado.replace(/"/g, '""')}"`,
      `"${(p.observacionesEspecificas || '').replace(/"/g, '""')}"`,
      `"${p.checklist.autorizacionEps.toUpperCase()}"`,
      `"${p.checklist.valoracionAnestesia.toUpperCase()}"`,
      `"${p.semaforo?.toUpperCase()}"`,
      p.diasRestantes ?? 0,
      `"${p.telefonoWhatsapp}"`,
      `"${p.correoInstitucional}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Programacion_Pacientes_Quirurgica_${this.todayDateString}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private getSeedPatients(): PatientSchedule[] {
    const scenarios: Array<{
      fecha: string;
      hora: string;
      especialidad: Specialty;
      procedencia: PatientSchedule['procedencia'];
      autorizacion: Checklist['autorizacionEps'];
      anestesia: Checklist['valoracionAnestesia'];
      recordatorio7Enviado: boolean;
      recordatorio1Enviado: boolean;
    }> = [
      { fecha: '2026-10-30', hora: '14:00', especialidad: 'neurointervencionismo', procedencia: 'Urgencias', autorizacion: 'particular', anestesia: 'aprobada', recordatorio7Enviado: true, recordatorio1Enviado: true },
      { fecha: '2026-10-31', hora: '07:30', especialidad: 'radiologia_intervencionista', procedencia: 'Ambulatorio', autorizacion: 'aprobada', anestesia: 'aprobada', recordatorio7Enviado: true, recordatorio1Enviado: false },
      { fecha: '2026-10-31', hora: '09:00', especialidad: 'neurointervencionismo', procedencia: 'Hospitalización (Piso)', autorizacion: 'en_tramite', anestesia: 'pendiente', recordatorio7Enviado: false, recordatorio1Enviado: false },
      { fecha: '2026-11-02', hora: '08:00', especialidad: 'neumologia', procedencia: 'Hospitalización (Piso)', autorizacion: 'aprobada', anestesia: 'aprobada', recordatorio7Enviado: false, recordatorio1Enviado: false },
      { fecha: '2026-11-06', hora: '10:30', especialidad: 'dolor', procedencia: 'Ambulatorio', autorizacion: 'aprobada', anestesia: 'pendiente', recordatorio7Enviado: false, recordatorio1Enviado: false },
      { fecha: '2026-11-06', hora: '11:45', especialidad: 'cinedegluciones', procedencia: 'Ambulatorio', autorizacion: 'en_tramite', anestesia: 'no_requiere', recordatorio7Enviado: false, recordatorio1Enviado: false },
      { fecha: '2026-11-12', hora: '13:30', especialidad: 'radiologia_intervencionista', procedencia: 'Ambulatorio', autorizacion: 'aprobada', anestesia: 'aprobada', recordatorio7Enviado: false, recordatorio1Enviado: false }
    ];

    return scenarios.map((scenario, index) => {
      const suffix = String(index + 1).padStart(3, '0');
      const reminder7 = scenario.recordatorio7Enviado;
      const reminder1 = scenario.recordatorio1Enviado;

      return {
        id: `DEMO-${suffix}`,
        fecha: scenario.fecha,
        hora: scenario.hora,
        nombrePaciente: `Paciente de demostración ${suffix}`,
        numeroIdentificacion: `DEMO-${suffix}`,
        edad: 40 + index * 3,
        genero: index % 2 === 0 ? 'F' : 'M',
        eps: 'Asegurador de demostración',
        procedencia: scenario.procedencia,
        camaUbicacion: scenario.procedencia === 'Hospitalización (Piso)' ? 'Ubicación de demostración' : undefined,
        especialidad: scenario.especialidad,
        diagnostico: `Diagnóstico ficticio de demostración ${suffix}`,
        procedimientoProgramado: `Procedimiento ficticio de demostración ${suffix}`,
        observacionesEspecificas: 'Datos ficticios. Verifique las indicaciones con el protocolo institucional aprobado.',
        telefonoWhatsapp: '+570000000000',
        correoInstitucional: `paciente.demo.${suffix}@example.invalid`,
        sala: `Sala de demostración ${index % 3 + 1}`,
        medicoEspecialista: 'Especialista de demostración',
        checklist: {
          autorizacionEps: scenario.autorizacion,
          numeroAutorizacion: scenario.autorizacion === 'aprobada' ? `DEMO-AUT-${suffix}` : undefined,
          valoracionAnestesia: scenario.anestesia,
          clasificacionAsa: scenario.anestesia === 'no_requiere' ? 'No aplica' : 'ASA II',
          laboratoriosAlDia: index % 3 !== 2,
          laboratoriosDetalle: 'Resultado ficticio de demostración',
          consentimientoFirmado: index % 2 === 0,
          ayunoVerificado: false,
          acompananteConfirmado: index % 2 === 0,
          reservaCamaUci: false,
          observacionesChecklist: 'Información sintética para demostración.'
        },
        recordatorio7Dias: {
          enviado: reminder7,
          fechaEnvio: reminder7 ? '2026-10-23T09:00:00' : undefined,
          canal: reminder7 ? 'whatsapp' : undefined,
          mensaje: reminder7 ? 'Mensaje ficticio de demostración.' : undefined,
          estadoLectura: reminder7 ? 'confirmado' : undefined
        },
        recordatorio1Dia: {
          enviado: reminder1,
          fechaEnvio: reminder1 ? '2026-10-29T12:00:00' : undefined,
          canal: reminder1 ? 'whatsapp' : undefined,
          mensaje: reminder1 ? 'Mensaje ficticio de demostración.' : undefined,
          estadoLectura: reminder1 ? 'confirmado' : undefined
        },
        estadoCita: 'programada'
      };
    });
  }
}
