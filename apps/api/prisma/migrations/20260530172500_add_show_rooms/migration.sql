-- CreateTable
CREATE TABLE "public"."show_rooms" (
    "id" BIGSERIAL NOT NULL,
    "country_id" BIGINT NOT NULL,
    "phone_code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "url" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "show_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."show_rooms_translations" (
    "id" BIGSERIAL NOT NULL,
    "record_id" BIGINT NOT NULL,
    "lang_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "show_rooms_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "show_rooms_country_id_idx" ON "public"."show_rooms"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "show_rooms_translations_record_id_lang_id_key" ON "public"."show_rooms_translations"("record_id", "lang_id");

-- AddForeignKey
ALTER TABLE "public"."show_rooms" ADD CONSTRAINT "show_rooms_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."show_rooms_translations" ADD CONSTRAINT "show_rooms_translations_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "public"."show_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
