export type Specialty =
  | 'radiologia_intervencionista'
  | 'neurointervencionismo'
  | 'neumologia'
  | 'dolor'
  | 'cinedegluciones';

export interface SpecialtyMeta {
  id: Specialty;
  nombre: string;
  nombreCorto: string;
  icono: string;
  badgeBg: string;
  badgeText: string;
  borderCol: string;
  accentBg: string;
  descripcion: string;
  procedimientosComunes: string[];
  recomendacionesEstandar: string;
}

export const SPECIALTY_CATALOG: Record<Specialty, SpecialtyMeta> = {
  radiologia_intervencionista: {
    id: 'radiologia_intervencionista',
    nombre: 'Radiología Intervencionista',
    nombreCorto: 'Rad. Intervencionista',
    icono: 'biotech',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    borderCol: 'border-teal-200',
    accentBg: 'bg-teal-600',
    descripcion: 'Biopsias percutáneas, drenajes guiados, nefrostomías, embolizaciones y colocación de accesos vasculares.',
    procedimientosComunes: [
      'Biopsia hepática percutánea guiada por TAC/Eco',
      'Nefrostomía percutánea unilateral bajo guía fluoroscópica',
      'Drenaje percutáneo de colección intraabdominal',
      'Colocación de catéter de hemodiálisis permanente (Permacath)',
      'Angioplastia y colocación de stent en arterias periféricas',
      'Embolización de arterias uterinas para miomatosis'
    ],
    recomendacionesEstandar: 'Ayuno mínimo de 6-8 horas. Suspender anticoagulantes orales 48-72h previas según orden médica. Traer resultado reciente de Creatinina (no mayor a 30 días) y tiempos de coagulación TP/TPT.'
  },
  neurointervencionismo: {
    id: 'neurointervencionismo',
    nombre: 'Neurointervencionismo',
    nombreCorto: 'Neurointervención',
    icono: 'psychology',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    borderCol: 'border-purple-200',
    accentBg: 'bg-purple-600',
    descripcion: 'Panangiografías cerebrales, embolización de aneurismas, malformaciones arteriovenosas y rescate endovascular de ACV.',
    procedimientosComunes: [
      'Panangiografía cerebral diagnóstica con sustracción digital (4 vasos)',
      'Embolización endovascular de aneurisma cerebral con espirales (coils)',
      'Trombectomía mecánica en ataque cerebrovascular isquémico',
      'Embolización de malformación arteriovenosa (MAV) cerebral',
      'Angioplastia con stent carotídeo extracraneal'
    ],
    recomendacionesEstandar: 'Ayuno estricto de 8 horas. Rasurado de región inguinal bilateral y muñeca derecha. Suspender antiagregantes/anticoagulantes según indicación estricta de neurocirujano. Obligatoria valoración preanestésica vigente y reserva de cama/UCI según complejidad.'
  },
  neumologia: {
    id: 'neumologia',
    nombre: 'Neumología Intervencionista',
    nombreCorto: 'Neumología',
    icono: 'air',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    borderCol: 'border-sky-200',
    accentBg: 'bg-sky-600',
    descripcion: 'Broncoscopias diagnósticas y terapéuticas, ecobroncoscopia (EBUS), criobiopsia pulmonar y colocación de stents de vía aérea.',
    procedimientosComunes: [
      'Fibrobroncoscopia con lavado broncoalveolar y cepillado',
      'Broncoscopia con punción aspiración transbronquial guiada por EBUS',
      'Criobiopsia transbronquial pulmonar',
      'Toracocentesis guiada por ecografía torácica',
      'Colocación / retiro de prótesis traqueobronquial'
    ],
    recomendacionesEstandar: 'Ayuno estricto de 8 horas para sólidos y 4 horas para líquidos claros. No fumar 24 horas antes del procedimiento. Traer inhaladores de uso habitual. Concurrir con acompañante mayor de edad.'
  },
  dolor: {
    id: 'dolor',
    nombre: 'Clínica del Dolor e Intervencionismo Analgésico',
    nombreCorto: 'Clínica del Dolor',
    icono: 'healing',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    borderCol: 'border-amber-200',
    accentBg: 'bg-amber-600',
    descripcion: 'Bloqueos nerviosos guiados por fluoroscopia o ecografía, neurolisis, radiofrecuencia de facetas y bombas de infusión.',
    procedimientosComunes: [
      'Bloqueo peridural lumbar transforaminal guiado por fluoroscopia',
      'Rizotomía por radiofrecuencia de facetas lumbares / cervicales',
      'Bloqueo de ganglio estrellado guiado por ecografía',
      'Infiltración de articulaciones sacroilíacas bajo radioscopia',
      'Bloqueo de nervios periféricos para dolor crónico intratable'
    ],
    recomendacionesEstandar: 'Ayuno de 6 horas. Traer imágenes diagnósticas previas (Resonancia Magnética o Tomografía de columna reciente). Asistir con ropa holgada y cómoda sin broches metálicos. No conducir después del procedimiento.'
  },
  cinedegluciones: {
    id: 'cinedegluciones',
    nombre: 'Cinedegluciones / Fluoroscopia de Deglución',
    nombreCorto: 'Cinedegluciones',
    icono: 'restaurant',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    borderCol: 'border-emerald-200',
    accentBg: 'bg-emerald-600',
    descripcion: 'Videofluoroscopia de la deglución con bario, estudio dinámico para disfagia orofaríngea y riesgo de aspiración.',
    procedimientosComunes: [
      'Videofluoroscopia de la deglución con medio de contraste baritado',
      'Estudio dinámico de cinedeglución en fase oral, faríngea y esofágica',
      'Evaluación radioscópica de disfagia neurogénica y riesgo de aspiración'
    ],
    recomendacionesEstandar: 'Ayuno de 4 horas antes del estudio. Traer alimentos de diferentes consistencias si fue solicitado por Fonoaudiología: 1 compota o yogurt espeso, galletas de sal, 1 compota o néctar y vaso plástico. Traer prótesis dentales si las utiliza.'
  }
};

