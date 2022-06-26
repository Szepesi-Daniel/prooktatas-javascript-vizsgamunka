# Prooktatás Javascript Vizsgamunka

## API útvonalak

| PATH                   | METHOD  |
| ---------------------- |---------|
| /auth/login            | POST    |
| /auth/register         | POST    |
| /auth/is-logged-in     | GET     | 
| /auth/logout           | POST    |
| /hairdressers          | GET     |
| /hairdresser/:id/:date | GET     |
| /book-now              | POST    |
| /appointments/:date    | GET     |
| /auth/create-employee  | POST    |
| /auth/delete-employee  | DELETE  |
| /add-freedom           | POST    |
| /appointment           | DELETE  |

## .env

SESSION_NAME
SESSION_COLLECTION
MONGODB_URI

SERVICE
EMAIL
PASSWORD

## public/src/lib/framework/config.ts

Állítsd be a sessionCookie -t, egyezzen a SESSION_NAME környezeti változóval

## config.js

workingTime -ot ne szerkeszd, a kliens nincs felkészítve rá