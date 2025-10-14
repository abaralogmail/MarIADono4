# Especificación de Característica: Envío de Mensajes Masivos con Contenido Multimedia

**Rama de Característica**: `[###-enviar-media-bulkmessage]`
**Creado**: 04 de octubre de 2025
**Estado**: Borrador
**Entrada**: Descripción del usuario: "Soporte para enviar mensajes masivos que incluyan imágenes, videos o documentos."

## Flujo de Ejecución (principal)
```
1. Analizar la descripción del usuario de la entrada
   → Si está vacía: ERROR "No se proporcionó descripción de la característica"
2. Extraer conceptos clave de la descripción
   → Identificar: actores, acciones, datos, restricciones
3. Para cada aspecto poco claro:
   → Marcar con [NECESITA ACLARACIÓN: pregunta específica]
4. Completar la sección de Escenarios de Usuario y Pruebas
   → Si no hay un flujo de usuario claro: ERROR "No se pueden determinar los escenarios de usuario"
5. Generar Requisitos Funcionales
   → Cada requisito debe ser comprobable
   → Marcar requisitos ambiguos
6. Identificar Entidades Clave (si hay datos involucrados)
7. Ejecutar Lista de Verificación de Revisión
   → Si hay algún [NECESITA ACLARACIÓN]: ADVERTENCIA "La especificación tiene incertidumbres"
   → Si se encuentran detalles de implementación: ERROR "Eliminar detalles técnicos"
8. Devolver: ÉXITO (especificación lista para la planificación)
```

---

## ⚡ Pautas Rápidas
- ✅ Enfocarse en QUÉ necesitan los usuarios y POR QUÉ
- ❌ Evitar CÓMO implementar (sin pila tecnológica, APIs, estructura de código)
- 👥 Escrito para partes interesadas del negocio, no para desarrolladores

### Requisitos de Sección
- **Secciones obligatorias**: Deben completarse para cada característica
- **Secciones opcionales**: Incluir solo cuando sean relevantes para la característica
- Cuando una sección no aplique, eliminarla por completo (no dejar como "N/A")

### Para Generación por IA
Al crear esta especificación a partir de una instrucción del usuario:
1. **Marcar todas las ambigüedades**: Usar [NECESITA ACLARACIÓN: pregunta específica] para cualquier suposición que deba hacerse
2. **No adivinar**: Si la instrucción no especifica algo (ej., "sistema de inicio de sesión" sin método de autenticación), marcarlo
3. **Pensar como un probador**: Cada requisito vago debe fallar el elemento de la lista de verificación "comprobable y sin ambigüedades"
4. **Áreas comunes poco especificadas**:
   - Tipos de usuario y permisos
   - Políticas de retención/eliminación de datos
   - Objetivos de rendimiento y escala
   - Comportamientos de manejo de errores
   - Requisitos de integración
   - Necesidades de seguridad/cumplimiento

---

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario Principal
Como administrador del sistema, quiero poder enviar mensajes masivos que incluyan archivos multimedia (imágenes, videos o documentos) a una lista de contactos, para comunicar información de manera más efectiva y atractiva.

### Escenarios de Aceptación
1.  **Dado** que tengo una lista de contactos y un archivo multimedia (ej. imagen) para enviar, **Cuando** inicio el proceso de envío masivo, **Entonces** cada contacto en la lista recibe el mensaje con la imagen adjunta.
2.  **Dado** que tengo una lista de contactos y un archivo multimedia (ej. video) para enviar, **Cuando** inicio el proceso de envío masivo, **Entonces** cada contacto en la lista recibe el mensaje con el video adjunto.
3.  **Dado** que tengo una lista de contactos y un archivo multimedia (ej. PDF) para enviar, **Cuando** inicio el proceso de envío masivo, **Entonces** cada contacto en la lista recibe el mensaje con el documento adjunto.
4.  **Dado** que el archivo multimedia excede el tamaño máximo permitido por la plataforma de mensajería (20 MB), **Cuando** intento enviar el mensaje masivo, **Entonces** el sistema me notifica del error y no envía el mensaje.

## Clarifications
### Session 2025-10-05
- Q: ¿Cuáles son los formatos exactos de archivos multimedia que el sistema debe soportar para el envío masivo? → A: JPG, PNG, MP4, PDF
- Q: ¿Cuál es el tamaño máximo permitido para los archivos multimedia que se pueden enviar en un mensaje masivo? → A: 20 MB
- Q: ¿Cómo se proporcionará la interfaz para que el usuario pueda cargar el archivo multimedia? → A: A través de la plataforma n8n

### Requisitos Funcionales

- **FR-002**: El sistema DEBE enviar el mensaje de texto junto con el archivo multimedia adjunto a cada destinatario.
- **FR-003**: El sistema DEBE soportar los formatos de archivo multimedia exactos: JPG, PNG, MP4, PDF.
- **FR-004**: El sistema DEBE validar el tamaño y el formato del archivo multimedia antes de intentar el envío.
- **FR-005**: El sistema DEBE registrar el estado de envío de cada mensaje, incluyendo si el medio fue enviado exitosamente o si hubo errores.
- **FR-006**: El sistema DEBE proporcionar una interfaz para que el usuario pueda cargar el archivo multimedia a través de la plataforma n8n.

### Entidades Clave *(incluir si la característica involucra datos)*
- **MensajeMasivo**: Representa un mensaje que se enviará a múltiples destinatarios, incluyendo el texto y la referencia al archivo multimedia.
- **ArchivoMultimedia**: Representa el archivo (imagen, video, documento) que se adjuntará al mensaje masivo, incluyendo su tipo, tamaño y ubicación.
- **Destinatario**: Representa un contacto al que se le enviará el mensaje masivo, incluyendo su número de teléfono y el estado del envío.

---

## Lista de Verificación de Revisión y Aceptación
*PUERTA: Verificaciones automatizadas ejecutadas durante la ejecución de main()*

### Calidad del Contenido
- [ ] No hay detalles de implementación (lenguajes, frameworks, APIs)
- [ ] Enfocado en el valor para el usuario y las necesidades del negocio
- [ ] Escrito para partes interesadas no técnicas
- [ ] Todas las secciones obligatorias completadas

### Completitud de Requisitos
- [ ] No quedan marcadores [NECESITA ACLARACIÓN]
- [ ] Los requisitos son comprobables y sin ambigüedades
- [ ] Los criterios de éxito son medibles
- [ ] El alcance está claramente delimitado
- [ ] Las dependencias y suposiciones están identificadas

---

## Estado de Ejecución
*Actualizado por main() durante el procesamiento*

- [ ] Descripción del usuario analizada
- [ ] Conceptos clave extraídos
- [ ] Ambigüedades marcadas
- [ ] Escenarios de usuario definidos
- [ ] Requisitos generados
- [ ] Entidades identificadas
- [ ] Lista de verificación de revisión aprobada

---
