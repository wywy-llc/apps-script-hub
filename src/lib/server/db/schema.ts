import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  picture: text('picture'),
  googleId: text('google_id').notNull().unique(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  })
    .notNull()
    .defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const library = pgTable('library', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  scriptId: text('script_id').notNull().unique(),
  repositoryUrl: text('repository_url').notNull().unique(),
  authorUrl: text('author_url').notNull(),
  authorName: text('author_name').notNull(),
  description: text('description').notNull(),
  readmeContent: text('readme_content').notNull(),
  starCount: integer('star_count').default(0).notNull(),
  copyCount: integer('copy_count').default(0).notNull(),
  licenseType: text('license_type').notNull(),
  licenseUrl: text('license_url').notNull(),
  status: text('status', { enum: ['pending', 'published', 'rejected'] })
    .notNull()
    .default('pending'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'date',
  })
    .notNull()
    .defaultNow(),
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Library = typeof library.$inferSelect;
