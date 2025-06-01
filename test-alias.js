try {
  const { PrismaClient } = require('@prisma/exams-client');
  console.log('✅ Alias @prisma/exams-client funciona correctamente');
} catch (e) {
  console.log('❌ Error con alias:', e.message);
}
