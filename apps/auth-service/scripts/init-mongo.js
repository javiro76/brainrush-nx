// Script para inicializar el replica set de MongoDB
print('Iniciando configuración de MongoDB replica set...');

// Esperar a que MongoDB esté disponible
sleep(2000);

// Inicializar el replica set
rs.initiate({
  _id: 'rs0',
  members: [{ _id: 0, host: 'localhost:27017' }],
});

// Esperar a que el replica set esté completamente configurado
sleep(2000);

print('Configuración del replica set completada');
