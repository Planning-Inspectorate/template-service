BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Case] (
    [id] INT NOT NULL IDENTITY(1,1),
    [reference] NVARCHAR(1000) NOT NULL,
    [applicantCount] INT NOT NULL,
    [submissionDate] DATETIME2,
    [description] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Case_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Case_reference_key] UNIQUE NONCLUSTERED ([reference])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
