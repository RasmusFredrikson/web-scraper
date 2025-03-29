# web-scraper

## Prerequisites

1. Install Azure functions (optional, only for local development)
   - `brew tap azure/functions`
   - `brew install azure-functions-core-tools@4`
2. Install Azure CLI
   - `brew install azure-cli`
3. Add `.env` in root

## Deployment

1. `az login --tenant a170f564-a428-4aa2-825e-4372baf4cd33`
2. Select web-scraper subscription
3. `npm run publish-func`

## To run locally

1. `npx azurite`
2. `npm run dev`
