const express = require('express');

const CATEGORIES = ['Starter', 'Main Course', 'Dessert', 'Beverage', 'Fast Food'];

const toApi = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  price: r.price,
  preparationTime: r.preparation_time,
  isAvailable: r.is_available === 1,
  createdAt: r.created_at,
});

function validate(body) {
  const errors = [];
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};

  if (typeof b.name !== 'string' || b.name.trim() === '') errors.push('name is required and must be a non-empty string');
  else if (b.name.trim().length > 60) errors.push('name must be at most 60 characters');
  if (!CATEGORIES.includes(b.category)) errors.push(`category is required and must be one of: ${CATEGORIES.join(', ')}`);
  if (typeof b.price !== 'number' || !Number.isFinite(b.price) || b.price <= 0) errors.push('price is required and must be a number greater than 0');
  else if (Math.round(b.price * 100) / 100 !== b.price) errors.push('price must have at most 2 decimal places');
  if (b.preparationTime !== undefined && (!Number.isInteger(b.preparationTime) || b.preparationTime < 1 || b.preparationTime > 180))
    errors.push('preparationTime must be an integer between 1 and 180 (minutes)');
  if (b.isAvailable !== undefined && typeof b.isAvailable !== 'boolean') errors.push('isAvailable must be true or false');

  return {
    errors,
    value: {
      name: typeof b.name === 'string' ? b.name.trim() : b.name,
      category: b.category,
      price: b.price,
      preparationTime: b.preparationTime ?? 10,
      isAvailable: b.isAvailable === false ? 0 : 1,
    },
  };
}

function createApp(db) {
  const app = express();
  app.use(express.json());

  const q = {
    all: db.prepare('SELECT * FROM food_items ORDER BY id'),
    byId: db.prepare('SELECT * FROM food_items WHERE id = ?'),
    byName: db.prepare('SELECT id FROM food_items WHERE name = ? COLLATE NOCASE'),
    insert: db.prepare('INSERT INTO food_items (name, category, price, preparation_time, is_available) VALUES (@name, @category, @price, @preparationTime, @isAvailable)'),
    update: db.prepare('UPDATE food_items SET name=@name, category=@category, price=@price, preparation_time=@preparationTime, is_available=@isAvailable WHERE id=@id'),
    del: db.prepare('DELETE FROM food_items WHERE id = ?'),
  };

  const parseId = (req, res, next) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid id', details: ['id must be a positive integer'] });
    req.id = Number(req.params.id);
    next();
  };
  const notFound = (res, id) => res.status(404).json({ error: 'Not Found', details: [`No food item with id ${id}`] });
  const conflict = (res, name) => res.status(409).json({ error: 'Conflict', details: [`A food item named "${name}" already exists`] });

  app.post('/api/food-items', (req, res) => {
    const { errors, value } = validate(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
    if (q.byName.get(value.name)) return conflict(res, value.name);
    const info = q.insert.run(value);
    res.status(201).json(toApi(q.byId.get(info.lastInsertRowid)));
  });

  app.get('/api/food-items', (req, res) => {
    let rows = q.all.all();
    if (typeof req.query.category === 'string') rows = rows.filter((r) => r.category.toLowerCase() === req.query.category.toLowerCase());
    res.status(200).json(rows.map(toApi));
  });

  app.get('/api/food-items/:id', parseId, (req, res) => {
    const row = q.byId.get(req.id);
    if (!row) return notFound(res, req.id);
    res.status(200).json(toApi(row));
  });

  app.put('/api/food-items/:id', parseId, (req, res) => {
    if (!q.byId.get(req.id)) return notFound(res, req.id);
    const { errors, value } = validate(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
    const clash = q.byName.get(value.name);
    if (clash && clash.id !== req.id) return conflict(res, value.name);
    q.update.run({ ...value, id: req.id });
    res.status(200).json(toApi(q.byId.get(req.id)));
  });

  app.delete('/api/food-items/:id', parseId, (req, res) => {
    if (q.del.run(req.id).changes === 0) return notFound(res, req.id);
    res.status(200).json({ message: `Food item ${req.id} deleted` });
  });

  app.use((req, res) => res.status(404).json({ error: 'Not Found', details: ['Unknown route'] }));
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON', details: ['Request body is not valid JSON'] });
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
  return app;
}
module.exports = { createApp };
