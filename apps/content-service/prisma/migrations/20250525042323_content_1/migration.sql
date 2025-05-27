-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competencia" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Competencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Afirmacion" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,

    CONSTRAINT "Afirmacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoTexto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "TipoTexto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NivelComplejidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "NivelComplejidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NivelIngles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "NivelIngles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomiaBloom" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "TaxonomiaBloom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Texto" (
    "id" TEXT NOT NULL,
    "fuente" TEXT,
    "contenido" TEXT NOT NULL,
    "tipoTexto" TEXT,
    "subtipo" TEXT,
    "nivelLectura" TEXT,
    "palabrasClave" TEXT[],
    "fechaCreacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "contadorPalabras" INTEGER,
    "dificultadLexica" TEXT,
    "estado" TEXT DEFAULT 'borrador',
    "imagen" TEXT,

    CONSTRAINT "Texto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextoTaxonomiaBloom" (
    "textoId" TEXT NOT NULL,
    "taxonomiaBloomId" TEXT NOT NULL,

    CONSTRAINT "TextoTaxonomiaBloom_pkey" PRIMARY KEY ("textoId","taxonomiaBloomId")
);

-- CreateTable
CREATE TABLE "Pregunta" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "textoId" TEXT,
    "complejidad" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "justificacion" TEXT NOT NULL,
    "afirmacionId" TEXT,
    "habilidadId" TEXT,
    "taxonomiaBloom" TEXT,
    "fechaCreacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Pregunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opcion" (
    "id" TEXT NOT NULL,
    "preguntaId" TEXT NOT NULL,
    "textoOpcion" TEXT NOT NULL,
    "esCorrecta" BOOLEAN NOT NULL DEFAULT false,
    "retroalimentacion" TEXT,
    "orden" INTEGER,

    CONSTRAINT "Opcion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Competencia" ADD CONSTRAINT "Competencia_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Afirmacion" ADD CONSTRAINT "Afirmacion_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Afirmacion" ADD CONSTRAINT "Afirmacion_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "Competencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextoTaxonomiaBloom" ADD CONSTRAINT "TextoTaxonomiaBloom_textoId_fkey" FOREIGN KEY ("textoId") REFERENCES "Texto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextoTaxonomiaBloom" ADD CONSTRAINT "TextoTaxonomiaBloom_taxonomiaBloomId_fkey" FOREIGN KEY ("taxonomiaBloomId") REFERENCES "TaxonomiaBloom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_textoId_fkey" FOREIGN KEY ("textoId") REFERENCES "Texto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pregunta" ADD CONSTRAINT "Pregunta_afirmacionId_fkey" FOREIGN KEY ("afirmacionId") REFERENCES "Afirmacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opcion" ADD CONSTRAINT "Opcion_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "Pregunta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
