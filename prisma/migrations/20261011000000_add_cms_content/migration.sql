CREATE TABLE `cms_content` (
  `id` VARCHAR(191) NOT NULL,
  `section` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(120) NOT NULL DEFAULT '',
  `neighborhood` VARCHAR(191) NOT NULL DEFAULT '',
  `budget_label` VARCHAR(120) NOT NULL DEFAULT '',
  `image_url` VARCHAR(1000) NOT NULL DEFAULT '',
  `published` BOOLEAN NOT NULL DEFAULT false,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `cms_content_section_slug_key`(`section`, `slug`),
  INDEX `cms_content_section_published_sort_order_idx`(`section`, `published`, `sort_order`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;