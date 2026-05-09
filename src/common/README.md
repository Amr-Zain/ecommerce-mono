# Common Module

Generic, framework-level utilities and shared logic that can be used across all feature modules.

## Structure

```
common/
├── decorators/          ← Custom decorators
│   └── parsed-query.decorator.ts
│
├── dto/                 ← Shared DTOs
│   ├── pagination.dto.ts
│   └── advanced-query.dto.ts
│
├── filters/             ← Exception filters
│   └── http-exception.filter.ts
│
├── guards/              ← Shared guards
│   └── throttle.guard.ts
│
├── interceptors/        ← Request/response interceptors
│   ├── logging.interceptor.ts
│   └── transform.interceptor.ts
│
├── pipes/               ← Custom pipes
│   └── parse-bigint.pipe.ts
│
├── repositories/        ← Base repository pattern
│   └── base.repository.ts
│
├── services/            ← Shared services
│   └── query-builder.service.ts
│
└── utils/               ← Pure utility functions
    ├── date.util.ts
    ├── pagination.util.ts
    └── string.util.ts
```

## Guidelines

### Utils (Pure Functions)

- No dependencies
- No `@Injectable()` decorator
- Stateless
- Can be tested in isolation
- Examples: date formatting, string manipulation

### Services

- Injectable with `@Injectable()`
- Can have dependencies
- Reusable business logic
- Examples: query building, data transformation

### Decorators

- Custom parameter/method/class decorators
- Examples: `@ParsedQuery()`, `@CurrentUser()`

### Guards

- Authorization/authentication logic
- Examples: rate limiting, API key validation

### Interceptors

- Request/response transformation
- Logging
- Examples: logging, response wrapping

### Filters

- Exception handling
- Error formatting
- Examples: HTTP exception filter

### Pipes

- Data transformation
- Validation
- Examples: BigInt parsing, custom validation
