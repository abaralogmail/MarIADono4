# generateWeeklyBotMessageReport.js

Este script genera un informe semanal de la cantidad de mensajes enviados por cada bot desde la base de datos `MarIADono3DB.sqlite`.

## Propósito

El objetivo de este informe es proporcionar una visión general de la actividad de los bots durante la semana actual, mostrando cuántos mensajes ha enviado cada bot.

## Cómo funciona

1.  **Conexión a la Base de Datos**: Utiliza `SqliteManager` para establecer una conexión con la base de datos SQLite.
2.  **Cálculo de la Semana Actual**: Determina el inicio de la semana actual (lunes) para filtrar los mensajes relevantes.
3.  **Consulta de Mensajes**: Consulta la tabla `ConversationsLog` para contar los mensajes donde el `role` es 'bot' y la `date` está dentro de la semana actual, agrupando los resultados por `botName`.
4.  **Generación del Informe**: Imprime en la consola un resumen de los mensajes enviados por cada bot.

## Uso

Para ejecutar este script, navegue hasta el directorio `src/database/scripts/` en su terminal y ejecute el siguiente comando:

```bash
node generateWeeklyBotMessageReport.js
```

El informe se imprimirá directamente en la consola.