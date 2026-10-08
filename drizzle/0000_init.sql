-- pg_trgm powers fuzzy title search (listings_title_trgm_idx). Trusted extension: DB owners may create it.
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('APPROVE_USER', 'REJECT_USER', 'VIEW_VERIFICATION_DOCUMENT', 'WARN_USER', 'SUSPEND_USER', 'BAN_USER', 'RESTORE_USER', 'REMOVE_LISTING', 'RESTORE_LISTING', 'RESOLVE_REPORT', 'DISMISS_REPORT', 'RESOLVE_DISPUTE', 'CANCEL_ORDER', 'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'CREATE_DELIVERY_PROVIDER', 'UPDATE_DELIVERY_PROVIDER', 'UPDATE_PROHIBITED_ITEMS', 'UPDATE_SETTINGS');--> statement-breakpoint
CREATE TYPE "public"."audit_target" AS ENUM('USER', 'VERIFICATION', 'LISTING', 'REPORT', 'ORDER', 'CATEGORY', 'DELIVERY_PROVIDER', 'PROHIBITED_ITEM', 'SETTINGS');--> statement-breakpoint
CREATE TYPE "public"."fulfilment_method" AS ENUM('MEETUP', 'DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."id_type" AS ENUM('NATIONAL_ID', 'DRIVERS_LICENSE', 'PASSPORT', 'UMID', 'OTHER_GOVERNMENT_ID');--> statement-breakpoint
CREATE TYPE "public"."item_condition" AS ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'FOR_PARTS');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'REMOVED');--> statement-breakpoint
CREATE TYPE "public"."location_level" AS ENUM('REGION', 'PROVINCE', 'CITY_MUNICIPALITY', 'BARANGAY');--> statement-breakpoint
CREATE TYPE "public"."message_kind" AS ENUM('TEXT', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'NEW_MESSAGE', 'PURCHASE_REQUEST', 'REQUEST_ACCEPTED', 'REQUEST_DECLINED', 'ORDER_UPDATE', 'LISTING_SOLD', 'LISTING_REMOVED', 'FAVORITE_UPDATE', 'NEW_REVIEW', 'REPORT_UPDATE', 'ACCOUNT_WARNING', 'ACCOUNT_SUSPENDED', 'ACCOUNT_BANNED', 'ACCOUNT_RESTORED', 'NEARBY_RECOMMENDATION');--> statement-breakpoint
CREATE TYPE "public"."order_action" AS ENUM('REQUEST', 'ACCEPT', 'DECLINE', 'WITHDRAW', 'EXPIRE', 'SET_MEETUP', 'SET_DELIVERY', 'CANCEL', 'CONFIRM_HANDOVER', 'CONFIRM_RECEIVED', 'AUTO_COMPLETE', 'DISPUTE', 'ADMIN_RESOLVE', 'ADMIN_CANCEL');--> statement-breakpoint
CREATE TYPE "public"."order_close_reason" AS ENUM('DECLINED', 'WITHDRAWN', 'EXPIRED', 'CANCELLED_BY_BUYER', 'CANCELLED_BY_SELLER', 'LISTING_UNAVAILABLE', 'ACCOUNT_RESTRICTED', 'ADMIN_ACTION');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'CONFIRMED', 'FOR_MEETUP', 'FOR_DELIVERY', 'COMPLETED', 'CANCELLED', 'DISPUTED');--> statement-breakpoint
CREATE TYPE "public"."ratee_role" AS ENUM('BUYER', 'SELLER');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('SCAM', 'FAKE_ITEM', 'PROHIBITED_ITEM', 'MISLEADING', 'DUPLICATE', 'INAPPROPRIATE', 'FAKE_ACCOUNT', 'HARASSMENT', 'SUSPICIOUS', 'SPAM', 'THREATS', 'DISPUTE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."report_target" AS ENUM('LISTING', 'USER', 'MESSAGE', 'ORDER');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'SUSPENDED', 'BANNED');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"level" "location_level" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"psgc_code" text NOT NULL,
	"is_city" boolean DEFAULT false NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"is_service_area" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"username" text,
	"mobile_number" text NOT NULL,
	"municipality_id" uuid NOT NULL,
	"barangay_id" uuid NOT NULL,
	"terms_accepted_at" timestamp with time zone NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"verification_status" "verification_status" DEFAULT 'UNVERIFIED' NOT NULL,
	"status_reason" text,
	"suspended_until" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"rating_sum" integer DEFAULT 0 NOT NULL,
	"completed_orders" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prohibited_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_listing_id_pk" PRIMARY KEY("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"thumb_key" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" bigint NOT NULL,
	"is_negotiable" boolean DEFAULT false NOT NULL,
	"condition" "item_condition" NOT NULL,
	"brand" text,
	"model" text,
	"status" "listing_status" DEFAULT 'DRAFT' NOT NULL,
	"is_manually_reserved" boolean DEFAULT false NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"quantity_reserved" integer DEFAULT 0 NOT NULL,
	"quantity_sold" integer DEFAULT 0 NOT NULL,
	"municipality_id" uuid NOT NULL,
	"barangay_id" uuid NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"view_count" integer DEFAULT 0 NOT NULL,
	"flagged_reason" text,
	"published_at" timestamp with time zone,
	"sold_at" timestamp with time zone,
	"removed_at" timestamp with time zone,
	"removed_by_id" uuid,
	"removal_reason" text,
	"search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('simple', coalesce(title, '')), 'A') || setweight(to_tsvector('simple', coalesce(brand, '') || ' ' || coalesce(model, '')), 'B') || setweight(to_tsvector('simple', coalesce(description, '')), 'C')) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listings_price_nonneg" CHECK ("listings"."price" >= 0),
	CONSTRAINT "listings_quantity_pos" CHECK ("listings"."quantity" >= 1),
	CONSTRAINT "listings_stock_valid" CHECK ("listings"."quantity_reserved" >= 0 AND "listings"."quantity_sold" >= 0 AND "listings"."quantity_reserved" + "listings"."quantity_sold" <= "listings"."quantity")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"buyer_last_read_at" timestamp with time zone,
	"seller_last_read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_distinct_parties" CHECK ("conversations"."buyer_id" <> "conversations"."seller_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid,
	"kind" "message_kind" DEFAULT 'TEXT' NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"blocker_id" uuid NOT NULL,
	"blocked_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_blocks_blocker_id_blocked_id_pk" PRIMARY KEY("blocker_id","blocked_id")
);
--> statement-breakpoint
CREATE TABLE "delivery_provider_areas" (
	"provider_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	CONSTRAINT "delivery_provider_areas_provider_id_location_id_pk" PRIMARY KEY("provider_id","location_id")
);
--> statement-breakpoint
CREATE TABLE "delivery_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"contact" text,
	"service_area_note" text,
	"base_fee_min" bigint,
	"base_fee_max" bigint,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" "order_action" NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"conversation_id" uuid,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"agreed_price" bigint NOT NULL,
	"listing_price_at_request" bigint NOT NULL,
	"buyer_note" text,
	"preferred_method" "fulfilment_method" NOT NULL,
	"method" "fulfilment_method",
	"meetup_place" text,
	"meetup_lat" double precision,
	"meetup_lng" double precision,
	"meetup_at" timestamp with time zone,
	"delivery_provider_id" uuid,
	"delivery_fee_min" bigint,
	"delivery_fee_max" bigint,
	"delivery_address" text,
	"accepted_at" timestamp with time zone,
	"seller_confirmed_at" timestamp with time zone,
	"buyer_confirmed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"close_reason" "order_close_reason",
	"closed_by_id" uuid,
	"close_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_distinct_parties" CHECK ("orders"."buyer_id" <> "orders"."seller_id"),
	CONSTRAINT "orders_quantity_pos" CHECK ("orders"."quantity" >= 1),
	CONSTRAINT "orders_price_nonneg" CHECK ("orders"."agreed_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"rater_id" uuid NOT NULL,
	"ratee_id" uuid NOT NULL,
	"ratee_role" "ratee_role" NOT NULL,
	"stars" smallint NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ratings_stars_range" CHECK ("ratings"."stars" BETWEEN 1 AND 5),
	CONSTRAINT "ratings_distinct_parties" CHECK ("ratings"."rater_id" <> "ratings"."ratee_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" "audit_action" NOT NULL,
	"target_type" "audit_target" NOT NULL,
	"target_id" uuid,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"href" text,
	"ref_type" text,
	"ref_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"target_type" "report_target" NOT NULL,
	"listing_id" uuid,
	"reported_user_id" uuid,
	"message_id" uuid,
	"order_id" uuid,
	"reason" "report_reason" NOT NULL,
	"description" text,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"assigned_admin_id" uuid,
	"resolution_note" text,
	"resolved_by_id" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"id_type" "id_type" NOT NULL,
	"front_image_key" text,
	"back_image_key" text,
	"status" "verification_status" DEFAULT 'PENDING' NOT NULL,
	"rejection_reason" text,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp with time zone,
	"documents_purged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_id_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_municipality_id_locations_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_barangay_id_locations_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_municipality_id_locations_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_barangay_id_locations_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_removed_by_id_users_id_fk" FOREIGN KEY ("removed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_provider_areas" ADD CONSTRAINT "delivery_provider_areas_provider_id_delivery_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."delivery_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_provider_areas" ADD CONSTRAINT "delivery_provider_areas_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_provider_id_delivery_providers_id_fk" FOREIGN KEY ("delivery_provider_id") REFERENCES "public"."delivery_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_closed_by_id_users_id_fk" FOREIGN KEY ("closed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rater_id_users_id_fk" FOREIGN KEY ("rater_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ratee_id_users_id_fk" FOREIGN KEY ("ratee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_assigned_admin_id_users_id_fk" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "locations_psgc_code_uq" ON "locations" USING btree ("psgc_code");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_parent_slug_uq" ON "locations" USING btree ("parent_id","slug");--> statement-breakpoint
CREATE INDEX "locations_level_idx" ON "locations" USING btree ("level");--> statement-breakpoint
CREATE INDEX "locations_parent_idx" ON "locations" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_verifications_identifier_idx" ON "auth_verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_verification_status_idx" ON "users" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "users_municipality_idx" ON "users" USING btree ("municipality_id");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_uq" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_sort_idx" ON "categories" USING btree ("parent_id","sort_order");--> statement-breakpoint
CREATE INDEX "favorites_listing_idx" ON "favorites" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_images_listing_pos_idx" ON "listing_images" USING btree ("listing_id","position");--> statement-breakpoint
CREATE INDEX "listings_status_published_idx" ON "listings" USING btree ("status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "listings_seller_status_idx" ON "listings" USING btree ("seller_id","status");--> statement-breakpoint
CREATE INDEX "listings_category_status_idx" ON "listings" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "listings_municipality_status_idx" ON "listings" USING btree ("municipality_id","status");--> statement-breakpoint
CREATE INDEX "listings_price_idx" ON "listings" USING btree ("price");--> statement-breakpoint
CREATE INDEX "listings_lat_lng_idx" ON "listings" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "listings_search_idx" ON "listings" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "listings_title_trgm_idx" ON "listings" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_listing_buyer_uq" ON "conversations" USING btree ("listing_id","buyer_id");--> statement-breakpoint
CREATE INDEX "conversations_buyer_recent_idx" ON "conversations" USING btree ("buyer_id","last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "conversations_seller_recent_idx" ON "conversations" USING btree ("seller_id","last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "user_blocks_blocked_idx" ON "user_blocks" USING btree ("blocked_id");--> statement-breakpoint
CREATE INDEX "delivery_provider_areas_location_idx" ON "delivery_provider_areas" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "order_events_order_created_idx" ON "order_events" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_one_open_per_buyer_listing_uq" ON "orders" USING btree ("listing_id","buyer_id") WHERE "orders"."status" IN ('PENDING','CONFIRMED','FOR_MEETUP','FOR_DELIVERY','DISPUTED');--> statement-breakpoint
CREATE INDEX "orders_buyer_status_idx" ON "orders" USING btree ("buyer_id","status");--> statement-breakpoint
CREATE INDEX "orders_seller_status_idx" ON "orders" USING btree ("seller_id","status");--> statement-breakpoint
CREATE INDEX "orders_listing_status_idx" ON "orders" USING btree ("listing_id","status");--> statement-breakpoint
CREATE INDEX "orders_status_updated_idx" ON "orders" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_order_rater_uq" ON "ratings" USING btree ("order_id","rater_id");--> statement-breakpoint
CREATE INDEX "ratings_ratee_created_idx" ON "ratings" USING btree ("ratee_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_created_idx" ON "audit_logs" USING btree ("actor_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_logs_action_created_idx" ON "audit_logs" USING btree ("action","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id") WHERE "notifications"."read_at" IS NULL;--> statement-breakpoint
CREATE INDEX "reports_status_created_idx" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "reports_reported_user_idx" ON "reports" USING btree ("reported_user_id");--> statement-breakpoint
CREATE INDEX "reports_listing_idx" ON "reports" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "reports_order_idx" ON "reports" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "user_verifications_status_created_idx" ON "user_verifications" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "user_verifications_user_idx" ON "user_verifications" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_verifications_one_pending_uq" ON "user_verifications" USING btree ("user_id") WHERE "user_verifications"."status" = 'PENDING';