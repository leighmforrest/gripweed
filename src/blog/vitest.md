---
title: "Test That Jawn: React TS Edition"
pubDate: 2026-08-20
author: "Leigh Michael Forrest"
image:
  url: "https://docs.astro.build/default-og-image.png"
  alt: "The Astro logo against a dark background with planets."
---

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/coverage-v8
```

```typescript
// vite.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  envDir: "./",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["components/ui/**"],
    },
  },
});

```

```typescript
// tests/setup.ts
import { expect, afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

beforeEach(() => {
  localStorage.clear();

  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  globalThis.ResizeObserver = ResizeObserverMock;
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
```

```json
/* tsconfig.app.json */
{
  "compilerOptions": {
    ...
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"],
    ...

    "include": ["src", "tests"]
}
```