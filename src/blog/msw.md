---
title: "Test That Jawn: MSW"
pubDate: 2026-08-21
author: "Leigh Michael Forrest"
image:
  url: "https://docs.astro.build/default-og-image.png"
  alt: "The Astro logo against a dark background with planets."
---
```bash
npm i -D msw
```

```typescript
/* tests/mocks/handlers.ts */
import { http, HttpResponse } from "msw";
import { BASE_URL } from "@/settings";

export const handlers = [
  http.get(`${BASE_URL}/auth/user/`, () =>
    HttpResponse.json({
      pk: 1,
      email: "testuser@example.com",
    }),
  ),
];

```

```typescript
/* tests/mocks/server.ts*/
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```
```typescript
/* tests/setup.ts */
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { server } from "./mocks/server";

expect.extend(matchers);

beforeAll(() => server.listen());

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
  server.resetHandlers();
});

afterAll(() => server.close());

```