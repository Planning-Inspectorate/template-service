BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PublicEvent] (
    [id] INT NOT NULL IDENTITY(1,1),
    [caseId] INT NOT NULL,
    [eventDate] DATETIME2 NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [PublicEvent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[InternalEvent] (
    [id] INT NOT NULL IDENTITY(1,1),
    [caseId] INT NOT NULL,
    [eventOwner] NVARCHAR(1000) NOT NULL,
    [eventReason] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [InternalEvent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[PublicEvent] ADD CONSTRAINT [PublicEvent_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[Case]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[InternalEvent] ADD CONSTRAINT [InternalEvent_caseId_fkey] FOREIGN KEY ([caseId]) REFERENCES [dbo].[Case]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
