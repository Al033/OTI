CREATE TABLE "briefs" (
	"id" text PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"model_tag" text NOT NULL,
	"model_synth" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_briefs" (
	"date" text PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"model_synth" text NOT NULL,
	"corpus_version" text NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_matches" (
	"date" text PRIMARY KEY NOT NULL,
	"positives" jsonb NOT NULL,
	"negative" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"region" text NOT NULL,
	"trigger_type" text NOT NULL,
	"regime_tags" jsonb NOT NULL,
	"surprise_factor" integer NOT NULL,
	"description" text NOT NULL,
	"catalyst" text NOT NULL,
	"narrative_at_time" text NOT NULL,
	"outcome_in_hindsight" text NOT NULL,
	"asset_moves" jsonb NOT NULL,
	"flow_patterns" text NOT NULL,
	"failed_trades" jsonb NOT NULL,
	"consensus_error" text NOT NULL,
	"lessons" jsonb NOT NULL,
	"sources" jsonb NOT NULL,
	"embedding" vector(1024),
	"regime_raw_vector" jsonb,
	"regime_z_vector" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regime_snapshots" (
	"date" text PRIMARY KEY NOT NULL,
	"raw_vector" jsonb NOT NULL,
	"z_vector" jsonb NOT NULL,
	"meta" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "events_embedding_idx" ON "events" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "events_regime_tags_idx" ON "events" USING gin ("regime_tags");--> statement-breakpoint
CREATE INDEX "events_date_idx" ON "events" USING btree ("date");