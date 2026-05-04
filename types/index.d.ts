export type FormState =
    | 'normal'
    | 'changed'
    | 'selected'
    | 'many'
    | 'submitted'
    | 'deactivated'
    | 'illegal'
    | 'reordered';

export const State: {
    readonly NORMAL: FormState;
    readonly CHANGED: FormState;
    readonly SELECTED: FormState;
    readonly MANY: FormState;
    readonly SUBMITTED: FormState;
    readonly DEACTIVATED: FormState;
    readonly ILLEGAL: FormState;
    readonly REORDERED: FormState;
};

export const Roles: {
    readonly CREATE: string;
    readonly UPDATE: string;
    readonly UPDATEALL: string;
    readonly DELETE: string;
    readonly DELETEALL: string;
    readonly CANCEL: string;
    readonly LINK: string;
    readonly REORDER: string;
};

export class SmartForm {
    constructor(form: HTMLFormElement);
    state(): FormState;
}

export class SmartFormList {
    constructor(list: HTMLElement, state: FormState);
    state(): FormState;
    rowCount(): number;
    changedCount(): number;
}

export class SmartFormRecord {
    constructor(record: HTMLElement, state: FormState);
    state(): FormState;
}

export class BaseInput {
    constructor(element: HTMLElement, state: FormState);
}

export class TextInput extends BaseInput {}
export class NumberInput extends BaseInput {}
export class UrlInput extends TextInput {}
export class ColorInput extends BaseInput {}
export class DateTimeInput extends TextInput {}
export class FileInput extends BaseInput {}
export class TextAreaInput extends BaseInput {}
export class CheckBoxInput extends BaseInput {}
export class RadioInput extends BaseInput {}
export class SelectInput extends BaseInput {}
export class DynamicTableInput extends BaseInput {}

export class Row {
    constructor(row: HTMLElement, order: number);
    id(): string | number;
}

export class Toolbar {
    constructor(nav: HTMLElement, adminForm: AdminForm);
}

export class Button {
    constructor(button: HTMLButtonElement);
}

export class AdminForm {
    constructor(form: SmartForm, nav: HTMLElement);
}

export interface AutoInitOptions {
    formSelector?: string;
    toolbarSelector?: string;
}

export interface AutoInitResult {
    forms: SmartForm[];
    admin: AdminForm | null;
}

export function autoInit(options?: AutoInitOptions): AutoInitResult;
