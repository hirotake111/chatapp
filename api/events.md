# List of events been used in this project

```typescript
// Registered event
type REGISTERED = "Registered";
export interface RegisteredEvent {
  id: string;
  type: REGISTERED;
  metadata: {
    traceId: string;
    username: string;
    displayName: string;
    firstName: string;
    lastName: string;
  };
  data: {
    username: string;
    displayName: string;
    firstName: string;
    lastName: string;
  };
}
```
