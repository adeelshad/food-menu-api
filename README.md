# Restaurant Food Menu REST API

CRUD REST API built with Node.js, Express and SQLite. Tested with Postman.
Course: SW426 Software Quality Engineering (MUET SZAB Campus, Khairpur Mir's).

## Run
```bash
npm install
npm start          # http://localhost:3001/api/food-items
```

## Endpoints
| Operation | Method | URL | Success |
|---|---|---|---|
| Create | POST | /api/food-items | 201 |
| Read all | GET | /api/food-items (optional `?category=`) | 200 |
| Read one | GET | /api/food-items/:id | 200 / 404 |
| Update | PUT | /api/food-items/:id | 200 / 404 |
| Delete | DELETE | /api/food-items/:id | 200 / 404 |

Request body: `{ "name", "category", "price", "preparationTime", "isAvailable" }`.
`category` is Starter, Main Course, Dessert, Beverage or Fast Food. Errors: 400 invalid data, 404 not found, 409 duplicate name.

## Postman tests
Import `postman/food-menu-api.postman_collection.json` into Postman (variable `baseUrl` = http://localhost:3001) and run it (18 requests, 54 assertions), or run `npm test` for the Newman command-line run.