export type Procedencia =
  | 'Ambulatorio'
  | 'Hospitalización (Piso)'
  | 'Urgencias'
  | 'UCI'
  | 'Remitido Interinstitucional';

export type AutorizacionEstado = 'aprobada' | 'en_tramite' | 'glosada' | 'pendiente_codigo' | 'particular';
export type AnestesiaEstado = 'aprobada' | 'pendiente' | 'no_requiere';
export type CitaEstado = 'programada' | 'confirmada' | 'en_sala' | 'realizada' | 'cancelada' | 'reprogramada';
export type SemaforoStatus = 'rojo' | 'amarillo' | 'verde' | 'completado';

export interface Checklist {
  autorizacionEps: AutorizacionEstado;
  numeroAutorizacion?: string;
  valoracionAnestesia: AnestesiaEstado;
  clasificacionAsa?: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'No aplica';
  laboratoriosAlDia: boolean;
  laboratoriosDetalle?: string;
  consentimientoFirmado: boolean;
  ayunoVerificado: boolean;
  acompananteConfirmado: boolean;
  reservaCamaUci?: boolean;
  observacionesChecklist?: string;
}

export interface ReminderEntry {
  enviado: boolean;
  fechaEnvio?: string;
  canal?: 'whatsapp' | 'email' | 'ambos';
  mensaje?: string;
  estadoLectura?: 'entregado' | 'leido' | 'confirmado';
}

export interface PatientSchedule {
  id: string;
  fecha: string; // ISO YYYY-MM-DD
  hora: string; // HH:mm
  nombrePaciente: string;
  numeroIdentificacion: string;
  edad: number;
  genero: 'M' | 'F' | 'Otro';
  eps: string;
  procedencia: Procedencia;
  camaUbicacion?: string;
  especialidad: Specialty;
  diagnostico: string;
  procedimientoProgramado: string;
  observacionesEspecificas: string;
  telefonoWhatsapp: string;
  correoInstitucional: string;
  sala: string;
  medicoEspecialista: string;
  checklist: Checklist;
  recordatorio7Dias: ReminderEntry;
  recordatorio1Dia: ReminderEntry;
  estadoCita: CitaEstado;
  // Campos calculados
  diasRestantes?: number;
  semaforo?: SemaforoStatus;
  semaforoMensaje?: string;
}

export interface NotificationPreview {
  patient: PatientSchedule;
  tipo: '7_dias' | '1_dia' | 'personalizado';
  canal: 'whatsapp' | 'email';
  destinatario: string;
  asunto?: string;
  cuerpo: string;
  loading?: boolean;
}
