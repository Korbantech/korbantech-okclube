# Grupo ND App Server

## Requirements
---
### 1. Dependencies
- ### __Java__ >= __6__
  ```
  java -version
  ```
- ### __NodeJS__ >= __14__
  ```
  node --version
  ```
### 2. Environment Variables
- Set NodeJS environment production
  
  for production environment
  ```
  export NODE_ENV = production
  ```
  or developer environment
  ```
  export NODE_ENV = development
  ```
  __if the environment( `NODE_ENV` ) has not been defined, the server takes the form of development__.
- Download firebase file in firebase console platform.
  ```
  export GOOGLE_APPLICATION_CREDENTIALS = <firebase admin sdk path>
  ```
  __if environment variable GOOGLE_APPLICATION_CREDENTIALS has not been defined, the server the server accuses an error and kills the process__.

## Install
---
### 1. Clone repository
  ```
  git clone --single-branch --branch stable https://github.com/gitkorbantech/nd-app-server server
  ```
### 2. Go to project folder
  ```
  cd server
  ```
### 3. Install Project Dependencies
  ```
  yarn install
  ```
  or
  ```
  npm install
  ```
### 4. Start server
  ```
  yarn start:node
  ```
  or
  ```
  npm run start:node
  ```
### 5. Arguments for start server command
  |argument| required |  type  |        default value        |
  |--------|----------|--------|-----------------------------|
  | --port |    no    | number |             80              |
  | --log  |    no    | string |prod = `combined` dev = `dev`|

### 5.1 Server port `--port <server running port>`
  Default server port is 80, in production is required running in 80. __App order all on port 80__.

### 5.1 Logs types `--log <server log type>`
  Choose log model type for server. Please read [morgan documentation](http://expressjs.com/en/resources/middleware/morgan.html) for styles. Default style in production environment is [`combined`](http://expressjs.com/en/resources/middleware/morgan.html#combined) style, in anothers environments default is [`dev`](http://expressjs.com/en/resources/middleware/morgan.html#dev).

## Logs
---
- ### Database query log
  ```
  <project folder>/knex.log
  ```
- ### External request delayed for __ND subscribers__
  ```
  <project folder>/nd-error.log
  ```
- ### Server requests
  ```
  <project folder>/server.log
  ```

- ### Notifications
  ```
  <project folder>/notifications.log
  ```