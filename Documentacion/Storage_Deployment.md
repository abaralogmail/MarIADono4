# Despliegue y permisos para Storage de archivos por cliente

Resumen rápido
- Root de storage por defecto: ./storage (puede sobrescribirse con la variable de entorno STORAGE_ROOT).
- Estructura por cliente: `storage/clients/client_{id}/{conversations, media/{images,videos,audio}, documents, archives}`.
- Permisos recomendados (POSIX): directorios 700, archivos 600. En Windows usar icacls para restringir acceso al usuario del servicio.

Comandos de ejemplo (Linux / POSIX)
1. Crear la estructura base (ejecutar como root o con sudo):
   mkdir -p ./storage/clients
   chown -R yourappuser:yourappgroup ./storage
   find ./storage -type d -exec chmod 700 {} \;
   find ./storage -type f -exec chmod 600 {} \;

2. Crear carpetas para un cliente (ejemplo id=123):
   mkdir -p ./storage/clients/client_123/conversations
   mkdir -p ./storage/clients/client_123/media/images
   mkdir -p ./storage/clients/client_123/media/videos
   mkdir -p ./storage/clients/client_123/media/audio
   mkdir -p ./storage/clients/client_123/documents
   mkdir -p ./storage/clients/client_123/archives
   chown -R yourappuser:yourappgroup ./storage/clients/client_123
   find ./storage/clients/client_123 -type d -exec chmod 700 {} \;
   find ./storage/clients/client_123 -type f -exec chmod 600 {} \;

Notas SELinux (si aplica)
- Si SELinux está habilitado, permitir que el proceso de Node pueda escribir:
  semanage fcontext -a -t httpd_rw_content_t "/path/to/project/storage(/.*)?"
  restorecon -Rv /path/to/project/storage

Comandos de ejemplo (Windows Server)
- Suponiendo que el servicio corre como cuenta de servicio `MyAppUser`:
  mkdir .\storage\clients
  icacls .\storage /grant MyAppUser:(OI)(CI)RX
  icacls .\storage /inheritance:r
  icacls .\storage /grant MyAppUser:F

Recomendaciones operativas
- Crear las carpetas en el despliegue antes de iniciar la aplicación o permitir que la app las cree en tiempo de ejecución (storageManager.createClientStorageDirs).
- Asegurar que el usuario que ejecuta Node tenga ownership/permiso de escritura en la root de storage.
- No commitear la carpeta `storage/` (se añadió a `.gitignore`). Asegurar backups periódicos y política de retención para `archives`.
- Validar espacio en disco y montar almacenamiento externo (NFS, EFS, Blob storage) si se espera gran volumen.

Integración con la aplicación
- El util implementado es [`src/auxiliares/storageManager.js`](src/auxiliares/storageManager.js:1).
- Migraciones de metadata: [`src/database/migrations/20251229-07-create-client-file-storage.cjs`](src/database/migrations/20251229-07-create-client-file-storage.cjs:1) y [`src/database/migrations/20251229-08-create-client-conversation-archive.cjs`](src/database/migrations/20251229-08-create-client-conversation-archive.cjs:1).
- Modelo Sequelize: [`src/database/models/ClientFile.js`](src/database/models/ClientFile.js:1).
- Endpoint de descarga implementado en: [`src/controllers/clientFiles.js`](src/controllers/clientFiles.js:1).

Checklist para marcar tarea como completada
- [x] Migraciones aplicadas en entorno de desarrollo (verificado).
- [x] Util `storageManager` implementado.
- [x] Modelo Sequelize con hooks checksum implementado.
- [x] Endpoint de descarga protegido con RBAC implementado.
- [x] Documentar pasos de despliegue y permisos (este archivo).

