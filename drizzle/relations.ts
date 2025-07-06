import { relations } from "drizzle-orm/relations";
import { user, session, library, librarySummary } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
}));

export const librarySummaryRelations = relations(librarySummary, ({one}) => ({
	library: one(library, {
		fields: [librarySummary.libraryId],
		references: [library.id]
	}),
}));

export const libraryRelations = relations(library, ({many}) => ({
	librarySummaries: many(librarySummary),
}));