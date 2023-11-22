const gamesController = {
  addGame: async (req, res) => {
    try {
      const pool = require("../db");

      const { name, published_date, genres, publisher_id, status } = req.body;

      // Thêm trò chơi mới vào bảng games
      const newGame = await pool.query(
        "INSERT INTO games(name, published_date, genres, publisher_id, status) VALUES($1, $2, $3, $4, $5) RETURNING *",
        [name, published_date, genres, publisher_id, status]
      );

      // Cập nhật mảng games của tác giả
      await pool.query(
        "UPDATE authors SET games = COALESCE(games, '[]'::jsonb) || $1 WHERE id = $2",
        [JSON.stringify([{ game_id: newGame.rows[0].id }]), publisher_id]
      );

      res.status(201).json(newGame.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getGames: async (req, res) => {
    try {
      const pool = require("../db");
      console.log('aa');
      // Truy vấn danh sách trò chơi và thông tin về tác giả của mỗi trò chơi
      const query = `
            SELECT games.id AS game_id, games.name AS game_name, games.published_date, games.genres, games.status,
                   authors.id AS author_id, authors.name AS author_name, authors.year AS author_year
            FROM games
            LEFT JOIN authors ON games.publisher_id = authors.id
          `;

      const result = await pool.query(query);
      const games = [];

      // Xử lý kết quả truy vấn để xây dựng mảng trò chơi với thông tin đầy đủ về tác giả
      result.rows.forEach((row) => {
        const existingGame = games.find((game) => game.id === row.game_id);

        if (existingGame) {
          // Nếu trò chơi đã tồn tại, thêm thông tin tác giả vào mục "authors" của trò chơi
          existingGame.authors.push({
            author_id: row.author_id,
            author_name: row.author_name,
            author_year: row.author_year,
          });
        } else {
          // Nếu trò chơi chưa tồn tại, thêm mới trò chơi và thông tin tác giả
          const newGame = {
            id: row.game_id,
            name: row.game_name,
            published_date: row.published_date,
            genres: row.genres,
            status: row.status,
            authors: row.author_id
              ? [
                  {
                    author_id: row.author_id,
                    author_name: row.author_name,
                    author_year: row.author_year,
                  },
                ]
              : [],
          };
          games.push(newGame);
        }
      });

      res.status(200).json(games);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAnGame: async (req, res) => {
    try {
      const pool = require("../db");

      const gameId = req.params.id;

      // Truy vấn thông tin về trò chơi
      const gameQuery = "SELECT * FROM games WHERE id = $1";
      const gameValues = [gameId];
      const gameResult = await pool.query(gameQuery, gameValues);

      if (gameResult.rows.length === 0) {
        return res.status(404).json({ error: "Game not found" });
      }

      const gameInfo = gameResult.rows[0];

      // Truy vấn thông tin về tác giả của trò chơi
      const authorsQuery = `
            SELECT authors.id AS author_id, authors.name AS author_name, authors.year AS author_year
            FROM authors
            LEFT JOIN games ON authors.id = games.publisher_id
            WHERE games.id = $1
          `;
      const authorsValues = [gameId];
      const authorsResult = await pool.query(authorsQuery, authorsValues);

      const authorsInfo = authorsResult.rows.map((author) => ({
        author_id: author.author_id,
        author_name: author.author_name,
        author_year: author.author_year,
      }));

      // Kết hợp thông tin trò chơi và tác giả
      const combinedInfo = {
        id: gameInfo.id,
        name: gameInfo.name,
        published_date: gameInfo.published_date,
        genres: gameInfo.genres,
        status: gameInfo.status,
        authors: authorsInfo,
      };

      res.status(200).json(combinedInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteGame: async (req, res) => {
    try {
      const pool = require("../db");

      const { id, publisherId } = req.params;
      // Xóa trò chơi từ bảng games
      await pool.query("DELETE FROM games WHERE id = $1", [id]);

      // Cập nhật mảng games của tác giả
      await pool.query(
        "UPDATE authors SET games = COALESCE(games, '[]'::jsonb) - $1 WHERE id = $2",
        [JSON.stringify([{ game_id: id }]), publisherId]
      );

      res.status(200).json({ message: "Game deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
module.exports = gamesController;
