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
        <button type="button" data-role="update">Save</button>
        <button type="button" data-role="cancel">Cancel</button>
    </nav>
</form>
```

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
        <button type="button" data-role="delete">Delete selected</button>
        <button type="button" data-role="deleteall">Delete all</button>
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

## Field states

| State         | Meaning                                | Suggested CSS class |
| ------------- | -------------------------------------- | ------------------- |
| `NORMAL`      | unchanged from initial render          | `is-normal`         |
| `CHANGED`     | user-modified, currently valid         | `is-changed`        |
| `SELECTED`    | exactly one row selected (list mode)   | `is-selected`       |
| `MANY`        | multiple rows selected (list mode)     | `is-many`           |
| `SUBMITTED`   | form has been submitted                | `is-submitted`      |
| `DEACTIVATED` | form is read-only                      | `is-deactivated`    |
| `ILLEGAL`     | a field failed validation              | `is-illegal`        |
| `REORDERED`   | list rows have been reordered          | `is-reordered`      |

---

## Supported inputs

`TextInput`, `NumberInput`, `UrlInput`, `ColorInput`, `DateTimeInput`, `FileInput`, `TextAreaInput`, `CheckBoxInput`, `RadioInput`, `SelectInput`, `DynamicTableInput`.

You can subclass `BaseInput` to add your own.

---

## Toolbar action roles

Buttons inside `nav.toolbar` are wired by their `data-role`:

`create`, `update`, `updateall`, `delete`, `deleteall`, `cancel`, `link`, `reorder`.

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
