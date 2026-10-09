# Buzztill Ecommerce — architecture

React Native 0.87 · TypeScript (strict) · Redux Toolkit + RTK Query · React Navigation 7

## Folder layout

```
src/
  app/                 App.tsx — providers only
  config/              build-time config (API base url, mock switch)
  theme/               design tokens: colors, spacing, radii, typography, shadows
  components/
    ui/                generic primitives (Text, Button, Card, Chip, Icon, …)
    layout/            Screen, HorizontalList, PlaceholderScreen
  navigation/          navigators + the single source of route/param types
  services/
    api/               RTK Query root slice and the swappable transport
    mock/              fixtures shaped exactly like the future API
  store/               store setup, persistence, typed hooks
  types/               shared domain model
  features/
    <feature>/
      api/             endpoints injected into the root api slice
      components/      components only this feature uses
      screens/         the feature's screens
      <feature>Slice.ts  client state owned by this feature
  utils/               pure helpers (money and time formatting)
```

**The rule that keeps this clean:** a feature may import from `components`,
`theme`, `services`, `store`, `types` and `utils`, but never from another
feature's internals. When two features need the same component, it moves up
into `src/components/ui`.

## Where state lives

| Kind of state | Home | Why |
| --- | --- | --- |
| Server data (feeds, merchants, orders) | RTK Query cache | Caching, de-duplication, loading/error flags and refetching come for free |
| Client state (basket, filters, session) | Redux slices | It is ours to own; nothing on the server can supply it |
| One screen's UI state | `useState` | Never put in Redux — it only adds indirection |

Only `basket` is persisted to disk (`redux-persist`). Server data is
deliberately not persisted so it can never be shown stale after a relaunch.

## Swapping mocks for the real API

`src/config/env.ts` has one flag:

```ts
useMocks: true
```

With it on, `services/api/baseQuery.ts` resolves every request from
`services/mock/handlers.ts` after a short delay, so each screen exercises its
real loading and error states. Turning it off sends the identical requests to
`apiBaseUrl`. No component, hook or endpoint changes.

Adding an endpoint:

```ts
// features/orders/api/ordersApi.ts
export const ordersApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getOrders: builder.query<Order[], void>({
      query: () => ({ url: 'orders' }),
      providesTags: ['Order'],
    }),
  }),
});
export const { useGetOrdersQuery } = ordersApi;
```

Then add a matching `'orders'` entry to the mock handlers. Nothing in
`apiSlice.ts` needs editing.

## Styling

No inline colours, font sizes or spacing values anywhere. Screens compose
tokens from `src/theme` and variants from the primitives:

```tsx
<AppText variant="h2">Popular restaurants</AppText>
<Button label="Add to basket" variant="primary" />
```

Re-skinning the app is then a `theme/colors.ts` change, not a search and
replace across screens.

## Performance choices

- **Home feed is one virtualized list.** Each section is a row of a single
  `FlatList`, so off-screen sections never mount. A `ScrollView` would build
  the whole feed up front.
- **Cards are memoised with explicit comparators**, so a re-render in one row
  does not cascade through the others.
- **`getItemLayout` on every carousel** with a fixed card width, which skips
  on-the-fly measurement while scrolling.
- **Money is stored in minor units (cents) as integers** — no floating-point
  drift in basket totals.
- **Selectors are memoised** (`selectBasketSummary`), so the floating basket
  bar re-renders only when its numbers change.
- **Remote images go through FastImage**, which caches to disk and decodes off
  the JS thread.
- **Icons are inline SVG**, not an icon font — no native linking and only the
  glyphs we ship.
- **64-bit ABIs only** (`android/gradle.properties`), which roughly halves both
  APK size and build time.

## Type safety

- Ids are branded (`MerchantId`, `ProductId`), so one can never be passed where
  another belongs.
- Every route and its params live in `navigation/types.ts` and are registered
  globally, so `navigation.navigate` is checked at compile time.
- `npx tsc --noEmit` must pass before any commit.

## Building for iOS

Native modules are code-generated into `ios/build/generated`, which is
gitignored. Xcode lists those files as build inputs but does **not** create
them, so a fresh clone — or anyone who clears `ios/build` — gets:

```
Build input file cannot be found:
  .../ios/build/generated/ios/ReactCodegen/AsyncStorageSpec/AsyncStorageSpec-generated.mm
```

That is a missing-artifact error, not a broken project. Regenerate and
reinstall pods:

```sh
npm run pods          # regenerates codegen, then pod install
npm run codegen:ios   # codegen only, when pods are already current
```

Two things in `ios/` exist to keep current Xcode happy, and should not be
reverted:

- **Podfile `post_install`** raises `IPHONEOS_DEPLOYMENT_TARGET` on every pod
  target. A few pods still declare targets below what Xcode will build, and
  React Native's own post-install misses the resource-bundle targets.
- **`AppDependencyProvider` in `AppDelegate.swift`** drops React Native's own
  `SampleTurboModule` from the main-queue setup list. No app links it, so
  start-up otherwise logs an error and shows a red screen in development.

## Next screens

Routes for the full design are already declared in `navigation/types.ts` and
wired to `PlaceholderScreen` stubs. Building one means replacing its stub —
the navigation and params are already correct.
