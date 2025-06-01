const { PrismaClient } = require('../../node_modules/.prisma/exams-client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://exams:exams@localhost:5434/exams_db?schema=public',
    },
  },
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a base de datos...');

    // Test de conexión básica
    await prisma.$connect();
    console.log('✅ Conexión exitosa');

    // Test de query básica
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query básica exitosa:', result);

    await prisma.$disconnect();
    console.log('✅ Desconexión exitosa');
  } catch (error) {
    console.error('❌ Error en conexión:', error.message);
    process.exit(1);
  }
}

testConnection();
