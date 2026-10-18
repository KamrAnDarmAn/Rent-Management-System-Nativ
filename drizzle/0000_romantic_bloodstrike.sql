CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `closed_months` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer,
	`date` text NOT NULL,
	`amount` integer NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "expenses_positive" CHECK("expenses"."amount">0)
);
--> statement-breakpoint
CREATE INDEX `expenses_date` ON `expenses` (`date`);--> statement-breakpoint
CREATE TABLE `goods` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `metadata` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recovery_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`action` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rent_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`date` text NOT NULL,
	`amount` integer NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "receipts_positive" CHECK("rent_receipts"."amount">0)
);
--> statement-breakpoint
CREATE INDEX `receipts_shop_date` ON `rent_receipts` (`shop_id`,`date`);--> statement-breakpoint
CREATE TABLE `rent_settlements` (
	`id` text PRIMARY KEY NOT NULL,
	`shop_id` integer NOT NULL,
	`date` text NOT NULL,
	`amount` integer NOT NULL,
	`payload` text NOT NULL,
	FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "settlements_positive" CHECK("rent_settlements"."amount">0)
);
--> statement-breakpoint
CREATE TABLE `shops` (
	`id` integer PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`archived` integer NOT NULL,
	`payload` text NOT NULL,
	CONSTRAINT "shops_archived_valid" CHECK("shops"."archived" IN (0,1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `active_shop_number` ON `shops` ("number" COLLATE NOCASE) WHERE "shops"."archived"=0;