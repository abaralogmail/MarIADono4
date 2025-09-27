Factores Clave para la Codificación con IA
A continuación, se presenta una lista de factores a tener en cuenta, formateados como campos de un modelo de datos, basados en la información proporcionada en las fuentes:
• modelo_ia_utilizado (Modelo de IA utilizado) [1-4]
    ◦ Descripción: Hace referencia al agente o modelo de inteligencia artificial específico que se está utilizando para la tarea de codificación.
    ◦ Valores Posibles: * CH_GBD_Codex: Agente de IA asíncrono basado en la nube [1, 2]. * Codex_CLI: Versión de línea de comandos de OpenAI, síncrona, útil para tareas directas y visualización de tokens [1, 2, 5]. * Codex_Extension: Extensión para IDE (como Cursor), síncrona, con una interfaz de usuario más amigable que el CLI [1, 2, 6]. * GPD5_High: Modelo principal, parte de la familia GPD5, conocido por su "esfuerzo de razonamiento alto" (high reasoning effort) [1, 2, 7, 8]. * GBD4.1: Modelo utilizado para tareas como la calificación de relevancia de fragmentos de código [9-12]. * Opus_4.1: Modelo útil para explicaciones y como "consultor" [2, 13-15]. * Gemini_2.5_Pro: Mencionado como otro modelo que se puede usar en herramientas como Vectal [4]. * Otros_LLM_menores: Se menciona que algunos métodos de compresión usan LLMs locales pequeños que no son tan confiables [9].
• parametro_esfuerzo_razonamiento (Parámetro de esfuerzo de razonamiento) [2, 7, 8]
    ◦ Descripción: Nivel de "pensamiento" o razonamiento que el modelo de IA dedica a una tarea.
    ◦ Valores Posibles: * Minimal: Sin razonamiento, se considera inútil [2]. * Low: Ratio de 0.2 [2, 16]. * Medium: Ratio de 0.5, es el predeterminado [2]. * High: Ratio de 0.8, el "mágico", recomendado para codificación ya que permite al modelo pensar por cinco o más minutos en una sola tarea (test time compute) [2, 3, 7, 8]. * Thinking: Modo general de "pensamiento" en JGPT [8].
• conteo_tokens_contexto (Conteo de tokens del contexto) [5, 9]
    ◦ Descripción: Número de tokens disponibles en la ventana de contexto de un modelo, o utilizados en una sesión de chat.
    ◦ Ejemplo: GPT5 High tiene una ventana de contexto de 400,000 tokens [9]. En el CLI de Codex, se puede ver la cantidad de tokens utilizados en una sesión de chat [5].
• tipo_trabajo (Tipo de trabajo) [2]
    ◦ Descripción: Paradigma de cómo el agente de IA interactúa con el desarrollador.
    ◦ Valores Posibles: * Sincrono: El agente de IA trabaja junto con el desarrollador en la misma tarea (ej. CLI y la extensión de Codex) [2]. * Asincrono: El agente de IA trabaja por separado, generalmente en la nube, en diferentes tareas (ej. CH GBD Codex) [2].
• precision_claridad_instrucciones (Precisión y claridad de las instrucciones) [5, 7, 11]
    ◦ Descripción: Grado de especificidad y ausencia de ambigüedad en los prompts (instrucciones) dados al modelo.
    ◦ Factores: * Evitar información conflictiva o vaga: Instrucciones claras y específicas producen mejores resultados [7]. * Evitar lenguaje excesivamente firme: Un lenguaje demasiado estricto puede provocar que el modelo "sobrepiense" (overthink), "sobre-ingenierice" (overengineer), "sobre-analice" (overanalyze) o realice demasiadas llamadas a herramientas [5, 11].
• uso_etiquetas_xml (Uso de etiquetas XML) [3]
    ◦ Descripción: Utilización de etiquetas XML para delinear diferentes secciones de un prompt, mejorando la comprensión del modelo.
    ◦ Ejemplo: <contexto>Soy desarrollador</contexto> <tarea>Explicar programación orientada a objetos</tarea> [3].
• estrategia_planificacion_reflexion (Estrategia de planificación y reflexión) [17]
    ◦ Descripción: Enfoque para estructurar tareas y permitir que el modelo piense antes de actuar.
    ◦ Factores: * Dividir tareas: Partir una tarea grande en pasos más pequeños (ej. 5 a 7 categorías) [17]. * Auto-reflexión: Usar etiquetas como self-reflection para mejorar el razonamiento del modelo [17].
• control_entusiasmo_agente (Control del entusiasmo del agente) [18, 19]
    ◦ Descripción: Configuración de límites y alcance para controlar la "ansia" del agente de IA, evitando que sobre-ejecute o pida confirmaciones innecesarias.
    ◦ Factores: * Presupuesto de herramientas (tool_budget): Limitar el número de llamadas a herramientas que el modelo puede realizar [18, 19]. * Persistencia: Alentar al modelo a tomar la suposición más razonable, proceder con ella y documentarla, en lugar de pedir aclaraciones constantes [19].
