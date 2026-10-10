-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `full_name` VARCHAR(191) NULL,
    `pronouns` VARCHAR(80) NULL,
    `gender` VARCHAR(80) NULL,
    `bio` TEXT NULL,
    `date_of_birth` DATE NULL,
    `city` VARCHAR(120) NULL,
    `neighborhood` VARCHAR(120) NULL,
    `occupation` VARCHAR(191) NULL,
    `education` VARCHAR(191) NULL,
    `photos` JSON NULL,
    `profile_completion` INTEGER NOT NULL DEFAULT 0,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `verification_badges` JSON NULL,
    `onboarding_completed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_city_neighborhood_idx`(`city`, `neighborhood`),
    INDEX `users_onboarding_completed_profile_completion_idx`(`onboarding_completed`, `profile_completion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preferences` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `age_min` INTEGER NOT NULL DEFAULT 18,
    `age_max` INTEGER NOT NULL DEFAULT 99,
    `distance_km` INTEGER NOT NULL DEFAULT 25,
    `looking_for` VARCHAR(80) NOT NULL DEFAULT 'exploring',
    `interested_in` JSON NULL,
    `budget_min` INTEGER NOT NULL DEFAULT 0,
    `budget_max` INTEGER NOT NULL DEFAULT 10000,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `preferences_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interests` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `category` VARCHAR(120) NOT NULL,
    `icon` VARCHAR(80) NULL,

    UNIQUE INDEX `interests_name_key`(`name`),
    INDEX `interests_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_interests` (
    `user_id` VARCHAR(191) NOT NULL,
    `interest_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_interests_interest_id_idx`(`interest_id`),
    PRIMARY KEY (`user_id`, `interest_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `likes` (
    `id` VARCHAR(191) NOT NULL,
    `liker_id` VARCHAR(191) NOT NULL,
    `liked_id` VARCHAR(191) NOT NULL,
    `is_super_like` BOOLEAN NOT NULL DEFAULT false,
    `intro_note` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `likes_liked_id_created_at_idx`(`liked_id`, `created_at`),
    UNIQUE INDEX `likes_liker_id_liked_id_key`(`liker_id`, `liked_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passes` (
    `id` VARCHAR(191) NOT NULL,
    `passer_id` VARCHAR(191) NOT NULL,
    `passed_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `passes_passed_id_created_at_idx`(`passed_id`, `created_at`),
    UNIQUE INDEX `passes_passer_id_passed_id_key`(`passer_id`, `passed_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` VARCHAR(191) NOT NULL,
    `user1_id` VARCHAR(191) NOT NULL,
    `user2_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `matches_user2_id_created_at_idx`(`user2_id`, `created_at`),
    UNIQUE INDEX `matches_user1_id_user2_id_key`(`user1_id`, `user2_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` VARCHAR(191) NOT NULL,
    `match_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_message_at` DATETIME(3) NULL,

    UNIQUE INDEX `conversations_match_id_key`(`match_id`),
    INDEX `conversations_last_message_at_idx`(`last_message_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversation_id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `read_at` DATETIME(3) NULL,

    INDEX `messages_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    INDEX `messages_sender_id_created_at_idx`(`sender_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocks` (
    `id` VARCHAR(191) NOT NULL,
    `blocker_id` VARCHAR(191) NOT NULL,
    `blocked_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `blocks_blocked_id_idx`(`blocked_id`),
    UNIQUE INDEX `blocks_blocker_id_blocked_id_key`(`blocker_id`, `blocked_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(191) NOT NULL,
    `reporter_id` VARCHAR(191) NOT NULL,
    `reported_user_id` VARCHAR(191) NULL,
    `category` VARCHAR(120) NOT NULL,
    `details` TEXT NULL,
    `status` VARCHAR(40) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reports_status_created_at_idx`(`status`, `created_at`),
    INDEX `reports_reported_user_id_created_at_idx`(`reported_user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saved_date_plans` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `category` VARCHAR(80) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `neighborhood` VARCHAR(191) NOT NULL DEFAULT '',
    `budget_label` VARCHAR(120) NOT NULL DEFAULT '',
    `preferred_date` DATE NULL,
    `image_url` VARCHAR(1000) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `saved_date_plans_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `preferences` ADD CONSTRAINT `preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_interests` ADD CONSTRAINT `user_interests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_interests` ADD CONSTRAINT `user_interests_interest_id_fkey` FOREIGN KEY (`interest_id`) REFERENCES `interests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_liker_id_fkey` FOREIGN KEY (`liker_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `likes_liked_id_fkey` FOREIGN KEY (`liked_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passes` ADD CONSTRAINT `passes_passer_id_fkey` FOREIGN KEY (`passer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passes` ADD CONSTRAINT `passes_passed_id_fkey` FOREIGN KEY (`passed_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_user1_id_fkey` FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_user2_id_fkey` FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blocks` ADD CONSTRAINT `blocks_blocker_id_fkey` FOREIGN KEY (`blocker_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blocks` ADD CONSTRAINT `blocks_blocked_id_fkey` FOREIGN KEY (`blocked_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reported_user_id_fkey` FOREIGN KEY (`reported_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saved_date_plans` ADD CONSTRAINT `saved_date_plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
