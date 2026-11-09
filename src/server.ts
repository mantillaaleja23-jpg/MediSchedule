import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

/**
 * AI-assisted or smart reminder message generator and notification endpoint
 */
app.post('/api/generate-reminder', async (req, res) => {
  try {
    const { patient, type } = req.body;
    if (!patient) {
      return res.status(400).json({ error: 'Faltan datos del paciente' });
    }

    const apiKey = process.env['GEMINI_API_KEY'];
    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Eres el coordinador médico de admisiones y programación quirúrgica e intervencionista de una clínica de alta complejidad.
Genera un mensaje cordial, claro, profesional y estructurado para ser enviado por ${req.body.channel === 'whatsapp' ? 'WhatsApp' : 'Correo Institucional'} a un paciente.

DATOS DEL PACIENTE Y CITA:
- Nombre: ${patient.nombrePaciente}
- Identificación: ${patient.numeroIdentificacion}
- Edad: ${patient.edad} años
- Especialidad: ${patient.especialidad}
- Procedimiento: ${patient.procedimientoProgramado}
- Diagnóstico: ${patient.diagnostico}
- Fecha y Hora de la cita: ${patient.fecha} a las ${patient.hora}
- Procedencia: ${patient.procedencia}
- EPS: ${patient.eps}
- Observaciones específicas y preparación: ${patient.observacionesEspecificas || 'Ninguna'}
- Estado de Requisitos: Autorización ${patient.checklist?.autorizacionEps}, Valoración Anestesia: ${patient.checklist?.valoracionAnestesia}
- Tipo de recordatorio: ${type === '7_dias' ? 'RECORDATORIO 7 DÍAS ANTES (Foco en autorizaciones de EPS, valoración de anestesia y exámenes de laboratorio)' : 'RECORDATORIO 1 DÍA ANTES (Foco en horas de ayuno estricto, no portar joyas, traer acompañante adulto, hora de presentación 1-2 horas antes y suspensión de medicamentos)'}

Requisitos del texto:
- Idioma: Español formal y empático.
- Si es WhatsApp: usa saltos de línea y emojis médicos discretos (🗓️, ⏰, 🏥, ⚠️, 📋, 👨‍⚕️).
- Incluye recordatorio específico de traer documento original, orden médica y autorización.
- Resalta con claridad las observaciones específicas dadas.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const generatedText = response.text || '';
        return res.json({ message: generatedText, source: 'gemini' });
      } catch (err) {
        console.warn('Gemini API call failed, using fallback template engine', err);
      }
    }

    // Default high-grade clinical template engine fallback
    const is7Days = type === '7_dias';
    let text = '';
    if (req.body.channel === 'whatsapp') {
      if (is7Days) {
        text = `🏥 *CENTRO MÉDICO QUIRÚRGICO E INTERVENCIONISTA*\n` +
          `*RECORDATORIO PREVIO DE CITA (7 DÍAS)*\n\n` +
          `Estimado(a) *${patient.nombrePaciente}* (ID: ${patient.numeroIdentificacion}):\n\n` +
          `Le recordamos que tiene programado su procedimiento en *7 días*:\n` +
          `🗓️ *Fecha:* ${patient.fecha}\n` +
          `⏰ *Hora:* ${patient.hora}\n` +
          `🩺 *Especialidad:* ${patient.especialidad}\n` +
          `🔬 *Procedimiento:* ${patient.procedimientoProgramado}\n` +
          `🏢 *Lugar:* Sala de Procedimientos e Intervencionismo\n\n` +
          `📋 *CHECKLIST DE REQUISITOS OBLIGATORIOS:*\n` +
          `1. *Autorización EPS:* ${patient.checklist?.autorizacionEps === 'aprobada' ? '✅ Aprobada' : '⚠️ Pendiente de radicar/validar con ' + patient.eps}\n` +
          `2. *Valoración Anestésica:* ${patient.checklist?.valoracionAnestesia === 'aprobada' ? '✅ Realizada y aprobada' : '⚠️ Pendiente cita pre-anestésica'}\n` +
          `3. *Exámenes:* Traer resultados de Creatinina y pruebas de coagulación recientes.\n\n` +
          `⚠️ *OBSERVACIONES ESPECÍFICAS:*\n` +
          `${patient.observacionesEspecificas || 'Presentarse con documento de identidad original.'}\n\n` +
          `Por favor responda a este mensaje confirmando su recepción. ¡Estamos para servirle!`;
      } else {
        text = `🚨 *CENTRO MÉDICO QUIRÚRGICO E INTERVENCIONISTA*\n` +
          `*RECORDATORIO INMEDIATO: CITA MAÑANA (1 DÍA)*\n\n` +
          `Estimado(a) *${patient.nombrePaciente}*:\n\n` +
          `Su procedimiento es *MAÑANA*:\n` +
          `🗓️ *Fecha:* ${patient.fecha}\n` +
          `⏰ *Hora citación:* Presentarse 1 hora antes (${patient.hora})\n` +
          `🔬 *Procedimiento:* ${patient.procedimientoProgramado}\n\n` +
          `⚠️ *INSTRUCCIONES CRÍTICAS DE PREPARACIÓN:*\n` +
          `• *Ayuno estricto:* Mínimo 8 horas (no agua, no café, no alimentos).\n` +
          `• *Acompañante:* Venir obligatoriamente con un adulto responsable.\n` +
          `• *Prendas:* Ropa cómoda de dos piezas, sin maquillaje, sin esmalte en uñas y sin joyas.\n` +
          `• *Medicamentos:* ${patient.observacionesEspecificas || 'Consulte suspensión con su especialista'}\n` +
          `• *Documentos:* Cédula física, orden médica y carné/copia EPS (${patient.eps}).\n\n` +
          `Por favor confirme su asistencia respondiendo *CONFIRMO*.`;
      }
    } else {
      text = `Estimado(a) ${patient.nombrePaciente},\n\n` +
        `Por medio de la presente comunicación institucional le notificamos los detalles de su cita para ${patient.procedimientoProgramado}.\n` +
        `Fecha: ${patient.fecha} | Hora: ${patient.hora} | Especialidad: ${patient.especialidad}\n\n` +
        `Observaciones del especialista:\n${patient.observacionesEspecificas || 'Sin observaciones adicionales'}\n\n` +
        `Atentamente,\nCoordinación de Programación Médica e Intervencionismo`;
    }

    return res.json({ message: text, source: 'template' });
  } catch (error) {
    console.error('Error generating reminder:', error);
    return res.status(500).json({ error: 'Error al procesar recordatorio' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
