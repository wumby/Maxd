// db/migrate.js
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/maxd'
const MIGRATIONS_DIR = path.resolve('./db/migrations')

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
  fs.writeFileSync('./db/_ensure_migration_table.sql', sql)
  run(`psql "${DB_URL}" -f ./db/_ensure_migration_table.sql`)
  fs.unlinkSync('./db/_ensure_migration_table.sql')
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
