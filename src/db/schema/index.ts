/**
 * Database Schema Index
 *
 * Exports all schema definitions for Drizzle ORM.
 * This file is the single source of truth for the database schema.
 */

// Entity core tables
export * from "./entities";
export * from "./blocks";

// Entity type extensions
export * from "./activities";
export * from "./lessons";
export * from "./courses";
export * from "./assessments";
export * from "./certificates";

// Media library
export * from "./media";
