import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/maxd'
const MIGRATIONS_DIR = path.join(__dirname, 'migrations')
const TEMP_SQL_PATH = path.join(__dirname, '_ensure_migration_table.sql')

function run(command) {
  console.log(`🔹 ${command}`)
  execSync(command, { stdio: 'inherit' })
}

function getSqlFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()
}

function ensureMigrationTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMP DEFAULT NOW()
    );
  `
  fs.writeFileSync(TEMP_SQL_PATH, sql)
  run(`psql "${DB_URL}" -f "${TEMP_SQL_PATH}"`)
  fs.unlinkSync(TEMP_SQL_PATH)
}

function getAppliedMigrations() {
  const result = execSync(`psql "${DB_URL}" -t -c "SELECT name FROM _migrations;"`)
  return result.toString().split('\n').map((line) => line.trim()).filter(Boolean)
}

function markMigrationAsRun(filename) {
  const query = `INSERT INTO _migrations (name) VALUES ('${filename}');`
  run(`psql "${DB_URL}" -c "${query}"`)
}

async function runMigrations() {
  ensureMigrationTable()
  const applied = getAppliedMigrations()
  const pending = getSqlFiles().filter((file) => !applied.includes(file))

  if (pending.length === 0) {
    console.log('✅ No new migrations to run.')
    return
  }

  for (const file of pending) {
    const fullPath = path.join(MIGRATIONS_DIR, file)
    console.log(`🚀 Running ${file}...`)
    run(`psql "${DB_URL}" -f "${fullPath}"`)
    markMigrationAsRun(file)
  }

  console.log('✅ All migrations applied.')
}

runMigrations()
