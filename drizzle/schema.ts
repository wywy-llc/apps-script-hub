import { pgTable, foreignKey, text, timestamp, unique, integer, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	picture: text(),
	googleId: text("google_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
	unique("user_google_id_unique").on(table.googleId),
]);

export const library = pgTable("library", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	scriptId: text("script_id").notNull(),
	repositoryUrl: text("repository_url").notNull(),
	authorUrl: text("author_url").notNull(),
	authorName: text("author_name").notNull(),
	description: text().notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	starCount: integer("star_count").default(0).notNull(),
	copyCount: integer("copy_count").default(0).notNull(),
	licenseType: text("license_type").notNull(),
	licenseUrl: text("license_url").notNull(),
	lastCommitAt: timestamp("last_commit_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	unique("library_script_id_unique").on(table.scriptId),
	unique("library_repository_url_unique").on(table.repositoryUrl),
]);

export const librarySummary = pgTable("library_summary", {
	id: text().primaryKey().notNull(),
	libraryId: text("library_id").notNull(),
	libraryNameJa: text("library_name_ja"),
	libraryNameEn: text("library_name_en"),
	purposeJa: text("purpose_ja"),
	purposeEn: text("purpose_en"),
	targetUsersJa: text("target_users_ja"),
	targetUsersEn: text("target_users_en"),
	tagsJa: jsonb("tags_ja"),
	tagsEn: jsonb("tags_en"),
	coreProblemJa: text("core_problem_ja"),
	coreProblemEn: text("core_problem_en"),
	mainBenefits: jsonb("main_benefits"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	usageExampleJa: text("usage_example_ja"),
	usageExampleEn: text("usage_example_en"),
}, (table) => [
	foreignKey({
			columns: [table.libraryId],
			foreignColumns: [library.id],
			name: "library_summary_library_id_library_id_fk"
		}),
	unique("library_summary_library_id_unique").on(table.libraryId),
]);
