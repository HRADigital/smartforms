# @hradigital/smartforms

[![Latest Stable Version](https://img.shields.io/npm/v/@hradigital/smartforms?logo=npm&logoColor=white)](https://www.npmjs.com/package/@hradigital/smartforms)
[![Total Downloads](https://img.shields.io/npm/dm/@hradigital/smartforms)](https://www.npmjs.com/package/@hradigital/smartforms)
[![Node Version Require](https://img.shields.io/node/v/@hradigital/smartforms?logo=nodedotjs&logoColor=white)](https://www.npmjs.com/package/@hradigital/smartforms)
[![License](https://img.shields.io/github/license/HRADigital/smartforms)](https://github.com/HRADigital/smartforms/blob/master/LICENSE)
[![Release](https://img.shields.io/github/v/release/HRADigital/smartforms)](https://github.com/HRADigital/smartforms/releases)
[![CI](https://github.com/HRADigital/smartforms/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/HRADigital/smartforms/actions/workflows/ci.yml)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@hradigital/smartforms?label=minzipped)](https://bundlephobia.com/package/@hradigital/smartforms)
[![Types](https://img.shields.io/badge/Types-TypeScript-3178C6?logo=typescript&logoColor=white)](types/index.d.ts)
[![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)](vitest.config.js)
[![Linter](https://img.shields.io/badge/Linter-ESLint-4B32C3?logo=eslint&logoColor=white)](eslint.config.js)
[![Code Style](https://img.shields.io/badge/code%20style-Prettier-F7B93E?logo=prettier&logoColor=white)](.prettierrc.json)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

State-aware client-side form manager for static HTML forms.

Server-rendered apps ship plain HTML forms, but users expect fields that react as they
change, Save and Delete buttons that enable only when there is something to save or delete,
and toolbar actions wired to the right HTTP verb. Reaching for React or Vue to get that costs
a build step and a rewrite of markup the server already produces.

`smartforms` layers that behaviour onto the HTML you already render, driven entirely by
attributes. Mark a `<form>` with the `smartform` class and it takes over.

- **Per-field state** - tracks `new`, `unchanged`, `changed`, `invalid` and `empty`, applying a
  matching CSS class for styling.
- **Two layouts** - a list of records (`smartformlist`) or a single record (`smartformrecord`).
- **Toolbar wiring** - enables and disables create, update, delete and cancel buttons from the
  form's overall state.
- **HTTP Tasks** - binds a toolbar action to a verb and endpoint, declared in markup.
- **`formStateChange` events** - a `CustomEvent` per state transition, for anything the library
  does not cover.
- **No framework, no build step** - ESM, CJS and a UMD build loadable straight from a `<script>`
  tag.

## Installation

```bash
npm install @hradigital/smartforms
# or
yarn add @hradigital/smartforms
# or
pnpm add @hradigital/smartforms
```

Or load the UMD build directly in the browser:

```html
<script src="https://unpkg.com/@hradigital/smartforms/dist/smartforms.umd.js"></script>
<script>
    SmartForms.autoInit();
</script>
```

## Quick start — single record

```html
<form class="smartform" data-resource="users">
    <input type="hidden" name="id" value="7" />
    <div class="smartformrecord">
        <input type="text"  name="name"  value="Ada" />
        <input type="email" name="email" value="ada@example.com" />
    </div>

    <nav class="toolbar">
        <button type="button" data-role="update">Save</button>
        <button type="button" data-role="cancel">Cancel</button>
    </nav>
</form>
```

```js
import { autoInit } from '@hradigital/smartforms';

autoInit(); // scans for forms and toolbars
```

When a user edits a field, `smartforms` flips the field state to `CHANGED`, the form's overall state follows, and the `update` / `cancel` buttons enable themselves automatically. Clicking `update` executes `PUT /users/7` (the default task for the `update` role, with the form's resource and ID auto-inserted). Click `cancel` to reset the form.

## Quick start — list of records

```html
<form class="smartform" data-resource="users">
    <div class="smartformlist">
        <table>
            <thead>
                <tr>
                    <th><input type="checkbox" name="checkall-toggle" /></th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                <tr><td><input type="checkbox" name="cid[]" value="1" /></td><td>Ada</td></tr>
                <tr><td><input type="checkbox" name="cid[]" value="2" /></td><td>Linus</td></tr>
            </tbody>
        </table>
    </div>

    <nav class="toolbar">
        <a href="/users/create" data-role="create">New</a>
        <button type="button" data-role="delete">Delete selected</button>
        <button type="button" data-role="deleteall">Delete all</button>
    </nav>
</form>
```

```js
import { autoInit } from '@hradigital/smartforms';

autoInit(); // scans for forms and toolbars
```

## Auto-init

If you have one form per page and want zero glue code:

```js
import { autoInit } from '@hradigital/smartforms';

autoInit(); // scans for `form.smartform` and `nav.toolbar`
```

## Field states (CSS hooks)

State classes are applied to the `<fieldset>` that wraps the input, **not** to the `<input>` / `<select>` / `<textarea>` itself. Style your fields against the fieldset.

| Class on `<fieldset>` | When it's applied                                                                |
| --------------------- | -------------------------------------------------------------------------------- |
| `changed`             | The user's current value differs from the initial value and validation passes.   |
| `invalid`             | Validation fails (required + empty, or regex/native rule mismatch).              |
| _(no class)_          | Field matches its initial value and is valid — pristine state.                   |

`changed` and `invalid` are mutually exclusive — `setStateChanged` strips `invalid` and vice versa (see `BaseInput.js`).

Suggested SCSS:

```scss
fieldset.changed > input,
fieldset.changed > select,
fieldset.changed > textarea  { border-color: #7ec8ff; background: #fff8d6; }

fieldset.invalid > input,
fieldset.invalid > select,
fieldset.invalid > textarea  { border-color: #f4a3a3; background: #fdecec; }
```

Note: the *form-level* states (`NORMAL`, `CHANGED`, `SELECTED`, `MANY`, `ILLEGAL`, `DEACTIVATED`, `SUBMITTED`) drive toolbar button enable/disable — see "Toolbar action roles" below. They do not produce CSS classes on the form element.

## Configuring an input

All configuration is via plain HTML attributes — there are no JS options for individual fields.

### On the wrapping `<fieldset>` (applies to every input type)

| Attribute      | Effect                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `required`     | Field is required. An empty (whitespace-only) value flips the fieldset to `invalid`.                |
| `recommended`  | Marks the field as recommended. Does **not** affect validation — exposed via `isRecommended()` only, so you can target `<fieldset recommended>` in CSS or add helper text. |

```html
<fieldset required>
    <label for="title">Title</label>
    <input id="title" type="text" name="title" />
</fieldset>
```

### On the `<input>` / `<select>` / `<textarea>`

Per-type attributes the package reads:

| Input type      | Attribute     | Effect                                                                              |
| --------------- | ------------- | ----------------------------------------------------------------------------------- |
| `TextInput`     | `data-rule`   | Regex string. Validation fails (`invalid`) if the value doesn't match.              |
| `TextInput`     | `data-limit`  | Integer hard cap. Blocks `keypress` once `value.length >= limit` (silent).          |
| `TextInput`     | `data-guide`  | Presence flag. Pair with `data-limit` to render a visible counter (see below).      |
| `NumberInput`   | `min`,`max`,`step` | Native HTML constraints, read at construction time.                            |
| `DateTimeInput` | `pattern`     | Native HTML constraint, read at construction time.                                  |
| `TextAreaInput` | _none_        | Reads `name` and value only. Does **not** support `data-rule` / `data-limit` / `data-guide`. |
| All others      | _none_        | Just `name` and `value` (or `value` per option for `Select`/`Radio`/`CheckBox`).    |

```html
<fieldset required>
    <label for="slug">Slug</label>
    <input id="slug" type="text" name="slug"
           data-rule="^[a-z0-9-]+$"
           data-limit="60"
           data-guide />
</fieldset>
```

### Character counter (`data-guide` + `data-limit`)

When both are set on a `TextInput`, the package inserts a counter as a previous sibling of the `<input>` inside the same `<fieldset>`:

```html
<span class="smartguide">
    <span>{currentLength}</span>
    <span>/</span>
    <span>{limit}</span>
</span>
```

Class hooks:

| Class                       | When it's applied                                          |
| --------------------------- | ---------------------------------------------------------- |
| `.smartguide`               | Always (on the wrapper span).                              |
| `.smartguide.warning`       | When `currentLength / limit > 0.9` (counter only).         |

```scss
fieldset > .smartguide          { font-size: 0.8em; color: #666; }
fieldset > .smartguide.warning  { color: #c00; font-weight: 600; }
```

Caveats: counter only updates on `keyup`. Pasting via mouse menu, programmatic value changes, and `form.reset()` don't re-render the counter until the next keystroke.

## Supported inputs

`TextInput`, `EmailInput`, `NumberInput`, `UrlInput`, `ColorInput`, `DateTimeInput`, `FileInput`, `TextAreaInput`, `CheckBoxInput`, `RadioInput`, `SelectInput`, `DynamicTableInput`.

Input handlers are resolved from the element's tag and `type`. The mapping is:

| Element / type                          | Handler             |
| --------------------------------------- | ------------------- |
| `input[type=text]`, `input[type=password]` | `TextInput`     |
| `input[type=email]`                     | `EmailInput`        |
| `input[type=url]`                       | `UrlInput`          |
| `input[type=number]`                    | `NumberInput`       |
| `input[type=color]`                     | `ColorInput`        |
| `input[type=datetime]`, `input.datetimepicker` | `DateTimeInput` |
| `input[type=file]`                      | `FileInput`         |
| `input[type=checkbox]`                  | `CheckBoxInput`     |
| `input[type=radio]`                     | `RadioInput`        |
| `select`                                | `SelectInput`       |
| `textarea`                              | `TextAreaInput`     |
| `table.smartdynamictable`               | `DynamicTableInput` |

`EmailInput` extends `TextInput`, so it accepts the same `data-rule` / `data-limit` / `data-guide` attributes, and additionally flags the fieldset `invalid` when the value is not a valid email address (`^[^\s@]+@[^\s@]+\.[^\s@]+$`). An `<input>` whose `type` has no registered handler is silently skipped.

You can subclass `BaseInput` to add your own.

## Toolbar placement rule

**The `nav.toolbar` must be a descendant of the same `<form>` element it controls.** Placing the toolbar outside the form breaks two things:

- The `cancel` button uses `closest('form')` to call `form.reset()`. If the button is outside the form, `closest` returns `null` and reset is silently skipped.
- Input-type detection in `SmartFormRecord` throws when it encounters an unhandled type, preventing `Toolbar` from initialising at all — buttons stay permanently enabled.

The toolbar may be placed anywhere inside the form: before or after the `smartformrecord` / `smartformlist` div, nested inside any container element. It does not have to be a direct child.

```html
<form class="smartform" id="profile" data-toolbar="t-profile">
    <nav class="toolbar" id="t-profile">
        <button type="button" data-role="update">Save</button>
        <button type="button" data-role="cancel">Cancel</button>
    </nav>

    <div class="smartformrecord">
        <!-- fields -->
    </div>
</form>
```

## Toolbar action roles

Buttons inside `nav.toolbar` are wired by their `data-role`:

`create`, `edit`, `update`, `updateall`, `delete`, `deleteall`, `destroy`, `toggle`, `back`, `cancel`.

Each role resolves to a default HTTP Task descriptor when clicked. The `data-task` attribute on the button can override the default — see [HTTP Tasks](#http-tasks) below.

| Role                                     | Default task                    | Notes                                    |
| ---------------------------------------- | ------------------------------- | ---------------------------------------- |
| `create`                                 | `POST /{resource}`              | New record; often rendered as `<a href>` navigation. |
| `edit`                                   | `GET /{resource}/{id}/edit`     | Navigate to a record's edit screen.      |
| `update`                                 | `PUT /{resource}/{id}`          | Single-record update.                    |
| `updateall`                              | `PUT /{resource}?ids={ids}`     | Bulk update; query-string ID list.       |
| `delete`                                 | `DELETE /{resource}/{id}`       | Single-record delete.                    |
| `deleteall`                              | `DELETE /{resource}?ids={ids}`  | Bulk delete; query-string ID list.       |
| `destroy`                                | `DELETE /{resource}/{id}`       | Delete enabled in `NORMAL` state (e.g. a permanent "delete this record" action). |
| `toggle`                                 | `PATCH /{resource}/{id}`        | Single-record toggle (async). Enabled in `SELECTED` state only. |
| `back`                                   | _(special)_                     | Navigation only; like `create`, follows its `<a href>`. No HTTP task. |
| `cancel`                                 | _(special)_                     | Calls `form.reset()` — no HTTP task.     |

## HTTP Tasks

The `data-task` attribute encodes an HTTP verb and endpoint using a 3-segment format:

```
[mode:][verb:]endpoint
```

- **mode** (optional): `sync` or `async`. If omitted, determined by the verb (GET/POST/PUT/DELETE → sync; PATCH → async).
- **verb** (optional): HTTP verb (`get`, `post`, `put`, `patch`, `delete`, case-insensitive). If omitted, defaults to `GET`.
- **endpoint** (required): Path or URL template (e.g. `/users`, `/users/{id}`, `/api:v2/users/{resource}/{id}`).

Examples:

```html
<!-- sync GET: redirects to /users -->
<button data-role="create" data-task="/users">View all</button>

<!-- sync POST: submits form to /users via POST -->
<button data-role="create" data-task="post:/users">Save</button>

<!-- sync PUT: submits form via POST with _method=PUT -->
<button data-role="update" data-task="put:/users/{id}">Update</button>

<!-- async PATCH: fetch with Content-Type: application/json -->
<button data-role="toggle" data-task="async:patch:/users/{id}/publish">Toggle</button>

<!-- custom endpoint (override default) -->
<button data-role="update" data-task="put:/api/v2/users/{id}">Save (v2)</button>
```

### Endpoint token substitution

Endpoints support three tokens:

| Token | Filled with | Context |
| --- | --- | --- |
| `{resource}` | Form's `data-resource` attribute | Copied from `<form data-resource="…">` |
| `{id}` | Form's `<input name="id">` value (record) or selected row ID (list, `SELECTED` state) | Auto-appended if missing on PUT/PATCH/DELETE |
| `{ids}` | Comma-joined list of checked row IDs | `SmartFormList.selectedIds()` |

Example:

```html
<form class="smartform" data-resource="users">
    <input type="hidden" name="id" value="7" />
    <!-- Resolves to: PUT /users/7 -->
    <button data-role="update" data-task="put:/{resource}/{id}">Save</button>
</form>
```

### ID auto-append

If a PUT/PATCH/DELETE endpoint does not include `{id}` and a form `<input name="id">` exists, the ID is automatically appended:

```html
<button data-role="update" data-task="put:/users">Update</button>
<!-- With <input name="id" value="7">, resolves to: PUT /users/7 -->
```

### Verb → mode defaults

| Verb | Default mode |
| --- | --- |
| GET | sync |
| POST | sync |
| PUT | sync |
| PATCH | async |
| DELETE | sync |

A `sync` request either navigates (GET) or submits the form via POST with method spoofing. An `async` request uses `fetch` with optional CSRF headers and dispatches response events.

### Sync vs. async

**Sync (form submission):**
- GET: `window.location.assign(url)`
- POST/PUT/PATCH/DELETE: set form action, spoof method via `<input name="_method">`, submit normally

**Async (fetch):**
- Sends `Content-Type: application/json` + serialized form data (unless files present, then `multipart/form-data`)
- Includes CSRF header from `<meta name="csrf-token">` (configurable)
- Dispatches `taskCompleted` or `taskFailed` events (see below)
- On success, calls `form.rebaseline()` to reset state

### CSRF configuration

By default, the library reads CSRF tokens from:

```html
<meta name="csrf-token" content="…" />
```

Customize via `Tasks.configure()`:

```js
import { Tasks } from '@hradigital/smartforms';

Tasks.configure({
  csrf: {
    metaName: 'x-csrf-token',      // metadata tag name
    headerName: 'X-Custom-Token',   // header name for fetch
    value: 'static-token-string',   // or a function: () => token
  }
});
```

### Response events

After async requests, the form emits:

- **`taskCompleted`**: `{ descriptor, status, response, body }`
  - `body` is raw response text (never parsed JSON)
  - Form transitions to `NORMAL` state
  - `form.rebaseline()` is called automatically
  
- **`taskFailed`**: `{ descriptor, status, response, body, error }`
  - `status` is the HTTP status code (0 for network errors)
  - `error` is populated on fetch errors only
  - Form state is restored to the pre-request state
  - `body` and `response` are null on network errors

```js
form.addEventListener('taskCompleted', (e) => {
  console.log('Status:', e.detail.status, 'Body:', e.detail.body);
  // redirect, show toast, etc.
});
```

### Button enable/disable by state

`smartforms` separates two concerns:

- **What buttons exist** is the markup author's decision, driven by the *role of the form* (e.g. a single-record edit screen renders `update` + `cancel`; a list screen renders `create` + `deleteall`). The package never adds, removes, or hides buttons that the template did not render.
- **Whether each rendered button is enabled** is driven by the *state of the form* (`NORMAL`, `CHANGED`, `SELECTED`, `MANY`, `ILLEGAL`, `DEACTIVATED`, `SUBMITTED`). The package toggles the `disabled` attribute and the `disabled` CSS class accordingly.

Practical rule of thumb:

> Render only the buttons the form actually supports. Don't render a `cancel` button on a form that has nothing to cancel, and don't render `updateall` on a single-record form. If a button is in the markup, the package assumes it is reachable in some state and will enable it when that state is reached.

Per-state enable matrix (only applies to buttons that are actually rendered):

| State         | Enabled roles                                                       |
| ------------- | ------------------------------------------------------------------- |
| `NORMAL`      | `create`, `destroy`, `back`                                         |
| `CHANGED`     | `edit`, `update`, `updateall`, `delete`, `deleteall`, `cancel`      |
| `SELECTED`    | `edit`, `update`, `delete`, `toggle`, `cancel`                      |
| `MANY`        | `updateall`, `deleteall`                                            |
| `ILLEGAL`     | `cancel` only                                                       |
| `DEACTIVATED` | none (all disabled)                                                 |
| `SUBMITTED`   | none (all disabled while in flight)                                 |

Anything not listed is disabled in that state. A `cancel` button on a freshly loaded form is disabled in `NORMAL` because there is nothing to cancel — it lights up the moment any field becomes `CHANGED`. The `toggle` role is special: it is only enabled in `SELECTED` state (when exactly one row is selected in a list form).

The matrix above mirrors `Button.js` exactly. Note that the practical rule still applies: render only the roles a given form actually supports. `updateall` / `deleteall` are enabled in `CHANGED` as well as `MANY`, but you would only ever render them on a list form, where the dirty states are `SELECTED` / `MANY` rather than `CHANGED`.

## Listening to state changes

```js
form.addEventListener('formStateChange', (e) => {
    console.log('new state:', e.detail.state);
});
```

## Browser support

Evergreen browsers + ES2017+. No IE.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[Mozilla Public License 2.0](./LICENSE)

You may use this package in closed-source and commercial products. If you modify and
distribute the package's own files, those files must remain under the MPL-2.0.

The `HRADigital` name and package names are not covered by that licence - see
[TRADEMARK.md](./TRADEMARK.md).
