const pool = require('../config/database');

exports.getAllWords = async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT ON (term) term,class,meaning,pronunciation,history,example,status FROM words');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retreiving words:', error.message);res.status(500).json({error: 'Failed to retrieve words'});
    }
};

exports.getWordById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT DISTINCT ON (term) term,class,meaning,pronunciation,history,example,status FROM words WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addWord = async (req, res) => {
    const { term, class: wordClass, meaning, pronunciation, history, example, status } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO words (term, class, meaning, pronunciation, history, example, status) VALUES ($1, $2, $3, $4, $5, $6, $7, ) RETURNING *',
            [term, wordClass, meaning, pronunciation, history, example, status, 0, new Date()]
        );

        res.status(201).json({ message: 'Word added successfully', word: result.rows[0] });
    } catch (error) {
        console.error('Error adding word:', error.message);
        res.status(500).json({ error: 'Failed to add word' });
    }
};

exports.updateWord = async (req, res) => {
    const { id } = req.params;
    const { term, wordClass, meaning, pronunciation, history, example } = req.body;
    try {
        const result = await pool.query(
            'UPDATE words SET term = $1, class = $2, meaning = $3, pronunciation = $4, history = $5, example = $6 WHERE id = $7 RETURNING *',
            [term, wordClass, meaning, pronunciation, history, example, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Word not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteWord = async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query('DELETE FROM words WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Word not found' });
      }
      res.status(200).json({ message: 'Word deleted' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

