# AGENTS.md - MarIADono3 Database Module

## Descripción
Este AGENTS.md documenta el módulo de base de datos dentro de src/database de MarIADono3. Contiene la configuración de SQLite, modelos Sequelize, y utilidades para consultas y mantenimiento.

---

## Estructura clave

- SqliteManager.js: Orquestador de SQLite; maneja conexiones, modelos y sincronización de esquemas.
- DatabaseQueries.js: Capa de abstracción para consultas comunes.
- models/: Modelos Sequelize para cada entidad.
- migrations/: Esquemas de migración.
- seeders/: Datos de semilla.
- Data/MarIADono3DB.sqlite: Base de datos SQLite.
- Informes/: Scripts de informes y docs (p. ej. generateMonthlyBotMessageReport.js, README.md, 23-Octubre-2025/).
- schemas/: archivos de definiciones de esquemas.

---

## Archivos principales

- Informes/generateMonthlyBotMessageReport.js
- Informes/README.md
- Informes/23-Octubre-2025/
- SqliteManager.js
- DatabaseQueries.js
- models/
- migrations/
- seeders/
- schemas/
- loadData.js
- Data/MarIADono3DB.sqlite

---

## Flujo de trabajo recomendado

- Crear/actualizar tablas con las migraciones en migrations/
- Sembrar datos con seeders/
- Generar informes con Informes/generateMonthlyBotMessageReport.js
- Consultar con DatabaseQueries.js y SqliteManager.js

---

## Ejecución rápida

- Inicializar entorno Node y ejecutar script de informes:
  - node Informes/generateMonthlyBotMessageReport.js
- Verificar base de datos en Data/MarIADono3DB.sqlite

---

## Notas

- Este módulo depende de Node.js y SQLite. Asegúrate de que las rutas de la base de datos sean correctas si ejecutas desde otros directorios.
- Contenido de AGENTS.md está pensado para guiar a desarrolladores y operarios del proyecto.