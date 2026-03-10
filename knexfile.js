module.exports = {
   development: {
     client: 'sqlite3',
     connection: {
       filename: './db/app.db',
     },
     useNullAsDefault: true,
      migrations: {
       directory: './db/migrations',
       },
      seeds: {
         directory: './db/seeds',
       },
     },
  
     production: {
       client: 'pg',
       connection: process.env.DATABASE_URL,
       migrations: {
         directory: './db/migrations',
       },
       seeds: {
         directory: './db/seeds',
       },
     },
   };