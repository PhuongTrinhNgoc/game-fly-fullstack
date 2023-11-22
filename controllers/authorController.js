const authorController = {
  getAuthors: async (req, res) => {
    try {
      const pool = require("../db");
  
      // Truy vấn danh sách tác giả và thông tin về games của mỗi tác giả
      const query = `
        SELECT authors.id AS author_id, authors.name AS author_name, authors.year AS author_year,
               games.id AS game_id, games.name AS game_name, games.published_date, games.genres, games.status
        FROM authors
        LEFT JOIN games ON authors.id = games.publisher_id
      `;
  
      const result = await pool.query(query);
      const authors = [];
  
      // Xử lý kết quả truy vấn để xây dựng mảng tác giả với thông tin đầy đủ về games
      result.rows.forEach((row) => {
        const existingAuthor = authors.find((author) => author.id === row.author_id);
  
        if (existingAuthor) {
          // Nếu tác giả đã tồn tại và thông tin game không rỗng, thêm thông tin game vào mục "games" của tác giả
          if (row.game_id) {
            existingAuthor.games.push({
              game_id: row.game_id,
              game_name: row.game_name,
              published_date: row.published_date,
              genres: row.genres,
              status: row.status,
            });
          }
        } else {
          // Nếu tác giả chưa tồn tại, thêm mới tác giả và thông tin game (nếu có)
          const newAuthor = {
            id: row.author_id,
            name: row.author_name,
            year: row.author_year,
            games: row.game_id
              ? [
                  {
                    game_id: row.game_id,
                    game_name: row.game_name,
                    published_date: row.published_date,
                    genres: row.genres,
                    status: row.status,
                  },
                ]
              : [],
          };
          authors.push(newAuthor);
        }
      });
  
      res.status(200).json(authors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  
  getAnAuthor: async (req, res) => {
    try {
      const pool = require("../db");
  
      const authorId = req.params.id;
  
      // Truy vấn thông tin về tác giả
      const authorQuery = 'SELECT * FROM authors WHERE id = $1';
      const authorValues = [authorId];
      const authorResult = await pool.query(authorQuery, authorValues);
  
      if (authorResult.rows.length === 0) {
        return res.status(404).json({ error: 'Author not found' });
      }
  
      const authorInfo = authorResult.rows[0];
  
      // Truy vấn thông tin về games của tác giả
      const gamesQuery = `
        SELECT games.id AS game_id, games.name AS game_name, games.published_date, games.genres, games.status
        FROM games
        WHERE games.publisher_id = $1
      `;
      const gamesValues = [authorId];
      const gamesResult = await pool.query(gamesQuery, gamesValues);
  
      const gamesInfo = gamesResult.rows.map((game) => ({
        game_id: game.game_id,
        game_name: game.game_name,
        published_date: game.published_date,
        genres: game.genres,
        status: game.status,
      }));
  
      // Kết hợp thông tin tác giả và games
      const combinedInfo = {
        id: authorInfo.id,
        name: authorInfo.name,
        games: gamesInfo,
        year: authorInfo.year,
      };
  
      res.status(200).json(combinedInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  
  updateAuthor: async (req, res) => {
    try {
      const pool = require("../db");

      const { authorId } = req.params;
      const { name, year, games } = req.body;

      // Kiểm tra xem tác giả có tồn tại không
      const checkAuthor = await pool.query('SELECT * FROM authors WHERE id = $1', [authorId]);
      if (checkAuthor.rows.length === 0) {
        return res.status(404).json({ error: 'Author not found' });
      }

      // Thực hiện câu lệnh UPDATE để sửa thông tin tác giả
      const updateQuery = 'UPDATE authors SET name = $1, year = $2 WHERE id = $3 RETURNING *';
      const updateValues = [name, year, authorId];

      const updatedAuthor = await pool.query(updateQuery, updateValues);

      res.status(200).json(updatedAuthor.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
    addAuthor  : async (req,res)=>{
    try {
      const pool = require("../db");

        const { name, year,games } = req.body;
        const query = "INSERT INTO authors (name, year) VALUES ($1, $2) RETURNING *";
        const values = [name, year];

        const savedAuthor = await pool.query(query, values);
        res.status(200).json(savedAuthor.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  deleteAuthor: async (req, res) => {
    try {
      const { authorId } = req.params;
      const pool = require("../db");

      // Lấy danh sách trò chơi của tác giả
      const gamesResult = await pool.query('SELECT id FROM games WHERE publisher_id = $1', [authorId]);

      // Xóa tác giả từ bảng authors
      await pool.query('DELETE FROM authors WHERE id = $1', [authorId]);

      // Xóa tất cả các trò chơi của tác giả từ bảng games
      await pool.query('DELETE FROM games WHERE publisher_id = $1', [authorId]);

      res.status(200).json({ message: 'Author and associated games deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
module.exports = authorController;
