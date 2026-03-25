const express = require('express');

const app = express();
app.use(express.json());

// In-memory storage
let users = [];
let idCounter = 1;

app.get('/', (req, res) => {
  res.send('API is running..');
});

// GET /users
app.get('/users', (req, res) => {
  try {
    const { search, sort, order } = req.query;
    let result = [...users];

    // Search
    if (search) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sort === 'name') {
      result.sort((a, b) => {
        if (a.name < b.name) return order === 'desc' ? 1 : -1;
        if (a.name > b.name) return order === 'desc' ? -1 : 1;
        return 0;
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id
app.get('/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users
app.post('/users', (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email required' });
    }

    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const newUser = {
      id: idCounter++,
      name,
      email
    };

    users.push(newUser);

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /users/:id
app.put('/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;

    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email && users.some(u => u.email === email && u.id !== id)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:id
app.delete('/users/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users.splice(index, 1);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});