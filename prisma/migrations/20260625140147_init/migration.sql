-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "client_key" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "burst" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bucket_state" (
    "client_key" TEXT NOT NULL,
    "tokens" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_refill" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bucket_state_pkey" PRIMARY KEY ("client_key")
);

-- CreateTable
CREATE TABLE "request_logs" (
    "id" UUID NOT NULL,
    "client_key" TEXT NOT NULL,
    "request_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_client_key_key" ON "clients"("client_key");

-- CreateIndex
CREATE INDEX "request_logs_client_key_request_time_idx" ON "request_logs"("client_key", "request_time");

-- CreateIndex
CREATE INDEX "request_logs_request_time_idx" ON "request_logs"("request_time");

-- AddForeignKey
ALTER TABLE "bucket_state" ADD CONSTRAINT "bucket_state_client_key_fkey" FOREIGN KEY ("client_key") REFERENCES "clients"("client_key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_logs" ADD CONSTRAINT "request_logs_client_key_fkey" FOREIGN KEY ("client_key") REFERENCES "clients"("client_key") ON DELETE CASCADE ON UPDATE CASCADE;
