El Spec Kit es un kit de herramientas diseñado para ayudar a comenzar con el **Desarrollo Dirigido por Especificaciones** (Spec-Driven Development). La instalación se realiza mediante la herramienta principal: **Specify CLI**.

A continuación, se detalla cómo instalar Spec Kit, comenzando por los requisitos previos y luego las opciones de instalación.

### 🔧 Prerrequisitos

Para instalar y utilizar Spec Kit, necesita cumplir con los siguientes requisitos:

1.  **Sistema Operativo:** Debe usar **Linux/macOS** (o WSL2 en Windows).
2.  **Herramientas de Agente AI:** Un agente de codificación AI compatible, como Claude Code, GitHub Copilot, Gemini CLI, Cursor, Qwen CLI, opencode, Codex CLI o Windsurf.
3.  **Gestor de Paquetes:** **`uv`** para la gestión de paquetes.
4.  **Lenguaje de Programación:** **Python 3.11+**.
5.  **Control de Versiones:** **Git**.

### ⚡ Opciones de Instalación del Specify CLI

Existen dos métodos principales para instalar Specify CLI:

#### Opción 1: Instalación Persistente (Recomendada)

Esta opción instala la herramienta una sola vez para que pueda utilizarla en cualquier lugar.

1.  **Comando de Instalación:** Utilice `uv tool install` para instalar `specify-cli` desde el repositorio de GitHub:

    ```bash
    uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
    ```
    Una vez instalado, la herramienta permanece instalada y disponible en su PATH.

2.  **Uso Post-Instalación:** Después de la instalación persistente, puede usar la herramienta directamente con los siguientes comandos:

    ```bash
    specify init < PROJECT_NAME >
    specify check
    ```

**Beneficios de la instalación persistente**:
*   La herramienta permanece instalada y disponible en PATH.
*   No es necesario crear alias de shell.
*   Mejor gestión de la herramienta con comandos como `uv tool list`, `uv tool upgrade` y `uv tool uninstall`.
*   Configuración de shell más limpia.

#### Opción 2: Uso Único (One-time Usage)

Este método permite ejecutar la herramienta directamente sin necesidad de una instalación persistente:

*   **Comando de Uso Único:**

    ```bash
    uvx --from git+https://github.com/github/spec-kit.git specify init < PROJECT_NAME >
    ```

### 🔨 Inicialización de Proyectos con `specify init`

Después de instalar `specify-cli`, el comando clave para comenzar un proyecto es `specify init`. Este comando inicializa un nuevo proyecto Specify a partir de la última plantilla y trae los artefactos requeridos a su entorno.

#### Ejemplos de Inicialización:

| Tarea | Comando de Ejemplo | Fuente |
| :--- | :--- | :--- |
| Inicialización básica de un proyecto | `specify init my-project` | |
| Inicialización en el directorio actual | `specify init .` (o usar la bandera `--here`) | |
| Inicializar y especificar un asistente AI | `specify init my-project --ai claude` | |
| Inicializar con scripts de PowerShell (Windows) | `specify init my-project --ai copilot --script ps` | |
| Forzar la fusión/sobrescritura en un directorio (sin confirmación) | `specify init . --force --ai copilot` | |
| Omitir la inicialización de Git | `specify init my-project --ai gemini --no-git` | |
| Omitir la verificación de herramientas del agente AI | `specify init < project_name > --ai claude --ignore-agent-tools` | |

Si omite la especificación del agente AI al usar `specify init`, se le pedirá que lo seleccione.

Una vez que ejecuta `specify init`, el CLI verifica si tiene las herramientas del agente AI necesarias instaladas. Si prefiere obtener las plantillas sin verificar las herramientas, puede usar la bandera **`--ignore-agent-tools`**.

Una vez que el proyecto se inicializa, su agente de codificación AI tendrá acceso a comandos slash (`/`) para el desarrollo estructurado, como `/constitution`, `/specify`, `/plan`, `/tasks` y `/implement`.