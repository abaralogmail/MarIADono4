# Informes (Informes Mensuales y Semanales)

Este directorio aloja los agentes/escenarios responsables de generar informes de actividad de los bots a partir de la Base de Datos SQLite del proyecto MarIADono3.

## Agentes principales
- Agente de Informe Mensual: ejecuta el script generateMonthlyBotMessageReport.js para crear un informe mensual de mensajes y actividad.
- Agente de Informe Semanal: ejecuta el script generateWeeklyBotMessageReport.js para generar un informe semanal.

Ambos agentes:
- Conectan a la base de datos SQLite del proyecto (Ruta típica: Data/MarIADono3DB.sqlite o ruta equivalente configurada en el entorno).
- Generan un informe y lo guardan en un directorio de salida dentro de este mismo folder (por ejemplo, un subdirectorio por fecha como 23-Octubre-2025).
- Registran el resultado de la generación y cualquier error en la consola/logs del sistema para auditoría.

> Nota: En el repositorio se observa una carpeta de ejemplo bajo `src/database/Informes/23-Octubre-2025/` que ilustra la organización de los informes por fecha.

## Archivos relevantes
- `generateMonthlyBotMessageReport.js`: Genera el informe mensual.
- `generateWeeklyBotMessageReport.js`: Genera el informe semanal.
- Carpetas de salida con fechas: ejemplos como `23-Octubre-2025/`.

## Flujo de ejecución recomendado
1) Asegurarse de que Node.js está instalado y de que la base de datos está accesible en la ruta configurada.
2) Ejecutar el informe mensual desde el directorio de database:
   - node generateMonthlyBotMessageReport.js
3) Opcionalmente, ejecutar el informe semanal:
   - node generateWeeklyBotMessageReport.js
4) Verificar la carpeta de salida para el informe generado y los archivos de registro.

## Requisitos y consideraciones
- Permisos de escritura en el directorio `src/database/Informes/` para crear subcarpetas de fecha y archivos de salida.
- La ruta a la base de datos debe estar correctamente configurada en los scripts (revisa cualquier path relativo si se ejecuta desde un directorio distinto).
- Graba registros de errores para facilitar la depuración.

## Ejemplos de salida
- `src/database/Informes/23-Octubre-2025/InformeMensual_2025-10.md`