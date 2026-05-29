Welcome to your new TanStack app! 

# Getting Started

To run this application:

```bash
pnpm install
pnpm start
```
# tasks 
 1- reusable form (done still some fix to the types)
 2- hooks and axios (done)
 4- toaster, layout fixs (done)
 3-helper options for tanstack querys (in progress)
 5- login (zustand) (done)
 6- reusable table ( filters,resize )(in progress) still need to fix the filter as list not input add them to the url and fix teh sort to be assiated with the field and the export
 7- preview fullback images and reuable components

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.


## Linting & Formatting


This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```



## Routing
This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).


## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
pnpm add @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
'use client'

import React from 'react'
import { FieldPath, FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@ecommerce/ui/components/form'
import { Input } from '@ecommerce/ui/components/input'
import { Checkbox } from '@ecommerce/ui/components/checkbox'
import { Textarea } from '@ecommerce/ui/components/textarea'
import { RadioGroup, RadioGroupItem } from '@ecommerce/ui/components/radio-group'
import { FieldProp } from '@/types/components/form'
import OTPField from './OTPField'
import PhoneField from './PhoneField'
import PasswordField from './PasswordField'
import DateFields from './DatePicker'
import MapField from './MapField'
import MultiLangField from './MultiLangField'
import EditorField from './Editor/EditorField'
import FileUploadField from './Uploader/FileUploadField'
import AppSelect from './Select'

function Field<T extends FieldValues>(props: FieldProp<T>) {
  if (props.type === 'custom') {
    return props.customItem as React.ReactElement
  }

  return (
    <FormField
      control={props.control}
      name={props.name as FieldPath<T>}
      render={({ field }) => {
        const renderField = () => {
          switch (props.type) {
            case 'text':
            case 'number':
            case 'email':
            case 'url': {
              const { placeholder } = props
              const inputProps = props.inputProps ?? {}
              return (
                <Input
                  type={props.type}
                  placeholder={placeholder}
                  {...field}
                  {...inputProps}
                />
              )
            }

            case 'password': {
              const { placeholder } = props
              const inputProps = props.inputProps ?? {}
              return (
                <PasswordField
                  placeholder={placeholder || ''}
                  {...field}
                  {...inputProps}
                />
              )
            }

            case 'textarea': {
              const { placeholder } = props
              const inputProps = props.inputProps ?? {}
              return (
                <Textarea
                  placeholder={placeholder}
                  rows={inputProps.rows ?? 4}
                  {...field}
                  {...inputProps}
                />
              )
            }

            case 'checkbox': {
              const inputProps = props.inputProps ?? {}
              return (
                <div className="flex flex-row items-center space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={inputProps.disabled}
                      {...inputProps}
                    />
                  </FormControl>
                  {props.label && (
                    <FormLabel
                      className="font-normal cursor-pointer"
                      onClick={() => field.onChange(!field.value)}
                    >
                      {props.label}
                    </FormLabel>
                  )}
                </div>
              )
            }

            case 'select': {
              // inputProps is Omit<SelectInputProps<T, any>, 'field'>
              const inputProps = props!.inputProps! 
              return (
                <AppSelect
                  field={field}
                  {...inputProps}
                />
              )
            }

            case 'radio': {
              const inputProps = props.inputProps ?? {}
              const radioOptions = props.options ?? []
              return (
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                  disabled={inputProps.disabled}
                  {...inputProps}
                >
                  {radioOptions.map((option) => (
                    <div
                      key={String(option.value)}
                      className="flex items-center space-x-3"
                    >
                      <FormControl>
                        <RadioGroupItem value={String(option.value)} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {option.label}
                      </FormLabel>
                    </div>
                  ))}
                </RadioGroup>
              )
            }

            case 'otp': {
              const inputProps = props.inputProps ?? {}
              return (
                <OTPField
                  value={field.value || ''}
                  onChange={(value) => {
                    inputProps.handleOTPChange?.(value)
                    field.onChange(value)
                  }}
                  length={inputProps.length ?? 6}
                  disabled={inputProps.disabled}
                  type={inputProps.type}
                  {...inputProps}
                />
              )
            }

            case 'phone': {
              const inputProps = props.inputProps ?? {}
              return (
                <PhoneField
                  control={props.control}
                  phoneCodeName={
                    (inputProps.phoneCodeName ??
                      `${String(props.name)}_code`) as Path<T>
                  }
                  phoneNumberName={
                    (inputProps.phoneNumberName ??
                      `${String(props.name)}_number`) as Path<T>
                  }
                  countries={inputProps.countries ?? []}
                  currentPhoneLimit={inputProps.currentPhoneLimit}
                  isLoading={inputProps.disabled}
                  disabled={inputProps.disabled}
                  codeClass={inputProps.codeClass}
                  phoneClass={inputProps.phoneClass}
                />
              )
            }

            case 'date': {
              const inputProps = (props.inputProps ?? {})
              return (
                <DateFields
                  control={props.control}
                  name={props.name}
                  label={props.label as string}
                  placeholder={props.placeholder}
                  mode={inputProps.mode}
                  disabledDates={inputProps.disabledDates}
                  className={inputProps.className}
                />
              )
            }

            case 'map': {
              const inputProps = (props.inputProps ?? {}) 
              return (
                <MapField
                  field={field}
                  onMarkerPositionChange={inputProps.onMarkerPositionChange}
                  defaultMarkerPosition={inputProps.defaultMarkerPosition}
                  locations={inputProps.locations}
                  zoom={inputProps.zoom}
                  height={inputProps.height}
                  mapContainerStyle={inputProps.mapContainerStyle}
                  disabled={inputProps.disabled}
                  className={inputProps.className}
                />
              )
            }

            case 'editor': {
              const inputProps = (props.inputProps ?? {})
              return (
                <EditorField
                  field={field}
                  placeholder={props.placeholder}
                  height={inputProps.height}
                  toolbar={inputProps.toolbar}
                  disabled={inputProps.disabled}
                  className={inputProps.className}
                />
              )
            }

            case 'multiLangField': {
              const inputProps = (props.inputProps ??
                {})
              return (
                <MultiLangField
                  control={props.control}
                  name={String(props.name)}
                  type={inputProps.type ?? 'input'}
                  label={props.label as string}
                  placeholder={props.placeholder}
                  languages={inputProps.languages}
                  defaultLanguage={inputProps.defaultLanguage}
                  disabled={inputProps.disabled}
                  className={inputProps.className}
                />
              )
            }

            case 'fileUpload':
            case 'mediaUploader':
            case 'imgUploader': {
              const inputProps = (props.inputProps ??{}) 
              const accept =
                props.type === 'imgUploader'
                  ? ['image/*']
                  : inputProps.acceptedFileTypes

              const type_file =
                props.type === 'imgUploader' ? 'image' : inputProps.type_file

              return (
                <FileUploadField
                  field={field}
                  maxFiles={inputProps.maxFiles}
                  maxSize={inputProps.maxSize}
                  acceptedFileTypes={accept}
                  multiple={inputProps.multiple}
                  disabled={inputProps.disabled}
                  className={inputProps.className}
                  showPreview={inputProps.showPreview ?? true}
                  shapeType={inputProps.shapeType ?? 'picture-card'}
                  draggable={inputProps.draggable ?? true}
                  type_file={type_file}
                  model={inputProps.model}
                  apiEndpoint={inputProps.apiEndpoint}
                  baseUrl={inputProps.baseUrl}
                />
              )
            }
          }
        }

        const spanClass = props.span ? `col-span-${props.span}` : ''

        return (
          <FormItem
            className={`${props.type === 'checkbox' ? '' : 'space-y-2'} ${spanClass}`}
          >
            {props.type !== 'checkbox' && props.label && (
              <FormLabel>{props.label}</FormLabel>
            )}
            <FormControl>{renderField()}</FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export default Field

conver this switch to object mapped by type

#   e c o m m e r c e - d a s h b o a r d  
 