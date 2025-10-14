CREATE TABLE "ai_advisor_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"phase" varchar(50),
	"extracted_data" jsonb,
	"function_calls" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_advisor_plan_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"overridden_by" varchar(255) NOT NULL,
	"field" varchar(100) NOT NULL,
	"ai_recommended_value" jsonb NOT NULL,
	"advisor_override_value" jsonb NOT NULL,
	"reason" text NOT NULL,
	"client_approved" boolean DEFAULT false NOT NULL,
	"client_approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_advisor_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"category" varchar(50) NOT NULL,
	"priority" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"detailed_explanation" text NOT NULL,
	"action_steps" jsonb NOT NULL,
	"estimated_impact" jsonb,
	"regulatory_reference" varchar(255),
	"overridden" boolean DEFAULT false NOT NULL,
	"override_reason" text,
	"override_by" varchar(255),
	"override_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_advisor_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity" timestamp with time zone DEFAULT now() NOT NULL,
	"current_phase" varchar(50) DEFAULT 'personal_profile' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_profile" jsonb DEFAULT '{}' NOT NULL,
	"total_questions_asked" integer DEFAULT 0 NOT NULL,
	"questions_answered" integer DEFAULT 0 NOT NULL,
	"phases_completed" jsonb DEFAULT '[]',
	"confidence_score" integer DEFAULT 0 NOT NULL,
	"needs_clarification" jsonb DEFAULT '[]',
	"ready_for_projection" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_advisor_messages" ADD CONSTRAINT "ai_advisor_messages_session_id_ai_advisor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_advisor_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_advisor_plan_overrides" ADD CONSTRAINT "ai_advisor_plan_overrides_session_id_ai_advisor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_advisor_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_advisor_recommendations" ADD CONSTRAINT "ai_advisor_recommendations_session_id_ai_advisor_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_advisor_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_advisor_sessions" ADD CONSTRAINT "ai_advisor_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_messages_session_id" ON "ai_advisor_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_ai_messages_timestamp" ON "ai_advisor_messages" USING btree ("session_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_ai_messages_role" ON "ai_advisor_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_ai_overrides_session_id" ON "ai_advisor_plan_overrides" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_ai_overrides_field" ON "ai_advisor_plan_overrides" USING btree ("field");--> statement-breakpoint
CREATE INDEX "idx_ai_overrides_approved" ON "ai_advisor_plan_overrides" USING btree ("client_approved");--> statement-breakpoint
CREATE INDEX "idx_ai_recommendations_session_id" ON "ai_advisor_recommendations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_ai_recommendations_priority" ON "ai_advisor_recommendations" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_ai_recommendations_category" ON "ai_advisor_recommendations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_ai_recommendations_overridden" ON "ai_advisor_recommendations" USING btree ("overridden");--> statement-breakpoint
CREATE INDEX "idx_ai_sessions_user_id" ON "ai_advisor_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_sessions_active" ON "ai_advisor_sessions" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_ai_sessions_last_activity" ON "ai_advisor_sessions" USING btree ("last_activity");