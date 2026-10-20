CREATE TABLE `invoice_custom_fields` (
	`invoice_id` text NOT NULL,
	`position` integer NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`visible` integer NOT NULL,
	PRIMARY KEY(`invoice_id`, `position`),
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `invoice_line_items` (
	`invoice_id` text NOT NULL,
	`position` integer NOT NULL,
	`description` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`line_total_cents` integer NOT NULL,
	PRIMARY KEY(`invoice_id`, `position`),
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_number` text NOT NULL,
	`issue_date` text NOT NULL,
	`due_date` text NOT NULL,
	`business_name` text NOT NULL,
	`business_email` text NOT NULL,
	`business_address` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_address` text NOT NULL,
	`discount_cents` integer NOT NULL,
	`tax_rate_percent` real NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`tax_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`notes` text NOT NULL,
	`accent_color` text NOT NULL,
	`sent_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_number_unique` ON `invoices` (lower("invoice_number"));--> statement-breakpoint
CREATE INDEX `invoices_issue_date_idx` ON `invoices` (`issue_date`);