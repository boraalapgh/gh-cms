ALTER TYPE "public"."entity_type" ADD VALUE 'certificate_template';--> statement-breakpoint
ALTER TABLE "entities" ADD COLUMN "content" jsonb;