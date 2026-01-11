/**
 * Test Setup
 *
 * Global test configuration and mocks.
 */

import "@testing-library/jest-dom/vitest";

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.DATABASE_URL_UNPOOLED = "postgresql://test:test@localhost:5432/test";
process.env.OPENAI_API_KEY = "test-api-key";
