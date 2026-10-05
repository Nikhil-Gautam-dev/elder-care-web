# @eldercare/rides-api

Independent rides service (port **3005**, own MongoDB database `eldercare_rides`). It knows nothing about ElderCare users or families. Callers identify riders with a name and phone, and may attach an opaque `externalRef`.

```bash
cp .env.example .env              # fill MONGODB_URI, RIDES_JWT_SECRET, RIDES_API_KEY, RIDES_SEED_PASSWORD
pnpm --filter @eldercare/rides-api seed   # 5 sample drivers + the dispatcher login
pnpm --filter @eldercare/rides-api dev
```

## Auth

| Caller                          | How                                                   | Used for                                                   |
| ------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| Partner system (ElderCare MCP)  | `X-API-Key: $RIDES_API_KEY`                           | create / read / cancel rides, fare estimate, list drivers  |
| Dispatcher / driver (rides-web) | `Authorization: Bearer <jwt>` from `POST /auth/login` | everything, including status updates and driver management |

Responses: `{ "success": true, "data": … }` or `{ "success": false, "error": "message" }` (plus extra fields for some errors). 401 = missing/invalid credentials.

## Status flow

```
requested → accepted → arriving → in_progress → completed
requested → rejected
requested | accepted | arriving → cancelled        (not once in_progress)
```

An invalid jump returns **409** `A ride that is <from> cannot become <to>` (cancel: `A ride that is <from> can no longer be cancelled`). Updates are optimistic: if two people act at once the second gets 409 "changed by someone else".

## Endpoints

| Method & path               | Auth             | Notes                                                                                                                     |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `GET /health`               | –                |                                                                                                                           |
| `POST /auth/login`          | –                | `{username,password}` → `{token, staff:{username,name}}`                                                                  |
| `GET /auth/me`              | staff            |                                                                                                                           |
| `POST /rides/fare-estimate` | partner or staff | `{pickup,drop}` → `{fareEstimate, currency:"INR", distanceKm?, basis:"distance"\|"flat"}`                                 |
| `POST /rides`               | partner          | create ride, **idempotent on `requestId`**                                                                                |
| `GET /rides`                | partner or staff | `status` (comma list), `riderPhone`, `ref.<key>=value`, `limit` (≤100), `page` → `{items,total,page,limit}`, newest first |
| `GET /rides/:id`            | partner or staff | `:id` is the Mongo id or the ride number (`RD-000001`)                                                                    |
| `PATCH /rides/:id/status`   | staff            | `{status, driverId?, reason?, note?}`                                                                                     |
| `POST /rides/:id/cancel`    | partner or staff | optional `{note}`; only before `in_progress`                                                                              |
| `GET /drivers`              | partner or staff | active drivers; staff may add `?includeInactive=true`                                                                     |
| `GET /drivers/:id`          | partner or staff |                                                                                                                           |
| `POST /drivers`             | staff            | `{name, vehicle, plate, phone?, active?}`; 409 on duplicate plate                                                         |
| `PATCH /drivers/:id`        | staff            | any of `name, vehicle, plate, phone, active`                                                                              |

### Create ride — `POST /rides`

```json
{
  "pickup": { "address": "14 Green Valley Road, Delhi", "lat": 28.6139, "lng": 77.209 },
  "drop": { "address": "Apollo Hospital, Sarita Vihar" },
  "rider": { "name": "Sunita Sharma", "phone": "9876543210" },
  "scheduledAt": null,
  "notes": "Wheelchair, needs help getting in",
  "requestId": "any-unique-string",
  "externalRef": { "elderId": "abc" }
}
```

- `pickup.address`, `drop.address`, `rider.name`, `rider.phone` are required. `lat`/`lng` are optional but must come together.
- `rider.phone`: Indian mobile, 10 digits; stored as `+91XXXXXXXXXX`.
- `scheduledAt`: ISO date-time for a later ride; omit, `null` or `"now"` means as soon as possible. Past times are rejected.
- Returns **201** with the ride. Sending the same `requestId` again returns **200** with `"idempotent": true` and the original ride (no duplicate).

### Ride object

```json
{
  "id": "…",
  "rideNumber": "RD-000001",
  "status": "requested",
  "pickup": { "address": "…", "lat": 28.6, "lng": 77.2 },
  "drop": { "address": "…" },
  "rider": { "name": "Sunita Sharma", "phone": "+919876543210" },
  "scheduledAt": null,
  "notes": "…",
  "fareEstimate": 317,
  "statusHistory": [{ "status": "requested", "at": "ISO", "note": "…" }],
  "driver": { "id": "…", "name": "…", "vehicle": "…", "plate": "…" },
  "rejectionReason": "…",
  "externalRef": { "elderId": "abc" },
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

`driver` is set when the ride is accepted. `PATCH …/status` with `accepted` **requires** `driverId` of an active driver; `rejected` **requires** `reason`.

### Fare

Distance-based (`RIDES_FARE_BASE + RIDES_FARE_PER_KM × straight-line km`) when pickup and drop both have `lat`/`lng`, otherwise the flat `RIDES_FARE_FLAT`. All INR, whole rupees.
