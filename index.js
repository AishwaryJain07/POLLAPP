const http = require('http');
const pool = require('./db');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET all polls
  if (req.url === '/polls' && req.method === 'GET') {
    const result = await pool.query('SELECT * FROM poll');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
  }

  // GET poll by ID
  else if (req.url.startsWith('/polls/') && req.method === 'GET') {
    const id = req.url.split('/')[2];
    const result = await pool.query('SELECT * FROM poll WHERE id = $1', [id]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.rows));
  }

  // DELETE poll by ID
  else if (req.url.startsWith('/polls/') && req.method === 'DELETE') {
    const id = req.url.split('/')[2];
    await pool.query('DELETE FROM poll WHERE id = $1', [id]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Poll deleted' }));
  }

  // POST a new poll
  else if (req.url === '/polls' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      const { title, caption, options } = JSON.parse(body);
      const result = await pool.query(
        'INSERT INTO poll (title, caption, options) VALUES ($1, $2, $3) RETURNING *',
        [title, caption, JSON.stringify(options)] // convert array to JSON string
      );
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    });
  }

  // Unknown route
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
