# events

Authorization: HTTP Authorization header `Bearer [access token]`

SQL queries are implemented in `server/lib/api.js`

The routes handling the requests are defined in `server/routes/`

The data definition for the database is in `ddl.sql`

## `users`

`POST /users`
  - create user if does not exist
    ```
    { username, password }
    ```

`GET /users/:username`
  - get public user information

`PATCH /users/:username` (Authorization)
  - update fields (password) if user exists
    ```
    { newPassword, oldPassword }
    ```

`PATCH /users/:username/login`
  - log in to existing user account, returns user and token
    ```
    { password }
    ```

`PATCH /users/:username/logout` (Authorization)
  - log out of existing user account, returns user and nullified token

`GET /users/:username/events`
  - get user's event attendances

`GET /users/:username/organizes`
  - get event the user organizes

`PUT /users/:username/events/:event` (Authorization)
  - set user's attendance ('going', 'interested', 'not going', `null`) for event
    ```
    { status }
    ```

## `events`

`GET /events`
  - get events

`POST /events` (Authorization)
  - create event. default organizer is own user
    ```
    { title, description, start_date, end_date, all_day, venue, organizer }
    ```

`GET /events/:event`
  - get event information

`DELETE /events/:event` (Authorization)
  - delete event (if own event or no organizer)

`PATCH /events/:event` (Authorization)
  - change event's fields (if own event or no organizer)
    ```
    { title, description, start_date, end_date, all_day, venue, organizer }
    ```

`GET /events/:event/users`
  - get users' attendances for the event

## `venues`

`POST /venues` (Authorization)
  - create venue
  ```
  { name, address }
  ```

`GET /venues`
  - get venues

`GET /venues/:venue`
  - get venue information

`GET /venues/:venue/events`
  - get events at the venue
