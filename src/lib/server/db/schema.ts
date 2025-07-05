import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

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
  starCount: integer('star_count').default(0).notNull(),
  copyCount: integer('copy_count').default(0).notNull(),
  licenseType: text('license_type').notNull(),
  licenseUrl: text('license_url').notNull(),
  lastCommitAt: timestamp('last_commit_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
  status: text('status', { enum: ['pending', 'published'] })
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

export const librarySummary = pgTable('library_summary', {
  id: text('id').primaryKey(),
  libraryId: text('library_id')
    .notNull()
    .references(() => library.id)
    .unique(),
  // basicInfo
  libraryNameJa: text('library_name_ja'),
  libraryNameEn: text('library_name_en'),
  purposeJa: text('purpose_ja'),
  purposeEn: text('purpose_en'),
  targetUsersJa: text('target_users_ja'),
  targetUsersEn: text('target_users_en'),
  tagsJa: jsonb('tags_ja').$type<string[]>(),
  tagsEn: jsonb('tags_en').$type<string[]>(),
  // functionality
  coreProblemJa: text('core_problem_ja'),
  coreProblemEn: text('core_problem_en'),
  mainBenefits: jsonb('main_benefits').$type<
    Array<{
      title: {
        ja: string;
        en: string;
      };
      description: {
        ja: string;
        en: string;
      };
    }>
  >(),
  usageExampleJa: text('usage_example_ja'),
  usageExampleEn: text('usage_example_en'),
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

export type LibrarySummaryRecord = typeof librarySummary.$inferSelect;
