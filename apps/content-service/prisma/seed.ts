import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Función para leer los archivos JSON de ejemplo
const loadJSON = (fileName: string) => {
  try {
    const filePath = path.join(__dirname, '..', 'exampleData', fileName);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error al leer archivo ${fileName}:`, error);
    return null;
  }
};

// Función principal para sembrar datos
async function seed() {
  const prisma = new PrismaClient();

  try {
    console.log('Iniciando proceso de sembrado de datos...');

    // Cargar datos de los archivos JSON
    const areasData = loadJSON('areas.json');
    const competenciasData = loadJSON('competencias.json');
    const afirmacionesData = loadJSON('afirmaciones.json');
    const tiposTextosData = loadJSON('tiposTextos.json');
    const textosData = loadJSON('textos.json');
    const taxonomiaBloomData = loadJSON('taxonomiaBloom.json');
    const preguntasData = loadJSON('preguntas.json');
    const opcionesData = loadJSON('opciones.json');
    const nivelesComplejidadData = loadJSON('nivelesComplejidad.json');

    // Sembrar datos de Áreas
    if (areasData && areasData.areas) {
      console.log('Sembrando áreas...');
      for (const area of areasData.areas) {
        await prisma.area.upsert({
          where: { id: area.id },
          update: area,
          create: area,
        });
      }
      console.log(`${areasData.areas.length} áreas sembradas`);
    }

    // Sembrar datos de Taxonomía Bloom
    if (taxonomiaBloomData && taxonomiaBloomData.taxonomiaBloom) {
      console.log('Sembrando taxonomía Bloom...');
      for (const bloom of taxonomiaBloomData.taxonomiaBloom) {
        await prisma.taxonomiaBloom.upsert({
          where: { id: bloom.id },
          update: bloom,
          create: bloom,
        });
      }
      console.log(`${taxonomiaBloomData.taxonomiaBloom.length} elementos de taxonomía Bloom sembrados`);
    }

    // Sembrar datos de Competencias
    if (competenciasData && competenciasData.competencias) {
      console.log('Sembrando competencias...');
      for (const competencia of competenciasData.competencias) {
        await prisma.competencia.upsert({
          where: { id: competencia.id },
          update: competencia,
          create: competencia,
        });
      }
      console.log(`${competenciasData.competencias.length} competencias sembradas`);
    }

    // Sembrar datos de Afirmaciones
    if (afirmacionesData && afirmacionesData.afirmaciones) {
      console.log('Sembrando afirmaciones...');
      for (const afirmacion of afirmacionesData.afirmaciones) {
        await prisma.afirmacion.upsert({
          where: { id: afirmacion.id },
          update: afirmacion,
          create: afirmacion,
        });
      }
      console.log(`${afirmacionesData.afirmaciones.length} afirmaciones sembradas`);
    }

    // Sembrar datos de Tipos de Texto
    if (tiposTextosData && tiposTextosData.tiposTexto) {
      console.log('Sembrando tipos de texto...');
      for (const tipoTexto of tiposTextosData.tiposTexto) {
        await prisma.tipoTexto.upsert({
          where: { id: tipoTexto.id },
          update: tipoTexto,
          create: tipoTexto,
        });
      }
      console.log(`${tiposTextosData.tiposTexto.length} tipos de texto sembrados`);
    }

    // Sembrar datos de Niveles de Complejidad
    if (nivelesComplejidadData && nivelesComplejidadData.nivelesComplejidad) {
      console.log('Sembrando niveles de complejidad...');
      for (const nivel of nivelesComplejidadData.nivelesComplejidad) {
        await prisma.nivelComplejidad.upsert({
          where: { id: nivel.id },
          update: nivel,
          create: nivel,
        });
      }
      console.log(`${nivelesComplejidadData.nivelesComplejidad.length} niveles de complejidad sembrados`);
    }

    // Sembrar datos de Niveles de Inglés
    if (nivelesComplejidadData && nivelesComplejidadData.nivelesIngles) {
      console.log('Sembrando niveles de inglés...');
      for (const nivel of nivelesComplejidadData.nivelesIngles) {
        await prisma.nivelIngles.upsert({
          where: { id: nivel.id },
          update: nivel,
          create: nivel,
        });
      }
      console.log(`${nivelesComplejidadData.nivelesIngles.length} niveles de inglés sembrados`);
    }

    // Sembrar datos de Textos
    if (textosData && textosData.textos) {
      console.log('Sembrando textos...');
      let contadorTextos = 0;

      for (const texto of textosData.textos) {
        // Verificar que el texto tiene los datos mínimos requeridos
        if (texto.id && texto.contenido) {
          await prisma.texto.upsert({
            where: { id: texto.id },
            update: {
              fuente: texto.fuente || null,
              contenido: texto.contenido,
              tipoTexto: texto.tipoTexto || null,
              subtipo: texto.subtipo || null,
              nivelLectura: texto.nivelLectura || null,
              palabrasClave: texto.palabrasClave || [],
              fechaCreacion: texto.fechaCreacion ? new Date(texto.fechaCreacion) : new Date(),
              contadorPalabras: texto.contadorPalabras || null,
              dificultadLexica: texto.dificultadLexica || null,
              estado: texto.estado || 'borrador',
              imagen: texto.imagen || null,
            },
            create: {
              id: texto.id,
              fuente: texto.fuente || null,
              contenido: texto.contenido,
              tipoTexto: texto.tipoTexto || null,
              subtipo: texto.subtipo || null,
              nivelLectura: texto.nivelLectura || null,
              palabrasClave: texto.palabrasClave || [],
              fechaCreacion: texto.fechaCreacion ? new Date(texto.fechaCreacion) : new Date(),
              contadorPalabras: texto.contadorPalabras || null,
              dificultadLexica: texto.dificultadLexica || null,
              estado: texto.estado || 'borrador',
              imagen: texto.imagen || null,
            },
          });

          // Crear vinculaciones con taxonomía Bloom si existen
          if (texto.vinculaciones && texto.vinculaciones.taxonomiaBloom && texto.vinculaciones.taxonomiaBloom.length > 0) {
            for (const bloomId of texto.vinculaciones.taxonomiaBloom) {
              await prisma.textoTaxonomiaBloom.upsert({
                where: {
                  textoId_taxonomiaBloomId: {
                    textoId: texto.id,
                    taxonomiaBloomId: bloomId,
                  },
                },
                update: {},
                create: {
                  textoId: texto.id,
                  taxonomiaBloomId: bloomId,
                },
              });
            }
          }

          contadorTextos++;
        }
      }

      console.log(`${contadorTextos} textos sembrados`);
    }

    // Sembrar datos de Preguntas
    if (preguntasData && preguntasData.preguntas) {
      console.log('Sembrando preguntas...');
      let contadorPreguntas = 0;

      for (const pregunta of preguntasData.preguntas) {
        // Verificar que la pregunta tiene los datos mínimos requeridos
        if (pregunta.id && pregunta.enunciado && pregunta.areaId && pregunta.complejidad) {
          await prisma.pregunta.upsert({
            where: { id: pregunta.id },
            update: {
              areaId: pregunta.areaId,
              textoId: pregunta.textoId || null,
              complejidad: pregunta.complejidad,
              enunciado: pregunta.enunciado,
              justificacion: pregunta.justificacion || '',
              afirmacionId: pregunta.afirmacionId || null,
              habilidadId: pregunta.habilidadId || null,
              taxonomiaBloom: pregunta.taxonomiaBloom || null,
              fechaCreacion: pregunta.fechaCreacion ? new Date(pregunta.fechaCreacion) : new Date(),
              activo: pregunta.activo !== undefined ? pregunta.activo : true,
            },
            create: {
              id: pregunta.id,
              areaId: pregunta.areaId,
              textoId: pregunta.textoId || null,
              complejidad: pregunta.complejidad,
              enunciado: pregunta.enunciado,
              justificacion: pregunta.justificacion || '',
              afirmacionId: pregunta.afirmacionId || null,
              habilidadId: pregunta.habilidadId || null,
              taxonomiaBloom: pregunta.taxonomiaBloom || null,
              fechaCreacion: pregunta.fechaCreacion ? new Date(pregunta.fechaCreacion) : new Date(),
              activo: pregunta.activo !== undefined ? pregunta.activo : true,
            },
          });

          contadorPreguntas++;
        }
      }
      console.log(`${contadorPreguntas} preguntas sembradas`);
    }

    // Sembrar datos de Opciones
    if (opcionesData && opcionesData.opciones) {
      console.log('Sembrando opciones...');
      let contadorOpciones = 0;

      for (const opcion of opcionesData.opciones) {
        // Verificar que la opción tiene los datos mínimos requeridos
        if (opcion.id && opcion.preguntaId && opcion.contenido !== undefined) {
          await prisma.opcion.upsert({
            where: { id: opcion.id },
            update: {
              preguntaId: opcion.preguntaId,
              textoOpcion: opcion.texto || opcion.contenido,
              esCorrecta: opcion.esCorrecta || false,
              retroalimentacion: opcion.retroalimentacion || opcion.explicacion || null,
              orden: opcion.orden || 0,
            },
            create: {
              id: opcion.id,
              preguntaId: opcion.preguntaId,
              textoOpcion: opcion.texto || opcion.contenido,
              esCorrecta: opcion.esCorrecta || false,
              retroalimentacion: opcion.retroalimentacion || opcion.explicacion || null,
              orden: opcion.orden || 0,
            },
          });

          contadorOpciones++;
        }
      }

      console.log(`${contadorOpciones} opciones sembradas`);
    }

    console.log('Proceso de sembrado completado exitosamente');
  } catch (error) {
    console.error('Error durante el proceso de sembrado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función de sembrado
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log('Finalizando proceso de sembrado');
  });
