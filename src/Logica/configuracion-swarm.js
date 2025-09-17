const { Swarm, Agent } = require('openai-swarm-node');
require('dotenv').config();

const swarm = new Swarm(
    api_Key = process.env.OPENAI_API_KEY // Reemplaza con tu clave API realapi_Key: OPENAI_CONFIG.apiKey,
);


// Agente especializado en sucursales
const agenteSucursal = new Agent('AgenteSucursal', `
  Eres un especialista en sucursales que maneja:
  - Información de ubicaciones
  - Detalles del personal
  - Horarios de sucursales
  - Servicios locales
  - Gestión de instalaciones
`);

// Agente especializado en cursos con integración Notion
const agenteCursos = new Agent('AgenteCursos', `
  Eres un especialista en gestión de cursos que:
  - Consulta el catálogo de cursos en Notion
  - Gestiona procesos de inscripción
  - Administra horarios y requisitos
  - Procesa consultas sobre cursos
  - Hace seguimiento del estado de cursos
`);

// Agente especializado en productos
const agenteProductos = new Agent('AgenteProductos', `
  Eres un especialista en productos enfocado en:
  - Gestión del catálogo de productos
  - Seguimiento de inventario
  - Información de precios
  - Especificaciones de productos
  - Verificación de disponibilidad
`);

// Agente para consultas internas
const agenteInterno = new Agent('AgenteInterno', `
  Eres un especialista en operaciones internas que maneja:
  - Comunicaciones del personal
  - Procedimientos internos
  - Preguntas sobre políticas
  - Coordinación entre departamentos
  - Gestión de recursos
`);
