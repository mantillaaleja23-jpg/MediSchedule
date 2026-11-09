# MediSchedule

Aplicación de demostración para programar procedimientos quirúrgicos e intervencionistas, revisar requisitos y preparar recordatorios.

## Ejecución local

Requiere Node.js y npm.

```powershell
npm install
npx ng serve --port 3000 --host 127.0.0.1
```

Abra <http://127.0.0.1:3000>.

## Alcance de la demostración

- Los registros se guardan en el almacenamiento local del navegador. No hay base de datos compartida ni control de acceso.
- WhatsApp y correo abren aplicaciones externas. El envío masivo solo marca recordatorios como enviados.
- La generación con Gemini es opcional. Al activarla, el servidor remite el objeto del paciente a Gemini; no la use con datos reales sin la revisión y autorización institucional correspondientes.
- El proyecto trae casos ficticios con identificadores de demostración y contactos no válidos; no introduzca datos reales de pacientes.
- Las indicaciones clínicas son plantillas de demostración y requieren validación profesional.
