ALTER TABLE "library" ADD COLUMN "requester_id" text;--> statement-breakpoint
ALTER TABLE "library" ADD COLUMN "request_note" text;--> statement-breakpoint
ALTER TABLE "library" ADD CONSTRAINT "library_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;