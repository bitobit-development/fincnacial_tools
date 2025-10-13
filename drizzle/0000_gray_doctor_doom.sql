CREATE TABLE "cpi_data_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"cpi_value" numeric(6, 2) NOT NULL,
	"annual_rate" numeric(5, 2) NOT NULL,
	"monthly_rate" numeric(5, 2),
	"category" varchar(100) DEFAULT 'All items' NOT NULL,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"source" varchar(50),
	CONSTRAINT "unique_year_month" UNIQUE("year","month","category")
);
--> statement-breakpoint
CREATE TABLE "discovery_funds_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fund_name" varchar(255) NOT NULL,
	"fund_code" varchar(50) NOT NULL,
	"fund_type" varchar(50),
	"cagr_1y" numeric(5, 2),
	"cagr_3y" numeric(5, 2),
	"cagr_5y" numeric(5, 2),
	"cagr_10y" numeric(5, 2),
	"volatility" numeric(5, 2),
	"sharpe_ratio" numeric(5, 3),
	"inception_date" date,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discovery_funds_cache_fund_code_unique" UNIQUE("fund_code")
);
--> statement-breakpoint
CREATE TABLE "projection_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"scenario_id" uuid,
	"year" integer NOT NULL,
	"age" integer NOT NULL,
	"beginning_balance" numeric(15, 2) NOT NULL,
	"contributions" numeric(15, 2) NOT NULL,
	"investment_return" numeric(15, 2) NOT NULL,
	"withdrawals" numeric(15, 2) NOT NULL,
	"tax_paid" numeric(15, 2) NOT NULL,
	"ending_balance" numeric(15, 2) NOT NULL,
	"inflation_adjusted_balance" numeric(15, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_plan_year" UNIQUE("plan_id","scenario_id","year")
);
--> statement-breakpoint
CREATE TABLE "retirement_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_name" varchar(255) NOT NULL,
	"description" text,
	"current_age" integer NOT NULL,
	"retirement_age" integer NOT NULL,
	"starting_balance" numeric(15, 2) NOT NULL,
	"monthly_contribution" numeric(15, 2) NOT NULL,
	"annual_return" numeric(5, 2) NOT NULL,
	"inflation" numeric(5, 2) NOT NULL,
	"drawdown_rate" numeric(5, 2) NOT NULL,
	"target_monthly_today" numeric(15, 2),
	"fund_name" varchar(255),
	"fund_code" varchar(50),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sars_tax_tables_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tax_year" varchar(10) NOT NULL,
	"income_tax_brackets" jsonb NOT NULL,
	"primary_rebate" numeric(10, 2) NOT NULL,
	"secondary_rebate" numeric(10, 2) NOT NULL,
	"tertiary_rebate" numeric(10, 2) NOT NULL,
	"ra_lump_sum_brackets" jsonb NOT NULL,
	"cgt_inclusion_rate" numeric(5, 4) NOT NULL,
	"cgt_annual_exclusion" numeric(10, 2) NOT NULL,
	"dividend_wht_rate" numeric(5, 4) NOT NULL,
	"interest_exempt_under65" numeric(10, 2) NOT NULL,
	"interest_exempt_over65" numeric(10, 2) NOT NULL,
	"scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"source" varchar(50),
	CONSTRAINT "sars_tax_tables_cache_tax_year_unique" UNIQUE("tax_year")
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"scenario_name" varchar(255) NOT NULL,
	"scenario_type" varchar(50),
	"current_age" integer NOT NULL,
	"retirement_age" integer NOT NULL,
	"starting_balance" numeric(15, 2) NOT NULL,
	"monthly_contribution" numeric(15, 2) NOT NULL,
	"annual_return" numeric(5, 2) NOT NULL,
	"inflation" numeric(5, 2) NOT NULL,
	"drawdown_rate" numeric(5, 2) NOT NULL,
	"target_monthly_today" numeric(15, 2),
	"fund_name" varchar(255),
	"fund_code" varchar(50),
	"projected_value_at_retirement" numeric(15, 2),
	"total_contributed" numeric(15, 2),
	"total_withdrawn" numeric(15, 2),
	"total_tax_paid" numeric(15, 2),
	"net_after_tax_income" numeric(15, 2),
	"fund_depletion_age" integer,
	"wealth_retention_ratio" numeric(5, 4),
	"effective_tax_rate" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"auth_provider" varchar(50),
	"auth_provider_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "projection_history" ADD CONSTRAINT "projection_history_plan_id_retirement_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."retirement_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projection_history" ADD CONSTRAINT "projection_history_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retirement_plans" ADD CONSTRAINT "retirement_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_plan_id_retirement_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."retirement_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cpi_year_month" ON "cpi_data_cache" USING btree ("year","month");--> statement-breakpoint
CREATE INDEX "idx_cpi_updated" ON "cpi_data_cache" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "idx_discovery_funds_code" ON "discovery_funds_cache" USING btree ("fund_code");--> statement-breakpoint
CREATE INDEX "idx_discovery_funds_type" ON "discovery_funds_cache" USING btree ("fund_type");--> statement-breakpoint
CREATE INDEX "idx_discovery_funds_updated" ON "discovery_funds_cache" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "idx_projection_plan_id" ON "projection_history" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_projection_scenario_id" ON "projection_history" USING btree ("scenario_id");--> statement-breakpoint
CREATE INDEX "idx_projection_year" ON "projection_history" USING btree ("year");--> statement-breakpoint
CREATE INDEX "idx_retirement_plans_user_id" ON "retirement_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_retirement_plans_created_at" ON "retirement_plans" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_retirement_plans_user_default" ON "retirement_plans" USING btree ("user_id","is_default");--> statement-breakpoint
CREATE INDEX "idx_sars_tax_year" ON "sars_tax_tables_cache" USING btree ("tax_year");--> statement-breakpoint
CREATE INDEX "idx_scenarios_plan_id" ON "scenarios" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_scenarios_type" ON "scenarios" USING btree ("scenario_type");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_auth_provider" ON "users" USING btree ("auth_provider","auth_provider_id");