const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function loadJSON(fileName) {
  try {
    const filePath = path.join(__dirname, 'exampleData', fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error loading ${fileName}:`, e);
    return null;
  }
}

async function seed() {
  const prisma = new PrismaClient();
  try {
    console.log('Seeding data...');
    const areasData = loadJSON('areas.json');
    const competenciasData = loadJSON('competencias.json');
    const afirmacionesData = loadJSON('afirmaciones.json');
    const tiposTextosData = loadJSON('tiposTextos.json');
    const textosData = loadJSON('textos.json');
    const taxonomiaBloomData = loadJSON('taxonomiaBloom.json');
    const preguntasData = loadJSON('preguntas.json');
    const opcionesData = loadJSON('opciones.json');
    const nivelesData = loadJSON('nivelesComplejidad.json');

    if (areasData?.areas) {
      for (const a of areasData.areas) {
        await prisma.area.upsert({ where: { id: a.id }, update: a, create: a });
      }
      console.log(`${areasData.areas.length} areas seeded`);
    }
    if (taxonomiaBloomData?.taxonomiaBloom) {
      for (const b of taxonomiaBloomData.taxonomiaBloom) {
        await prisma.taxonomiaBloom.upsert({
          where: { id: b.id },
          update: b,
          create: b,
        });
      }
      console.log(
        `${taxonomiaBloomData.taxonomiaBloom.length} Bloom items seeded`
      );
    }
    if (competenciasData?.competencias) {
      for (const c of competenciasData.competencias) {
        await prisma.competencia.upsert({
          where: { id: c.id },
          update: c,
          create: c,
        });
      }
      console.log(
        `${competenciasData.competencias.length} competencias seeded`
      );
    }
    if (afirmacionesData?.afirmaciones) {
      for (const f of afirmacionesData.afirmaciones) {
        await prisma.afirmacion.upsert({
          where: { id: f.id },
          update: f,
          create: f,
        });
      }
      console.log(
        `${afirmacionesData.afirmaciones.length} afirmaciones seeded`
      );
    }
    if (tiposTextosData?.tiposTexto) {
      for (const t of tiposTextosData.tiposTexto) {
        await prisma.tipoTexto.upsert({
          where: { id: t.id },
          update: t,
          create: t,
        });
      }
      console.log(`${tiposTextosData.tiposTexto.length} tipos texto seeded`);
    }
    if (nivelesData?.nivelesComplejidad) {
      for (const n of nivelesData.nivelesComplejidad) {
        await prisma.nivelComplejidad.upsert({
          where: { id: n.id },
          update: n,
          create: n,
        });
      }
      console.log(
        `${nivelesData.nivelesComplejidad.length} niveles complejidad seeded`
      );
    }
    if (nivelesData?.nivelesIngles) {
      for (const n of nivelesData.nivelesIngles) {
        await prisma.nivelIngles.upsert({
          where: { id: n.id },
          update: n,
          create: n,
        });
      }
      console.log(`${nivelesData.nivelesIngles.length} niveles ingles seeded`);
    }
    if (textosData?.textos) {
      let cnt = 0;
      for (const t of textosData.textos) {
        if (t.id && t.contenido) {
          await prisma.texto.upsert({
            where: { id: t.id },
            update: { contenido: t.contenido, ...t },
            create: t,
          });
          cnt++;
        }
      }
      console.log(`${cnt} textos seeded`);
    }
    if (preguntasData?.preguntas) {
      let cnt = 0;
      for (const p of preguntasData.preguntas) {
        if (p.id) {
          await prisma.pregunta.upsert({
            where: { id: p.id },
            update: p,
            create: p,
          });
          cnt++;
        }
      }
      console.log(`${cnt} preguntas seeded`);
    }
    if (opcionesData?.opciones) {
      let cnt = 0;
      for (const o of opcionesData.opciones) {
        if (o.id) {
          await prisma.opcion.upsert({
            where: { id: o.id },
            update: o,
            create: o,
          });
          cnt++;
        }
      }
      console.log(`${cnt} opciones seeded`);
    }
    console.log('Seed completed');
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
