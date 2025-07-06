CREATE TABLE "library" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"script_id" text NOT NULL,
	"repository_url" text NOT NULL,
	"author_url" text NOT NULL,
	"author_name" text NOT NULL,
	"description" text NOT NULL,
	"star_count" integer DEFAULT 0 NOT NULL,
	"copy_count" integer DEFAULT 0 NOT NULL,
	"license_type" text NOT NULL,
	"license_url" text NOT NULL,
	"last_commit_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "library_script_id_unique" UNIQUE("script_id"),
	CONSTRAINT "library_repository_url_unique" UNIQUE("repository_url")
);
--> statement-breakpoint
CREATE TABLE "library_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"library_id" text NOT NULL,
	"library_name_ja" text,
	"library_name_en" text,
	"purpose_ja" text,
	"purpose_en" text,
	"target_users_ja" text,
	"target_users_en" text,
	"tags_ja" jsonb,
	"tags_en" jsonb,
	"core_problem_ja" text,
	"core_problem_en" text,
	"main_benefits" jsonb,
	"usage_example_ja" text,
	"usage_example_en" text,
	"seo_title_ja" text,
	"seo_title_en" text,
	"seo_description_ja" text,
	"seo_description_en" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "library_summary_library_id_unique" UNIQUE("library_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"picture" text,
	"google_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
ALTER TABLE "library_summary" ADD CONSTRAINT "library_summary_library_id_library_id_fk" FOREIGN KEY ("library_id") REFERENCES "public"."library"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;