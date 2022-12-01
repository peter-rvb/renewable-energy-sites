# Renewable Energy Sites

An app to visualise renewable energy sites information stored in Workday Extend. This app demonstrates building a custom Javascript UI with the [React](https://create-react-app.dev) framework that brings [Workday Extend](https://developer.workday.com) capabilities to non-Workday systems and applications. The app uses [Workday Canvas Kit](https://workday.github.io/canvas-kit) UI components to give the app the look and feel of the Workday UI. 

Multiple [App Examples](src/app-examples) can be contained in this project to demonstrate the art of the possible. An example for [Renewable Energy Sites](src/app-examples/energy-sites) is used which includes use of the [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api) package to visualise address information provided by Workday Extend model objects in a Google Map.

[Create React App](https://create-react-app.dev/) is used for managing the project.

Please note this project is for demonstration and educational purposes, and is not officially supported by Workday as a production-ready application.

[Reference GitHub repo](https://github.com/Workday/extend-js-example).

![SiteLocator](https://user-images.githubusercontent.com/96547808/202520097-e972e47d-3b62-49f6-a4b1-fc26564f73a0.png)

## Deploying locally

### Prerequisites

- [Node.js](https://nodejs.org/en)
- Workday Cloud Platform Developer Account & Developer Tenant ([Workday Extend](https://developer.workday.com) subscription required)
- To use the Google Maps component, please follow the [instructions here](https://developers.google.com/maps/documentation/javascript/get-api-key#:~:text=Go%20to%20the%20Google%20Maps%20Platform%20%3E%20Credentials%20page.&text=On%20the%20Credentials%20page%2C%20click,Click%20Close.) to generate a API key. Make note of this as you will need to add this to your .env file. 

### Setup

1. Clone or fork this repository.
2. Run `npm install` in the project root directory to install dependencies.
3. Create a [Workday Cloud Platform API Client](https://developer.workday.com/console/clients/create) with the following values:
   - **Name**: JavaScript App Example
   - **Redirect URI**: http://localhost:3000/authorize
   - **Authorized CORS Domains**: http://localhost:3000
   - **_Note_**: You will need to add **Scopes** to this API Client later, depending on which App Examples you wish to configure or what Workday API's you will be connecting to for your own project.
4. Modify the `.env` file in project root to set the **REACT_APP_WCP_API_CLIENT_ID** value to the API Client ID created in the previous step (ex. `REACT_APP_WCP_API_CLIENT_ID=ZDMzN...`)
   - _Note_: You can optionally set the **REACT_APP_WCP_DEFAULT_TENANT_ALIAS** value to the WCP tenant alias for the tenant you want to use, enabling users to bypass providing a tenant alias when authenticating.
5. Run `npm start` to launch the app. Your app should become available at `http://localhost:3000`.
6. Authorize the app against your Developer Tenant by clicking **Login** in the app.

## Deploying to AWS Amplify

### Setup [WIP]

1. Follow the AWS Amplify instructions for [Getting started with existing code](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html). 
2. Configure environment variables as instructed [here](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html). 
3. Create a [Workday Cloud Platform API Client](https://developer.workday.com/console/clients/create) with the following values:
   - **Name**: JavaScript App Example - AWS Amplify
   - **Redirect URI**: http://localhost:3000/authorize
   - **Authorized CORS Domains**: \[AWS Amplify domain\]
4. Amend the [Build Settings](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html) of the deployment as follows with the following amplify.yml file:

```
version: 1
frontend:
  phases:
    build:
      commands:
        - npm install --legacy-peer-deps
        - NODE_PATH=${NODE_PATH}
        - REACT_APP_WCP_API_GATEWAY_HOST=${REACT_APP_WCP_API_GATEWAY_HOST}
        - REACT_APP_WCP_API_CLIENT_ID=${REACT_APP_WCP_API_CLIENT_ID}
        - REACT_APP_WCP_API_CLIENT_REDIRECT_URI=${REACT_APP_WCP_API_CLIENT_REDIRECT_URI}
        - REACT_APP_WCP_DEFAULT_TENANT_ALIAS=${REACT_APP_WCP_DEFAULT_TENANT_ALIAS}
        - REACT_APP_EXTEND_APP_REFERENCE_ID_ENERGY_SITES=${REACT_APP_EXTEND_APP_REFERENCE_ID_ENERGY_SITES}
        - REACT_APP_GOOGLE_MAPS_API_KEY=${REACT_APP_GOOGLE_MAPS_API_KEY}
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```
5. Proceed to deploy your application. 

NOTE: you will run into an error in the authentication flow using the above setup. Once logged in, replace everything before ```authorize/``` with the AWS Amplify domain to resume using the app whilst the authentication session is active. **This is a workaround and a solution will be coming soon!** 
