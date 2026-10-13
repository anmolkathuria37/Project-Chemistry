-- Auth.js identity, OAuth accounts, and credentials support.
ALTER TABLE `users`
  ADD COLUMN `name` VARCHAR(191) NULL,
  ADD COLUMN `email_verified` DATETIME(3) NULL,
  ADD COLUMN `image` VARCHAR(1000) NULL,
  ADD COLUMN `password_hash` VARCHAR(255) NULL;

CREATE TABLE `auth_accounts` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `provider_account_id` VARCHAR(191) NOT NULL,
  `refresh_token` TEXT NULL,
  `access_token` TEXT NULL,
  `expires_at` INTEGER NULL,
  `token_type` VARCHAR(191) NULL,
  `scope` VARCHAR(191) NULL,
  `id_token` TEXT NULL,
  `session_state` VARCHAR(191) NULL,
  UNIQUE INDEX `auth_accounts_provider_provider_account_id_key`(`provider`, `provider_account_id`),
  INDEX `auth_accounts_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `auth_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `auth_sessions` (
  `id` VARCHAR(191) NOT NULL,
  `session_token` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,
  UNIQUE INDEX `auth_sessions_session_token_key`(`session_token`),
  INDEX `auth_sessions_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `auth_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `auth_verification_tokens` (
  `identifier` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,
  UNIQUE INDEX `auth_verification_tokens_token_key`(`token`),
  UNIQUE INDEX `auth_verification_tokens_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
