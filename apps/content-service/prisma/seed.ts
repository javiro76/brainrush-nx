// Para evitar problemas con las rutas de importación, usamos require dinámico para Prisma
import * as fs from 'fs';
import * as path from 'path';

// Importamos los tipos para cada entidad
interface Area {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Competencia {
  id: string;
  areaId: string;
  nombre: string;
  descripcion: string;
}

interface Afirmacion {
  id: string;
  areaId: string;
  numero: number;
  descripcion: string;
  tipo: string;
  competenciaId: string;
}

interface TipoTexto {
  id: string;
  nombre: string;
  descripcion: string;
}

interface NivelComplejidad {
  id: string;
  nombre: string;
  descripcion: string;
}

interface NivelIngles {
  id: string;
  nombre: string;
  descripcion: string;
}

interface TaxonomiaBloom {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Texto {
  id: string;
  fuente?: string;
  contenido: string;
  tipoTexto?: string;
  subtipo?: string;
  nivelLectura?: string;
  palabrasClave: string[];
  fechaCreacion?: string | Date;
  contadorPalabras?: number;
  dificultadLexica?: string;
  estado?: string;
  imagen?: any;
  vinculaciones?: {
    afirmaciones: string[];
    competencias: string[];
    taxonomiaBloom: string[];
  };
}

interface Pregunta {
  id: string;
  areaId: string;
  textoId?: string;
  complejidad: string;
  enunciado: string;
  justificacion: string;
  afirmacionId?: string;
  habilidadId?: string;
  taxonomiaBloom?: string;
  fechaCreacion?: string | Date;
  activo: boolean;
}

interface Opcion {
  id: string;
  preguntaId: string;
  clave?: string;
  texto: string;
  correcta: boolean;
  retroalimentacion?: string;
}

// Función para cargar los archivos JSON
function loadJsonFile<T>(filePath: string): T {
  const absolutePath = path.resolve(__dirname, filePath);
  console.log(`Cargando datos desde: ${absolutePath}`);
  const fileContent = fs.readFileSync(absolutePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Usar path directo a la salida del cliente de Prisma para evitar problemas con la configuración Nx
const { PrismaClient } = require('../../../node_modules/.prisma/content-client');
const prisma = new PrismaClient();

// Función principal de seeding
async function main() {
  console.log('🌱 Iniciando proceso de seeding...');

  try {
    // 1. Seed Areas
    console.log('Sembrando Áreas...');
    const areasData = loadJsonFile<{ areas: Area[] }>('./seeds/areas.json');
    for (const area of areasData.areas) {
      await prisma.area.upsert({
        where: { id: area.id },
        update: area,
        create: area,
      });
    }

    // 2. Seed TipoTexto
    console.log('Sembrando Tipos de Texto...');
    const tiposTextoData = loadJsonFile<{ tiposTexto: TipoTexto[] }>('./seeds/tiposTextos.json');
    for (const tipoTexto of tiposTextoData.tiposTexto) {
      await prisma.tipoTexto.upsert({
        where: { id: tipoTexto.id },
        update: tipoTexto,
        create: tipoTexto,
      });
    }

    // 3. Seed NivelesComplejidad y NivelesIngles
    console.log('Sembrando Niveles de Complejidad e Inglés...');
    const nivelesData = loadJsonFile<{
      nivelesComplejidad: NivelComplejidad[];
      nivelesIngles: NivelIngles[];
    }>('./seeds/nivelesComplejidad.json');

    for (const nivel of nivelesData.nivelesComplejidad) {
      await prisma.nivelComplejidad.upsert({
        where: { id: nivel.id },
        update: nivel,
        create: nivel,
      });
    }

    for (const nivel of nivelesData.nivelesIngles) {
      await prisma.nivelIngles.upsert({
        where: { id: nivel.id },
        update: nivel,
        create: nivel,
      });
    }

    // 4. Seed TaxonomiaBloom
    console.log('Sembrando Taxonomía de Bloom...');
    const taxonomiaBloomData = loadJsonFile<{ taxonomiaBloom: TaxonomiaBloom[] }>('./seeds/taxonomiaBloom.json');
    for (const taxonomia of taxonomiaBloomData.taxonomiaBloom) {
      await prisma.taxonomiaBloom.upsert({
        where: { id: taxonomia.id },
        update: taxonomia,
        create: taxonomia,
      });
    }

    // 5. Seed Competencias (dependen de Áreas)
    console.log('Sembrando Competencias...');
    const competenciasData = loadJsonFile<{ competencias: Competencia[] }>('./seeds/competencias.json');
    for (const competencia of competenciasData.competencias) {
      await prisma.competencia.upsert({
        where: { id: competencia.id },
        update: competencia,
        create: competencia,
      });
    }

    // 6. Seed Afirmaciones (dependen de Áreas y Competencias)
    console.log('Sembrando Afirmaciones...');
    const afirmacionesData = loadJsonFile<{ afirmaciones: Afirmacion[] }>('./seeds/afirmaciones.json');
    for (const afirmacion of afirmacionesData.afirmaciones) {
      await prisma.afirmacion.upsert({
        where: { id: afirmacion.id },
        update: afirmacion,
        create: afirmacion,
      });
    }

    // 7. Seed Textos
    console.log('Sembrando Textos...');
    const textosData = loadJsonFile<{ textos: Texto[] }>('./seeds/textos.json');
    for (const texto of textosData.textos) {
      // Extraer las vinculaciones para procesarlas después
      const vinculaciones = texto.vinculaciones;

      // Eliminar vinculaciones del objeto para la creación del texto
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { vinculaciones: _, ...textoData } = texto;
      // Crear fecha si viene como string
      if (typeof textoData.fechaCreacion === 'string') {
        textoData.fechaCreacion = new Date(textoData.fechaCreacion);
      }

      // Convertir el campo imagen a JSON string si es un objeto
      if (textoData.imagen && typeof textoData.imagen === 'object') {
        textoData.imagen = JSON.stringify(textoData.imagen);
      }

      // Crear/actualizar el texto
      await prisma.texto.upsert({
        where: { id: textoData.id },
        update: textoData,
        create: textoData,
      });

      // Procesar vinculaciones de taxonomía de Bloom si existen
      if (vinculaciones && vinculaciones.taxonomiaBloom) {
        // Primero eliminar vinculaciones existentes para este texto
        await prisma.textoTaxonomiaBloom.deleteMany({
          where: {
            textoId: textoData.id
          }
        });

        // Crear nuevas vinculaciones
        for (const taxonomiaId of vinculaciones.taxonomiaBloom) {
          await prisma.textoTaxonomiaBloom.create({
            data: {
              textoId: textoData.id,
              taxonomiaBloomId: taxonomiaId
            }
          });
        }
      }
    }

    // 8. Seed Preguntas (dependen de Áreas, Textos, Afirmaciones)
    console.log('Sembrando Preguntas...');
    const preguntasData = loadJsonFile<{ preguntas: Pregunta[] }>('./seeds/preguntas.json');
    for (const pregunta of preguntasData.preguntas) {
      // Crear fecha si viene como string
      if (typeof pregunta.fechaCreacion === 'string') {
        pregunta.fechaCreacion = new Date(pregunta.fechaCreacion);
      }

      await prisma.pregunta.upsert({
        where: { id: pregunta.id },
        update: pregunta,
        create: pregunta,
      });
    }

    // 9. Seed Opciones (dependen de Preguntas)
    console.log('Sembrando Opciones...');
    const opcionesData = loadJsonFile<{ opciones: Opcion[] }>('./seeds/opciones.json');
    for (const opcionRaw of opcionesData.opciones) {
      // Transformar la estructura para que coincida con el esquema
      const opcion = {
        id: opcionRaw.id,
        preguntaId: opcionRaw.preguntaId,
        textoOpcion: opcionRaw.texto,
        esCorrecta: opcionRaw.correcta,
        retroalimentacion: opcionRaw.retroalimentacion,
        orden: opcionRaw.clave ? opcionRaw.clave.charCodeAt(0) - 65 : undefined // Convertir A, B, C, D a 0, 1, 2, 3
      };

      await prisma.opcion.upsert({
        where: { id: opcion.id },
        update: opcion,
        create: opcion,
      });
    }

    console.log('✅ Proceso de seeding completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el proceso de seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función principal
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
