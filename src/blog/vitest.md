---
title: "Test That Jawn: React TS Edition"
pubDate: 2026-08-20
author: "Leigh Michael Forrest"
image: "../images/blog/vitest.jpeg"
altText: 'Photo by <a href="https://unsplash.com/@uxindo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">UX Indonesia</a> on <a href="https://unsplash.com/photos/person-in-blue-long-sleeve-shirt-using-black-laptop-computer-5QiGvmyJTsc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>'
---
Frontend testing has a lot of moving pieces, so I will show you how to build a working setup
incrementally. In this post I will show you how to test React TypeScript code with the tools of the trade: Vitest, React Testing Library, and user-event.

## Installation

To get started with testing, you need to install packages needed to run the tests. Vite does not
include testing packages, so they will need to be installed.

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/coverage-v8

mkdir tests
```


| Package| Description |
| -------- | -------- |
| vitest | The test runner |
| jsdom | Library that emulates the browser in tests |
| @testing-library/react | Testing tools used to test React components |
| @testing-library/user-event | Library that simulates user interactions |
| @testing-library/jest-dom | Provides DOM matchers for tests |
| @vitest/coverage-v8 | Generates test coverage reports |

Next we will need to configure vite for testing: 

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

Notice that that `defineConfig` is imported from `vitest/config`. Rather than use the stock `defineConfig`, the one from vitest is used. It provides Vitest's configuration types and lets
the `test` configuration be understood by TypeScript.

`test` is the nested object inside the `defineConfig` object. We set up globals i.e. `describe`, `it`, and `expect` to be available without explicit imports. We will be using `jsdom` in our test environment, and we establish the file to set up the tests. And it has an object to set up test coverage. The provider will be `V8`, reports
will be generated with both text and html, and we exclude the Chakra UI components in our project.   The setup file will be explained next.

In the setup file, we set up and do teardown work. Here we extend `jest-dom` matchers in `expect`,
clear the storage before every test case. And we mock `window.matchMedia` and `ResizeObserverMock` before every test case as well. `jsdom` gives our tests a browser-like environment, but it doesn't
implement every browser API. When a component depends on an API that jsdom doesn't provide, the component can fail before the actual test even runs. That's why we provide a couple of small mocks here.`ResizeObserver` is a browser API used to react to changes in an element's size. Some UI libraries use it internally, so we provide a minimal mock for the test environment.

After each test case we will need to unmount all React components with the `cleanup()` function and reset all mocks.

```typescript
// tests/setup.ts
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
In the `tsconfig.app.json` file, it is useful to add the globals to the compiler, and to include the
`tests` directory. With `globals: true`, the Vitest APIs are available without imports at runtime. Adding vitest/globals to types tells the TypeScript compiler about those globals at compile/editor time. You could very well write code that works, but VSCode will complain, and, if you are fortunate, explicitly import globals on its own. If not, your code will be underlined in red when it shouldn't.

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

Don't forget to include the test script in your `package.json`: 

```json
"scripts": {
    ...
    "test": "vitest --coverage"
  },
```

Run `npm run test` and the tests will run with coverage reports generated.

## The Basics of Vitest

The basic structure of React testing with vitest is you organize a group of tests with the `describe`
function, and have test cases with the `it` function. The `describe` function groups related tests together. In `expect`, you have an item (object, variable) as the argument, and chain a matcher to it, such as `toBe()`. You can even add `.not` before the matcher get the opposite.

