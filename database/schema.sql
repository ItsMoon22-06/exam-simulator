-- Simulador de exámenes - Esquema PostgreSQL (compatible con Neon)
-- Ejecutar completo en el SQL Editor de Neon, o con: npm run db:init (desde /backend)

DROP TABLE IF EXISTS attempt_answers CASCADE;
DROP TABLE IF EXISTS attempts CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(30) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exams (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(120) NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  category         VARCHAR(60)  NOT NULL DEFAULT 'General',
  duration_minutes INTEGER NOT NULL DEFAULT 10 CHECK (duration_minutes > 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
  id          SERIAL PRIMARY KEY,
  exam_id     INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  position    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE options (
  id          SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE attempts (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id          INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  score            INTEGER NOT NULL CHECK (score >= 0),
  total            INTEGER NOT NULL CHECK (total > 0),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  finished_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attempt_answers (
  id          SERIAL PRIMARY KEY,
  attempt_id  INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_id   INTEGER REFERENCES options(id) ON DELETE SET NULL, -- NULL = sin responder
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_questions_exam   ON questions(exam_id);
CREATE INDEX idx_options_question ON options(question_id);
CREATE INDEX idx_attempts_user    ON attempts(user_id);
CREATE INDEX idx_attempts_exam    ON attempts(exam_id);
CREATE INDEX idx_answers_attempt  ON attempt_answers(attempt_id);
CREATE INDEX idx_answers_question ON attempt_answers(question_id);
