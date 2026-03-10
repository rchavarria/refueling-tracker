-- CreateTable
CREATE TABLE "Reminder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Reminder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
