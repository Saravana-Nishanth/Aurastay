const path = require('path');
const fs = require('fs');
const { q } = require('../db/pool');

// Same column list everywhere so every endpoint returns an identical shape.
const COLUMNS = `
  id, title, description, price,
  latitude, longitude, image_url,
  created_at, updated_at
`;

// Removes the photo that belongs to a hotel row. Best effort: a file that is
// already gone (or belongs to the seed folder) should never fail the request.
function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  const filename = path.basename(imageUrl);
  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
  fs.unlink(filePath, () => {});
}

// GET /api/hotels — search by title, filter by price range, offset/limit paging.
exports.list = async (req, res, next) => {
  try {
    const { search = '', minPrice, maxPrice } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    // WHERE clauses are appended conditionally but every value goes in as a
    // bound parameter, so the query stays injection-proof.
    const filters = [];
    const params = [];

    if (search.trim()) {
      params.push(`%${search.trim()}%`);
      filters.push(`title ILIKE $${params.length}`);
    }

    const min = Number(minPrice);
    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(min)) {
      params.push(min);
      filters.push(`price >= $${params.length}`);
    }

    const max = Number(maxPrice);
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(max)) {
      params.push(max);
      filters.push(`price <= $${params.length}`);
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    params.push(limit);
    const limitParam = params.length;
    params.push(offset);
    const offsetParam = params.length;

    // COUNT(*) OVER() returns the grand total next to each row, which gives us
    // the pagination count without a second round trip to the database.
    const rows = await q(
      `SELECT ${COLUMNS}, COUNT(*) OVER() AS total_count
         FROM hotels
         ${whereSql}
        ORDER BY created_at DESC, id DESC
        LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params
    );

    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    const data = rows.map(({ total_count, ...hotel }) => hotel);

    res.json({ data, total, limit, offset });
  } catch (err) {
    next(err);
  }
};

// GET /api/hotels/:id
exports.getOne = async (req, res, next) => {
  try {
    const rows = await q(`SELECT ${COLUMNS} FROM hotels WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    // a non-numeric id makes Postgres throw 22P02 — that is just "not found"
    if (err.code === '22P02') return res.status(404).json({ message: 'Hotel not found.' });
    next(err);
  }
};

// POST /api/hotels — multipart form (fields + image file)
exports.create = async (req, res, next) => {
  try {
    const { title, description, price, latitude, longitude } = req.clean;
    const imageUrl = `/uploads/${req.file.filename}`;

    const rows = await q(
      `INSERT INTO hotels (title, description, price, latitude, longitude, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${COLUMNS}`,
      [title, description, price, latitude, longitude, imageUrl]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/hotels/:id — same multipart contract, image is optional here
exports.update = async (req, res, next) => {
  try {
    const { title, description, price, latitude, longitude } = req.clean;
    const id = req.params.id;

    const existing = await q(`SELECT image_url FROM hotels WHERE id = $1`, [id]);
    if (existing.length === 0) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: 'Hotel not found.' });
    }

    const newImageUrl = req.file ? `/uploads/${req.file.filename}` : existing[0].image_url;

    const rows = await q(
      `UPDATE hotels
          SET title = $1, description = $2, price = $3,
              latitude = $4, longitude = $5, image_url = $6,
              updated_at = NOW()
        WHERE id = $7
        RETURNING ${COLUMNS}`,
      [title, description, price, latitude, longitude, newImageUrl, id]
    );

    // the row now points at the new file, so the previous one can go
    if (req.file && existing[0].image_url !== newImageUrl) {
      deleteImageFile(existing[0].image_url);
    }

    res.json(rows[0]);
  } catch (err) {
    if (err.code === '22P02') return res.status(404).json({ message: 'Hotel not found.' });
    next(err);
  }
};

// DELETE /api/hotels/:id — deletes the row and, as the brief allows, the
// stored image file along with it.
exports.remove = async (req, res, next) => {
  try {
    const rows = await q(
      `DELETE FROM hotels WHERE id = $1 RETURNING ${COLUMNS}`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found.' });
    }

    deleteImageFile(rows[0].image_url);
    res.json({ message: 'Hotel deleted successfully.' });
  } catch (err) {
    if (err.code === '22P02') return res.status(404).json({ message: 'Hotel not found.' });
    next(err);
  }
};