```typescript
describe("Truth", ()=> {
  it("is true", ()=> {
    expect(true).toBe(true);
  })

  it("is false", ()=> {
    expect(false).not.toBe(true);
  })
})
```
Vitest has a number of matchers that check for different values. You can check the official documents for them all [here](https://vitest.dev/guide/learn/matchers). Here are some useful ones:

| Matcher | Description |
| -------- | -------- |
| toEqual | Expect that a value is deeply equal to another value. 
| toBeNull | Checks that the value is null |
| toBeCloseTo | Checks that a number is close to another number. Useful for floating-point calculations. |
| toContain | Checks that an array or a string contains a certain item or substring |
| toMatchObject | Checks that an object contains all the expected properties and values while allowing additional properties |

## The Basics of React Testing Library

When a test needs to inspect a React component, we render it with the `render()` function. `screen` provides query methods for finding elements in the rendered component. `screen.debug()` will print the component's markup to the screen.

### render() and screen
```typescript
/** HelloWorld.test.tsx */
import {render, screen} from '@testing-library/react'

const HelloWorld = () => (<div>
  <h1>Hello World!</h1>
  <button>Click!</button>
</div>)

describe("HelloWorld", () => {
  it("renders", () => {
    render(<HelloWorld />)

    screen.debug()
  })
})
```

### Queries

The `screen` object lets us query rendered components.

```typescript
/** HelloWorld.test.tsx */
import {render, screen} from '@testing-library/react'

const HelloWorld = () => (<div>
  <h1>Hello World!</h1>
  <button>Click!</button>
</div>)

describe("HelloWorld", () => {
  it("renders", () => {
    render(<HelloWorld />)

    const message = screen.getByRole("heading")
    const button = screen.getByRole("button", { name: /Click/i })
  })
})
```

RTL queries come in three basic stripes. `screen.getBy` lets us obtain a DOM element when we expect it to be there. `screen.findBy` is an asynchronous query. It is for elements that aren't immediately
available but are expected to appear after some asynchronous operation. `screen.queryBy` returns the element if it exists, but returns `null` instead of throwing an error when it doesn't. This makes it useful when you're testing that an element is not rendered.

There are many queries you can use on elements. You can see all of them [here](https://testing-library.com/docs/queries/about). Here are some of them:

| Query   | Description |
|---------|-------------|
| *byRole | Finds an element based on accessible role|
| *byText | Finds an element based on the text it contains|
| *byDisplayValue | Finds a form element based on the currently displayed value in `input`, `textarea`, and `select` elements |
| *byLabelText | Finds a form element based on its associated label text |
| *byTestId | Finds an element with a particular `data-testid` value e.g.  <div data-testid="custom-element" />

One note on `*byRole`. You can query not just by role but also by accessible name. In the test
above, There was an object in the second argument of `getByRole` It had a member called `name` and it
value `/click/i`. Here the value of `name` is `/click/i`, a regular expression. The regular expression lets us match `Click!` without requiring an exact match or worrying about capitalization.
If you use a string instead, the accessible name must match the string.

These tests aren't really tests yet as we haven't evaluated anything in the components. This is 
where jest-dom matchers come in.

### jest-dom Matchers

jest-dom provides matchers specifically designed for testing DOM elements. Here is an example of using the jest-dom matcher `toBeInTheDocument`:

```typescript
/** HelloWorld.test.tsx */
import {render, screen} from '@testing-library/react'

const HelloWorld = () => (<div>
  <h1>Hello World!</h1>
  <button>Click!</button>
</div>)

describe("HelloWorld", () => {
  it("renders", () => {
    render(<HelloWorld />)

    const message = screen.getByRole("heading")
    const button = screen.getByRole("button", { name: /Click/i })

    expect(message).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })
})
```

Here we put the query results in an `expect` function, and chain the `toBeInTheDocument` matcher. If
the results are in the document, the test passes. If not the test fails.

There are many other, very useful matchers other than `toBeInTheDocument` You can see all of the jest-dom matchers [here](https://github.com/testing-library/jest-dom#usage).

| Matcher | Description |
|---------|-------------|
| toBeVisible | Checks if an element is currently visible to the user.|
| toHaveAttribute | Checks if an element has an attribute. `expect(element).toHaveAttribute("href", "https://example.com");`|
| toHaveFocus | Checks if an element has focus or not |
| toHaveValue | Checks whether an `input`, `textarea` of `select` has a specified value | 
| toHaveTextContent | Checks if a node has certain text content or not. Can be a regular expression |

## user-event

When testing frontend code, we really are testing for user interactions. This is where `user-event` 
library comes in. It's a part of the `@testing-library` family, but it is installed as a separate
package and imported explicitly.

```typescript
/** HelloWorld.test.tsx */
import { useState } from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


const HelloWorld = () => {
  const [clicked, setClicked] = useState(false);

  return (
    <div>
      <h1>Hello World!</h1>
      <button onClick={() => setClicked(true)}>Click!</button>
      {clicked && <p>Button clicked!</p>}
    </div>
  );
};

describe("HelloWorld", () => {
  it("shows a message when the button is clicked",async () => {
    const user = userEvent.setup();
    render(<HelloWorld />);

    const button = screen.getByRole("button", { name: /Click/i });

    await user.click(button)

    expect(screen.getByText(/button clicked/i)).toBeInTheDocument();
  })
})
```

`user-event` interactions are asynchronous, so the test callback needs to be
`async` and interactions such as `click()` need to be awaited. Before using `user-event`, it must be set up. After it is set up, we can do a number of user interactions. In
this case, a button click. And we test the behavior caused by the interaction.

## A Useful Helper

When testing React, you will be constantly rendering components. Much of the setup can be repeated across tests inside a `describe` block. To make things simpler and easier to read, include a `renderComponent` function.

```typescript
/** HelloWorld.test.tsx */
import { useState } from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


const HelloWorld = () => {
  const [clicked, setClicked] = useState(false);

  return (
    <div>
      <h1>Hello World!</h1>
      <button onClick={() => setClicked(true)}>Click!</button>
      {clicked && <p>Button clicked!</p>}
    </div>
  );
};

describe("HelloWorld", () => {
  const renderComponent = () => {
  const user = userEvent.setup();
  render(<HelloWorld />);

  return {
    user,
    button: screen.getByRole("button", { name: /click/i }),
  };
};

  it("renders", () => {
    const { button } = renderComponent();

    const message = screen.getByRole("heading");

    expect(message).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  })

  it("shows a message when the button is clicked",async () => {
    const { user, button }= renderComponent();

    await user.click(button)

    expect(screen.getByText(/button clicked/i)).toBeInTheDocument();
  })
})
```

At minimum, the helper should render the component and set up `user-event`. Call `renderComponent()`
in each test that needs the component. In the example above, I also included the `button` query because both tests need it. If you need `user` or `button` in a test, destructure them from the returned object.

## Navbar: A Case Study

Now I will show you a case in an actual project. The `Navbar` component is a component used for 
navigation that is composed of other components. It utilizes the Chakra UI library and so the mocks
in `setup.ts` are needed.

```typescript
// Navbar/index.tsx
import { Flex, Text } from "@chakra-ui/react";
import { ColorModeButton } from "@components/ui/color-mode";

import type { NavItemType } from "@/types";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";


const navItems: NavItemType[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];


const Navbar = () => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      bg="teal.400"
      h={16}
      px={4}
    >
      <Text fontWeight="bold" fontSize="2xl">
        Hello DRFX
      </Text>
      <Flex align="center" gap={2}>
        <DesktopMenu navItems={navItems}/>
        <MobileMenu navItems={navItems} />
        <ColorModeButton bg="transparent" />
      </Flex>
    </Flex>
  );
};

export default Navbar;
```

```typescript
// DesktopMenu.tsx
import { Link } from "react-router";
import { Stack } from "@chakra-ui/react";

import type { DesktopMenuProps } from "@/types";
import UserMenu from "./UserMenu";

const DesktopMenu = ({navItems}: DesktopMenuProps) => (
  <Stack direction="row" gap={6} align="center" display={{ base: "none", md: "flex" }}>
    <UserMenu />
    {navItems.map((navItem) => (
      <Link to={navItem.href} key={`${navItem.href}-desktop`}>
        {navItem.label}
      </Link>
    ))}
  </Stack>
);

export default DesktopMenu;
```

```typescript
// MobileMenu.tsx
import { useState } from "react";
import { Drawer, IconButton } from "@chakra-ui/react";
import { FiMenu, FiX } from "react-icons/fi";

import MobileNav from "./MobileNav";
import type { NavItemType } from "@/types";

type MobileMenuProps = {
  navItems: NavItemType[];
};

const MobileMenu = ({ navItems }: MobileMenuProps) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      data-testid="mobile-menu"
    >
      <Drawer.Trigger asChild>
        <IconButton
          aria-label="Open navigation menu"
          variant="ghost"
          display={{ base: "flex", md: "none" }}
        >
          <FiMenu />
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Navigation</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <MobileNav onNavigate={() => setOpen(false)} navItems={navItems} />
          </Drawer.Body>
          <Drawer.CloseTrigger asChild>
            <IconButton
              aria-label="Close navigation menu"
              variant="ghost"
              size="md"
              position="absolute"
              top="3"
              right="3"
            >
              <FiX />
            </IconButton>
          </Drawer.CloseTrigger>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};

export default MobileMenu;

```

```typescript
// MobileNav.tsx
import { Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";

import UserMenu from "./UserMenu";
import type { MobileNavProps } from "@/types";

const MobileNav = ({ onNavigate, navItems }: MobileNavProps) => (
  <Stack gap={3}>
    <UserMenu mobile />
    {navItems.map((navItem) => (
      <Text key={navItem.href} asChild fontSize="xl" p={3} borderRadius="md" _hover={{ bg: "bg.muted" }}>
        <RouterLink to={navItem.href} onClick={onNavigate}>
          {navItem.label}
        </RouterLink>
      </Text>
    ))}
  </Stack>
);

export default MobileNav;
```

```typescript
// UserMenu.tsx
import { useAuth } from "@/contexts/AuthContext";
import type { UserMenuProps } from "@/types";
import { Button, Menu, Text } from "@chakra-ui/react";
import { Link } from "react-router";

const UserMenu = ({ mobile = false }: UserMenuProps) => {
  const { user, logout } = useAuth();

  if (!user) {
    if (mobile) {
      return (
        <Text
          asChild
          fontSize="xl"
          p={3}
          borderRadius="md"
          _hover={{ bg: "bg.muted" }}
        >
          <Link to="/login">Login</Link>
        </Text>
      );
    }
    return <Link to="/login">Login</Link>;
  }

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="ghost">
          <Text>{user.email}</Text>
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="password">Change Password</Menu.Item>
          <Menu.Separator />
          <Menu.Item value="logout" onClick={() => logout()}>
            Logout
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};

export default UserMenu;
```

## The Unauthenticated Tests

First, we are going to run tests for an anonymous user. If you understant the concepts presented so far,
most of this will be easy to understand, but there are things here that will need explanation.

```typescript
// Navbar.test.tsx
import { type ReactNode } from "react";
import { screen, render } from "@testing-library/react";
import user from "@testing-library/user-event";
import { TestingProviders } from "tests/providers";
import Navbar from ".";

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,

  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoadingUser: false,
    isLoggingIn: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("Navbar", () => {
  const renderComponent = () => {
    return {
      ...render(
        <TestingProviders>
          <Navbar />
        </TestingProviders>,
      ),
      brand: screen.getByText(/hello drfx/i),
      user: user.setup(),
      button: screen.getByRole("button", { name: /Open navigation menu/ }),
    };
  };

  it("renders", () => {
    const { brand } = renderComponent();
    expect(brand).toBeInTheDocument();
  });

  it("displays the mobile button", () => {
    renderComponent();
    const button = screen.getByRole("button", { name: /Open navigation menu/ });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("button displays mobile menu", async () => {
    const { user, button } = renderComponent();

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the mobile menu after navigation", async () => {
    const { user, button } = renderComponent();

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("link", { name: /home/i }));

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test.each([/login/i, /home/i, /about/i])(
    "displays %s in navbar",
    async (link) => {
      const { user, button } = renderComponent();

      await user.click(button);

      expect(screen.getByRole("link", { name: link })).toBeInTheDocument();
    },
  );
});

```

For our tests to work, the `useAuth` hook needs to be mocked. For our navbar, we will not need to
use the real hook. But we will need consistent values for the tests.

Notice `test.each` tests. Those are parameterized tests. You can have several different cases
run the same test. In this case, we are testing for `/home/i`, `/about/i`, `/login/i` links. The 
actual string will be displayed in the testing console.

For many tests, components that need providers will need testing providers. Components that use
`react-router`, `TanStack Query`, and the custom `AuthProvider` will need providers to make our
tests work. For `react-router` use the `MemoryRouter` with `initialEntries=['/']` for testing. And  And in our tests, the `AuthProvider` will be mocked in each test file. The testing version of `QueryClient` disables retries. This keeps a failing query from silently running multiple times and
makes tests faster and failures easier to diagnose.

A word about the `AuthProvider.` Although `TestingProviders` includes `AuthProvider`, the test's module mock replaces it with a component that simply renders its children. This lets us keep one
shared provider wrapper while preventing the real authentication logic from running.

```typescript
// tests/providers.tsx
import type { ReactNode } from "react";
import { Provider } from "@/components/ui/provider";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";

type TestingProvidersProps = {
  children: ReactNode;
};

export const TestingProviders = ({ children }: TestingProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return (
    <Provider>
      <MemoryRouter initialEntries={["/"]}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    </Provider>
  );
};

```


### The Authenticated Tests

Now we are going to test for when the user is authenticated.

```typescript
// Navbar/Navbar.authenticated.test.tsx
import { type ReactNode } from "react";
import { screen, render } from "@testing-library/react";
import user from "@testing-library/user-event";
import { TestingProviders } from "tests/providers";
import Navbar from ".";

const { mockLogout } = vi.hoisted(() => ({
  mockLogout: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,

  useAuth: () => ({
    user: {
      email: "testuser@example.com",
      pk: 1,
    },
    isAuthenticated: true,
    isLoadingUser: false,
    isLoggingIn: false,
    login: vi.fn(),
    logout: mockLogout,
  }),
}));

describe("Navbar (authenticated)", () => {
  const renderComponent = () => {
    return {
      ...render(
        <TestingProviders>
          <Navbar />
        </TestingProviders>,
      ),
      brand: screen.getByText(/hello drfx/i),
      user: user.setup(),
      button: screen.getByRole("button", { name: /Open navigation menu/ }),
    };
  };

  it("renders", () => {
    const { brand } = renderComponent();
    expect(brand).toBeInTheDocument();
    expect(screen.getByText("testuser@example.com")).toBeInTheDocument();
  });

  it("displays menu button", async () => {
    const { user, button } = renderComponent();

    await user.click(button);

    const userMenuButton = screen.getByRole("button", {
      name: "testuser@example.com",
    });

    expect(userMenuButton).toBeInTheDocument();
  });

  it("displays popover menu", async () => {
    const { user, button } = renderComponent();

    await user.click(button);

    const userMenuButton = screen.getByRole("button", {
      name: "testuser@example.com",
    });

    await user.click(userMenuButton);

    expect(screen.getByText(/logout/i)).toBeVisible();
    expect(screen.getByText(/change password/i)).toBeVisible();
  });

  it("logs out the user", async () => {
    const { user, button } = renderComponent();

    await user.click(button);

    const userMenuButton = screen.getByRole("button", {
      name: "testuser@example.com",
    });

    await user.click(userMenuButton);

    const logoutButton = screen.getByRole("menuitem", {
      name: /logout/i,
    });

    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("does not display login in navbar", async () => {
    const { user, button } = renderComponent();

    await user.click(button);

    expect(
      screen.queryByRole("link", { name: /login/i }),
    ).not.toBeInTheDocument();
  });

  test.each([/home/i, /about/i])("displays %s in navbar", async (link) => {
    const { user, button } = renderComponent();

    await user.click(button);

    expect(screen.getByRole("link", { name: link })).toBeInTheDocument();
  });
});

```

Nothing here is much too different from the unauthenticated cases. The mock is different because this 
time we need to provide an authenticated user and a mock `logout` function. Vitest hoists `vi.mock()` calls to the top of the test file. If the mock factory needs a variable from the test file, that variable may not have been initialized yet. `vi.hoisted()` gives you a place to create values that must exist before the mock is evaluated. Notice in our mock `useAuth` hook the logout function is a variable.

# Conclusion

When testing React code, we render the component we want to test, find what the user can interact with, perform an interaction, and assert the resulting behavior. The tools we learned about support this workflow: Vitest, React Testing Library, jest-dom, and user-event.

Using a `Navbar` component from a real-world project, we also covered parameterized tests, mocks, providers, and `vi.hoisted()`. Now you have the knowledge to start testing the components in your own projects.
