# Library API
## Description
__Library API__ provides a service to manage personal book collections. Users can add new books, view book lists, update book information, and delete books. In addition, this API also allows users to change the status of books (unread, being read, read).

## Project Pattern
- __Modular Pattern__, is used to organize and group application features. A module is a logical unit of an application that groups related components such as controllers, services, and providers.
- __Dependency Injection__, is used to manage dependencies between components. DI allows you to inject services into controllers or other services without having to manually instantiate them.
- __Other__, such as Decorator Pattern, Middleware, Pipes, Guards, Interceptors and Repository Pattern.

## Tools Needed
- __Node JS__ (Latest Version)
- __SQL Database Server__ (Like MySQL, Postgre etc)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# e2e tests
$ npm run test:e2e
```

## API Documentation
[Click This](https://aisaif.github.io/library-api/)