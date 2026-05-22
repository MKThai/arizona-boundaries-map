-- CreateTable
CREATE TABLE "officials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "chamber" TEXT,
    "district" TEXT,
    "image_url" TEXT,
    "branch" TEXT NOT NULL DEFAULT 'executive',
    "state" TEXT NOT NULL DEFAULT 'AZ',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "officials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_logs" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "record_count" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "scrape_logs_pkey" PRIMARY KEY ("id")
);
