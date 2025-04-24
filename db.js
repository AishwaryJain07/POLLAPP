const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        
  host: 'localhost',
  database: 'pollapp',    
  password: 'Postgre@Aishwary',
  port: 5432,                
});

module.exports = pool;
