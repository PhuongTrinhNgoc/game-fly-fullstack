CREATE DATABASE gameServer;

CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    games  INTEGER[],
    year INTEGER NOT NULL,
    FOREIGN KEY (games) REFERENCES games(id) -- Thêm foreign key để liên kết với bảng games
);

    CREATE TABLE IF NOT EXISTS games (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                published_date VARCHAR(255),
                genres VARCHAR(255) ARRAY,
                publisher_id INTEGER REFERENCES authors(id),
                status BOOLEAN
            );