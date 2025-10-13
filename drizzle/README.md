# Database Migrations

This directory contains Drizzle ORM migration files for the AI Retirement Planner database.

## Overview

The database uses Vercel Postgres (PostgreSQL) with Drizzle ORM for type-safe database operations.

## Database Schema

### Tables (7 total)

1. **users** - User authentication and profile
2. **retirement_plans** - Saved retirement plan configurations
3. **scenarios** - What-if scenarios for comparison
4. **projection_history** - Year-by-year projection data
5. **discovery_funds_cache** - Cached Discovery fund performance data (24h TTL)
6. **sars_tax_tables_cache** - Cached SARS tax tables (1yr TTL)
7. **cpi_data_cache** - Cached Stats SA CPI data (30d TTL)

## Running Migrations

### Generate migrations from schema changes
```bash
npx drizzle-kit generate
```

### Apply migrations to database
```bash
npx drizzle-kit push
```

### View database structure
```bash
npx drizzle-kit studio
```

## Migration Files

- `0000_gray_doctor_doom.sql` - Initial schema creation with all 7 tables

## Features

- UUID primary keys for all tables
- Foreign key relationships with CASCADE delete
- Composite indexes for optimal query performance
- JSONB columns for flexible data structures (tax brackets, CPI data)
- Timestamp tracking (created_at, updated_at)
- TTL logic for cache tables

## Indexes

All tables include strategic indexes for:
- User lookups (email, auth provider)
- Plan queries (user_id, created_at)
- Time-based filtering (year, month)
- Foreign key relationships

## Data Retention

- **users**: Indefinite (until account deletion)
- **retirement_plans**: Indefinite
- **scenarios**: Indefinite
- **projection_history**: 90 days (can regenerate)
- **discovery_funds_cache**: 30 days
- **sars_tax_tables_cache**: 5 years
- **cpi_data_cache**: 10 years

## References

- Full schema documentation: `/docs/DATABASE-SCHEMA.md`
- Drizzle ORM docs: https://orm.drizzle.team
