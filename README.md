# [express-graphql-mongodb-boilerplate](https://github.com/watscho/express-graphql-mongodb-boilerplate)

## Authentication from scratch

### Sign In, Sign Up, Reset Password, Change Password, Update User

### E-mail verification, Multi language, Redis for token blacklisting

### Package list

| Package                    | Description                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @hapi/bounce               | Selective error catching and rewrite rules                                                                                                                                                                                                                                                                                                                            |
| bcryptjs                   | Optimized bcrypt in JavaScript with zero dependencies. Compatible to the C++ bcrypt binding on node.js and also working in the browser.                                                                                                                                                                                                                               |
| body-parser                | Node.js body parsing middleware.                                                                                                                                                                                                                                                                                                                                      |
| cors                       | CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.                                                                                                                                                                                                                                            |
| crypto-random-string       | Generate a cryptographically strong random string                                                                                                                                                                                                                                                                                                                     |
| dotenv                     | Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology.                                                                                                                                                     |
| express                    | Fast, unopinionated, minimalist web framework for node.                                                                                                                                                                                                                                                                                                               |
| express-graphql            | Create a GraphQL HTTP server with any HTTP web framework that supports connect styled middleware, including Connect itself, Express and Restify.                                                                                                                                                                                                                      |
| graphql                    | The JavaScript reference implementation for GraphQL, a query language for APIs created by Facebook.                                                                                                                                                                                                                                                                   |
| graphql-compose            | GraphQL – is a query language for APIs. graphql-js is the reference implementation of GraphQL for nodejs which introduce GraphQL type system for describing schema (definition over configuration) and executes queries on the server side. express-graphql is a HTTP server which gets request data, passes it to graphql-js and returned result passes to response. |
| graphql-compose-mongoose   | This is a plugin for graphql-compose, which derives GraphQLType from your mongoose model. Also derives bunch of internal GraphQL Types. Provide all CRUD resolvers, including graphql connection, also provided basic search via operators ($lt, $gt and so on).                                                                                                      |
| i18next                    | i18next is a very popular internationalization framework for browser or any other javascript environment (eg. node.js).                                                                                                                                                                                                                                               |
| i18next-express-middleware | This is a middleware to use i18next in express.js.                                                                                                                                                                                                                                                                                                                    |
| ioredis                    | A robust, performance-focused and full-featured Redis client for Node.js.                                                                                                                                                                                                                                                                                             |
| jsonwebtoken               | This was developed against draft-ietf-oauth-json-web-token-08. It makes use of node-jws                                                                                                                                                                                                                                                                               |
| module-alias               | Create aliases of directories and register custom module paths in NodeJS like a boss!                                                                                                                                                                                                                                                                                 |
| moment                     | A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.                                                                                                                                                                                                                                                                    |
| mongoose                   | Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. Mongoose supports both promises and callbacks.                                                                                                                                                                                                                            |
| nodemailer                 | Send e-mails from Node.js – easy as cake!                                                                                                                                                                                                                                                                                                                             |
| validator                  | A library of string validators and sanitizers.                                                                                                                                                                                                                                                                                                                        |
| winston                    | A logger for just about everything.                                                                                                                                                                                                                                                                                                                                   |

### Redis

_Mac (using [homebrew](http://brew.sh/)):_

```bash
brew install redis
```

_Linux:_

```bash
sudo apt-get install redis-server
```

### COPY .env.example to .env

```bash
cp .env.example .env
```

**Note:** I highly recommend installing [nodemon](https://github.com/remy/nodemon).

nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
nodemon does not require any additional changes to your code or method of development. nodemon is a replacement wrapper for `node`, to use `nodemon` replace the word `node` on the command line when executing your script.
`npm install -g nodemon`.

### API Start

```bash
npm run start
npm run start:local # with nodemon
```

### Docker compose

```bash
docker-compose up -d --build
docker-compose -f docker-compose.dev.yml up --build # with nodemon
```

### ESlint Start

```bash
npm run lint
npm run lint:write # with prefix --fix
```

### Project structure

```bash
├─ src
│  ├─ graphql
│  │  ├─ index.js
│  │  ├─ schema.js
│  │  └─ types.js
│  ├─ i18next
│  │  ├─ locales
│  │  │  ├─  en.json
│  │  │  └─  ge.json
│  │  └─ index.js
│  ├─ middleware
│  │  ├─ authentication.js
│  │  ├─ authMiddleware.js
│  │  └─  index.js
│  ├─ module
│  │  ├─ auth
│  │  │  ├─ mail
│  │  │  │  ├─ index.js
│  │  │  │  └─ userMail.js
│  │  │  ├─ service
│  │  │  │  ├─ index.js
│  │  │  │  └─ userService.js
│  │  │  ├─ index.js
│  │  │  ├─ resolvers.js
│  │  │  ├─ types.js
│  │  │  └─ user.js
│  │  └─ index.js
│  ├─ service
│  │  ├─ logger.js
│  │  └─ nodemailer.js
│  ├─ validator
│  │  ├─ index.js
│  │  └─ userValidator.js
│  ├─ index.js
│  ├─ mongoose.js
│  └─ redis.js
├─ .dockerignore
├─ .env.example
├─ .eslintignore
├─ .eslint
├─ .gitignore
├─ Dockerfile
├─ Dockerfile.dev
├─ README.md
├─ docker-compose.dev.yml
├─ docker-compose.yml
└─ package.json
```

## Queries

```graphql
query user {
  user {
    _id
    email
    firstName
    lastName
    locale
    account {
      verification {
        verified
      }
    }
    updatedAt
    createdAt
  }
}
```

## Mutations

```graphql
mutation signIn($email: String!, $password: String!) {
  signIn(email: $email, password: $password) {
    accessToken
  }
}

mutation signUp($email: String!, $password: String!) {
  signUp(email: $email, password: $password) {
    accessToken
  }
}

mutation logout {
  logout {
    succeed
  }
}

mutation verifyRequest {
  verifyRequest {
    succeed
  }
}

mutation verify($token: String!) {
  verify(token: $token) {
    accessToken
  }
}

mutation resetPassword($email: String!) {
  resetPassword(email: $email) {
    succeed
  }
}

mutation newPassword($token: String!, $newPassword: String!) {
  newPassword(token: $token, newPassword: $newPassword) {
    accessToken
  }
}

mutation changePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword){
    succeed
  }
}

mutation updateUser($email: String!, $firstName: String!, $lastName: String!) {
  updateUser(email: $email, firstName: $firstName, lastName: $lastName) {
    _id
    email
    firstName
    lastName
    locale
    account {
      verification {
        verified
      }
    }
    updatedAt
    createdAt
  }
}

mutation switchLocale($locale: Locale!) {
  switchLocale(locale: $locale) {
    locale
  }
}
```

**Note:** For any question [issues](https://github.com/watscho/express-graphql-mongodb-boilerplate/issues)
