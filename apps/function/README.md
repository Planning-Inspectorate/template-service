# Function
This package includes and example Azure Function, which can b e used for integration. See [Create a function in Azure from the command line](https://learn.microsoft.com/en-gb/azure/azure-functions/how-to-create-function-azure-cli) for adding new functions.

## Setup

To set up your local dev environment, firstly you will need to create some config files. In `/apps/function`:

* create a `.env` file with any required config.
* create `local.settings.json` with
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true"
  }
}
```
as a starting point

* install azurite storage emulator with `npm install -g azurite`
* install azure-function-core-tools with `npm install -g azure-functions-core-tools@4`

See also [Code and test Azure Functions locally](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local?pivots=programming-language-javascript)

## Run

* Run `azurite` in a temporary directory somewhere as a storage emulator
* Run `npm run start` in `apps/function` to start the function(s)

The example function runs on a schedule and prints a message to the console