# @hradigital/smartforms

> State-aware client-side form manager for static HTML forms.

[![CI](https://github.com/HraDigital/smartforms/actions/workflows/ci.yml/badge.svg)](https://github.com/HraDigital/smartforms/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@hradigital/smartforms.svg)](https://www.npmjs.com/package/@hradigital/smartforms)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@hradigital/smartforms)](https://bundlephobia.com/package/@hradigital/smartforms)
[![license](https://img.shields.io/npm/l/@hradigital/smartforms.svg)](./LICENSE)

`smartforms` adds dynamic state tracking to plain HTML forms — no framework, no JSX, no template engine. Mark a `<form>` with the `smartform` class and the library will:

- Track per-field state (`new`, `unchanged`, `changed`, `invalid`, `empty`) and apply matching CSS classes for styling.
- Manage two form layouts out of the box: a **list of records** (`smartformlist`) or a **single record** (`smartformrecord`).
- Enable / disable toolbar buttons (create, update, delete, cancel, ...) based on the form's overall state.
- Emit `formStateChange` `CustomEvent`s you can hook into.

---

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

---

## Quick start — single record

```html
<form class="smartform" id="profile">
    <div class="smartformrecord">
        <input type="text"  name="name"  value="Ada" />
        <input type="email" name="email" value="ada@example.com" />
    </div>

    <nav class="toolbar">
        <button type="button" data-role="update" data-task="update">Save</button>
        <button type="button" data-role="cancel">Cancel</button>
    </nav>
</form>
```

> The `data-task` values used here (`update`, `store`, `destroy`, ...) follow Laravel's resource-controller naming. They are conventions, not validated by the package — see [Default `data-task` values](#default-data-task-values) below.

```js
import { SmartForm, AdminForm } from '@hradigital/smartforms';

const form    = new SmartForm(document.querySelector('#profile'));
const toolbar = new AdminForm(form, document.querySelector('#profile nav.toolbar'));
```

When a user edits a field, `smartforms` flips the field state to `CHANGED`, the form's overall state follows, and the `update` / `cancel` buttons enable themselves automatically.

---

## Quick start — list of records

```html
<form class="smartform" id="users">
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
        <button type="button" data-role="delete" data-task="destroy">Delete selected</button>
        <button type="button" data-role="deleteall" data-task="destroyMany">Delete all</button>
    </nav>
</form>
```

```js
import { SmartForm, AdminForm } from '@hradigital/smartforms';

const form = new SmartForm(document.querySelector('#users'));
new AdminForm(form, document.querySelector('#users nav.toolbar'));
```

---

## Auto-init

If you have one form per page and want zero glue code:

```js
import { autoInit } from '@hradigital/smartforms';

autoInit(); // scans for `form.smartform` and `nav.toolbar`
```

---

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

Note: the *form-level* states (`NORMAL`, `CHANGED`, `MANY`, `REORDERED`, `ILLEGAL`, `DEACTIVATED`, `SUBMITTED`) drive toolbar button enable/disable — see "Toolbar action roles" below. They do not produce CSS classes on the form element.

---

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

---

## Supported inputs

`TextInput`, `NumberInput`, `UrlInput`, `ColorInput`, `DateTimeInput`, `FileInput`, `TextAreaInput`, `CheckBoxInput`, `RadioInput`, `SelectInput`, `DynamicTableInput`.

You can subclass `BaseInput` to add your own.

---

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

---

## Toolbar action roles

Buttons inside `nav.toolbar` are wired by their `data-role`:

`create`, `update`, `updateall`, `delete`, `deleteall`, `cancel`, `link`, `reorder`.

### `data-task` — required for action roles

Every role that submits the form must also carry a `data-task` attribute. On click the package writes that value into the form's `task` field (if one exists) and dispatches `submit`, so the server knows which action ran. Without `data-task`, the click handler returns early — the button looks active but does nothing through SmartForms.

| Role                                     | `data-task` required?          | Notes                                                          |
| ---------------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| `create`                                 | only when used as a `<button>` | Used as `<a href>`, native navigation handles the action.      |
| `update`, `updateall`, `delete`, `deleteall`, `reorder` | yes             | Value is what the server reads from the form's `task` field.   |
| `cancel`                                 | no                             | Calls `form.reset()` directly — no submit.                     |
| `link`                                   | no                             | Click falls through to native anchor navigation.               |

The package does not validate the contents of `data-task` — it's a free-form string handed to the server. See "Default `data-task` values" below for the recommended convention.

### Default `data-task` values

To keep server-side wiring predictable, the recommended convention follows Laravel's resource-controller action names. The library ships these as a `Tasks` constants module so you can reference them from JS (or just hard-code the strings in your templates):

```js
import { Tasks } from '@hradigital/smartforms';

Tasks.STORE;        // 'store'
Tasks.UPDATE;       // 'update'
Tasks.UPDATE_MANY;  // 'updateMany'
Tasks.DESTROY;      // 'destroy'
Tasks.DESTROY_MANY; // 'destroyMany'
Tasks.REORDER;      // 'reorder'
```

Pairing with roles:

| Role        | Recommended `data-task` | Maps to                                                        |
| ----------- | ----------------------- | -------------------------------------------------------------- |
| `create`    | `store`                 | Laravel `POST /resource` → `store()`. Anchors keep no task.    |
| `update`    | `update`                | Laravel `PUT/PATCH /resource/{id}` → `update()`.               |
| `updateall` | `updateMany`            | Bulk variant; no native Laravel route — define your own.       |
| `delete`    | `destroy`               | Laravel `DELETE /resource/{id}` → `destroy()`.                 |
| `deleteall` | `destroyMany`           | Bulk variant; no native Laravel route — define your own.       |
| `reorder`   | `reorder`               | Project-defined; no Laravel equivalent.                        |
| `cancel`    | _(no task)_             | Calls `form.reset()`.                                          |
| `link`      | _(no task)_             | Native anchor navigation.                                      |

These are defaults, not requirements — pick whatever value your controller already understands.

### Using an anchor for `data-role="create"`

A "create" action is usually a navigation to a separate page, so it makes sense to render `create` as `<a href="…">` rather than `<button>`. SmartForms still toggles the `disabled` attribute and `disabled` class when the form leaves `NORMAL`, but anchors do not honour the `disabled` attribute natively — clicks would still navigate. Pair the anchor with CSS that suppresses interaction on the disabled class:

```css
.btn.disabled { pointer-events: none; }
```

### Visibility vs. enabled state

`smartforms` separates two concerns:

- **What buttons exist** is the markup author's decision, driven by the *role of the form* (e.g. a single-record edit screen renders `update` + `cancel`; a list screen renders `create` + `deleteall` + `reorder`; a read-only view renders nothing). The package never adds, removes, or hides buttons that the template did not render.
- **Whether each rendered button is enabled** is driven by the *state of the form* (`NORMAL`, `CHANGED`, `MANY`, `REORDERED`, `ILLEGAL`, `DEACTIVATED`, `SUBMITTED`). The package toggles the `disabled` attribute and the `disabled` CSS class accordingly.

Practical rule of thumb:

> Render only the buttons the form actually supports. Don't render a `cancel` button on a form that has nothing to cancel, and don't render `updateall` on a single-record form. If a button is in the markup, the package assumes it is reachable in some state and will enable it when that state is reached.

Per-state enable matrix (only applies to buttons that are actually rendered):

| State         | Enabled roles                                  |
| ------------- | ---------------------------------------------- |
| `NORMAL`      | `create`, `link`                               |
| `CHANGED`     | `update`, `updateall`, `delete`, `deleteall`, `cancel` |
| `SELECTED`    | same as `CHANGED`                              |
| `MANY`        | `updateall`, `deleteall`                       |
| `REORDERED`   | `reorder`, `link`                              |
| `ILLEGAL`     | `cancel` only                                  |
| `DEACTIVATED` | `cancel` only                                  |
| `SUBMITTED`   | none (all disabled while in flight)            |

Anything not listed is disabled in that state. A `cancel` button on a freshly loaded form is disabled in `NORMAL` because there is nothing to cancel — it lights up the moment any field becomes `CHANGED`.

---

## Listening to state changes

```js
form.addEventListener('formStateChange', (e) => {
    console.log('new state:', e.detail.state);
});
```

---

## Browser support

Evergreen browsers + ES2017+. No IE.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[GPL-2.0-or-later](./LICENSE)