• revision_solicitudes_extraccion (Revisión de solicitudes de extracción/Pull Requests) [9, 20]
    ◦ Descripción: Capacidad del modelo (Codex) para revisar automáticamente los pull requests y encontrar errores.
    ◦ Factores: * Habilitación: Requiere habilitar la función de revisión de código en los repositorios [20]. * Diferente perspectiva: Los LLMs pueden detectar errores que los humanos pasan por alto, y viceversa [9].
• conocimiento_actualizado_web_browsing (Conocimiento actualizado y navegación web) [6]
    ◦ Descripción: Necesidad de que el modelo acceda a información actualizada, ya que los LLMs tienen un "corte de conocimiento" (knowledge cutoff) debido a su entrenamiento.
    ◦ Factores: * Navegación web: Esencial para obtener la documentación y la información más reciente [6]. * Investigación profunda (deep_research): Realizar búsquedas exhaustivas para proporcionar el contexto más relevante [6].
• observabilidad_logging (Observabilidad y Logging) [12, 16, 17, 19, 21, 22]
    ◦ Descripción: Inclusión de sentencias de impresión o logs para monitorear el progreso y depurar el código generado.
    ◦ Factores: * Múltiples puntos de impresión: Añadir print statements en puntos clave para entender lo que está sucediendo [12, 16, 17, 19, 22]. * Barras de carga: Implementar barras de progreso para ver el estado de las tareas asíncronas [21].
• manejo_errores (Manejo de errores) [11, 17]
    ◦ Descripción: Estrategia para identificar, entender y resolver los errores que surgen durante el uso del agente de IA.
    ◦ Factores: * No tomarlo personal: Reconocer que los errores son esperados [11]. * Análisis y solución: Explicar el error, identificar su causa y proponer una solución limpia y mínima [11].
• estrategia_chunking (Estrategia de chunking (fragmentación)) [9, 16, 21, 22]
    ◦ Descripción: Método para dividir prompts o documentos largos en fragmentos más pequeños para su procesamiento.
    ◦ Factores: * Tamaño del fragmento: Definir un rango de tokens por fragmento (ej. 2,000-4,000 tokens) [16, 21, 22]. * Respetar límites de formato: Asegurarse de que los fragmentos respeten las estructuras del formato original (ej. Markdown, encabezados, listas) [11, 21]. * Calificación de relevancia: Evaluar la relevancia de cada fragmento [9].
• pruebas_validacion (Pruebas y validación) [11, 17, 21, 23]
    ◦ Descripción: Proceso de verificar la funcionalidad y el cumplimiento de los requisitos después de cada paso o conjunto de pasos.
    ◦ Factores: * Scripts de demostración (demo_scripts): Crear pequeños scripts para probar los pasos implementados [11, 17]. * Dog fooding: Usar la propia herramienta o software para identificar errores y mejorar la experiencia de usuario [21].
• modularidad_codigo (Modularidad del código) [5, 14, 23]
    ◦ Descripción: Diseño del código con funciones separadas, pero evitando la sobre-ingeniería en proyectos simples.
    ◦ Factores: * Creación de archivos: Decidir cuándo es necesario un archivo separado para una funcionalidad y cuándo puede integrarse en uno existente [14]. * Refactorización: Mover funcionalidades entre archivos o fusionarlos cuando sea apropiado [14].
• colaboracion_agentes (Colaboración entre agentes) [13-16, 23]
    ◦ Descripción: Uso simultáneo de diferentes agentes de IA para aprovechar sus fortalezas individuales.
    ◦ Ejemplo: Codex para codificación pesada y resolución de errores complejos, y Cloud Code para explicaciones, verificación y una segunda opinión [13-15].
• integracion_entorno (Integración con el entorno) [10]
    ◦ Descripción: Configuración de las claves de API y otras variables de entorno para una interacción segura y eficiente con los modelos.
    ◦ Factores: * Archivos .env: Almacenar claves de API de forma segura en archivos .env [10]. * Gestión de claves: Crear y gestionar claves de API en la plataforma del proveedor (ej. OpenAI) [10].
• gestion_proyecto (Gestión de proyectos) [7, 8]
    ◦ Descripción: Metodologías para organizar y documentar el proceso de desarrollo con IA.
    ◦ Factores: * Plan paso a paso: Crear un plan detallado antes de iniciar la codificación [7]. * Documentación en Markdown: Documentar el contexto y el plan en archivos Markdown para fácil referencia [8]. * Control de versiones: Integración con sistemas como Git y GitHub para el control de cambios y colaboración [16, 24].