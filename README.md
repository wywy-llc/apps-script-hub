## Concept

https://wywy-llc.github.io/apps-script-hub/

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Testing

### E2E Tests

This project uses Playwright for E2E testing with automatic test data cleanup.

```bash
# Run all tests (unit + E2E)
npm run test

# Run E2E tests only
npm run test:e2e

# Run unit tests only
npm run test:unit
```

### Database Schema Changes

When adding new tables to the database schema, you must update the test data cleanup script to ensure E2E tests run reliably:

1. **Update schema**: Add your new table to `src/lib/server/db/schema.ts`
2. **Update cleanup script**: Add a DELETE statement for your new table in `scripts/clear-test-data.js`

```javascript
// Example: If you add a "category" table, add this line:
await db.execute(sql`DELETE FROM "category"`);
await db.execute(sql`DELETE FROM "library"`); // Keep existing tables
```

**Important**: The cleanup order matters if you have foreign key constraints. Delete child tables before parent tables.

### Test Database Setup

The E2E tests use a separate test database that is automatically:

- Created before tests run (`scripts/setup-test-db.js`)
- Cleaned between individual tests (`scripts/clear-test-data.js`)
- Destroyed after tests complete (`scripts/cleanup-test-db.js`)
