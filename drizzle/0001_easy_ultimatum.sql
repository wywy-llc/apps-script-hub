ALTER TABLE "library_summary" ADD COLUMN "seo_title_ja" text;--> statement-breakpoint
ALTER TABLE "library_summary" ADD COLUMN "seo_title_en" text;--> statement-breakpoint
ALTER TABLE "library_summary" ADD COLUMN "seo_description_ja" text;--> statement-breakpoint
ALTER TABLE "library_summary" ADD COLUMN "seo_description_en" text;--> statement-breakpoint
ALTER TABLE "library" DROP COLUMN "readme_content";