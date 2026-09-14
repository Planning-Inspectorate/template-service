/*
  Warnings:

  - Added the required column `description` to the `InternalEvent` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[InternalEvent] ALTER COLUMN [eventOwner] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[InternalEvent] ALTER COLUMN [eventReason] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[InternalEvent] ADD [description] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PublicEvent] ALTER COLUMN [eventDate] DATETIME2 NULL;
ALTER TABLE [dbo].[PublicEvent] ADD [publicised] BIT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
