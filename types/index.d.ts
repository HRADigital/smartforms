export type FormState =
    | 'normal'
    | 'changed'
    | 'selected'
    | 'many'
    | 'submitted'
    | 'deactivated'
    | 'illegal';

export const State: {
    readonly NORMAL: FormState;
    readonly CHANGED: FormState;
    readonly SELECTED: FormState;
    readonly MANY: FormState;
    readonly ILLEGAL: FormState;
    readonly DEACTIVATED: FormState;
    readonly SUBMITTED: FormState;
};

export const Roles: {
    readonly CREATE: string;
    readonly EDIT: string;
    readonly UPDATE: string;
    readonly UPDATEALL: string;
    readonly DELETE: string;
    readonly DELETEALL: string;
    readonly DESTROY: string;
    readonly BACK: string;
    readonly TOGGLE: string;
    readonly CANCEL: string;
};

export class SmartForm {
    constructor(form: HTMLFormElement);
    state(): FormState;
    resource(): string | null;
    id(): string | null;
    selectedIds(): string[];
    rebaseline(): void;
}

export class SmartFormList {
    constructor(list: HTMLElement, state: FormState);
    state(): FormState;
    rowCount(): number;
    changedCount(): number;
    resource(): string | null;
    selectedIds(): string[];
    id(): string | null;
    rebaseline(): void;
}

export class SmartFormRecord {
    constructor(record: HTMLElement, state: FormState);
    state(): FormState;
    reset(): void;
    rebaseline(): void;
}

export class BaseInput {
    constructor(element: HTMLElement, state: FormState);
    name(): string | null;
    isIllegal(): boolean;
    reset(): void;
    rebaseline(): void;
}

export class TextInput extends BaseInput {}
export class EmailInput extends TextInput {}
export class UrlInput extends TextInput {}
export class DateTimeInput extends TextInput {}
export class NumberInput extends BaseInput {}
export class ColorInput extends BaseInput {}
export class FileInput extends BaseInput {}
export class TextAreaInput extends BaseInput {}
export class CheckBoxInput extends BaseInput {}
export class RadioInput extends BaseInput {}
export class SelectInput extends BaseInput {}
export class DynamicTableInput extends BaseInput {}

export class Row {
    constructor(element: HTMLElement, order: number);
    id(): string | number;
    order(): number;
}

export class Toolbar {
    constructor(element: HTMLElement, form: HTMLFormElement);
    state(): FormState;
    element(): HTMLElement;
    setState(state: FormState): void;
}

export class Button {
    constructor(button: HTMLElement);
    element(): HTMLElement;
    setState(state: FormState): void;
}

export class AdminForm {
    constructor(form: HTMLFormElement);
}

export interface TaskDescriptor {
    mode: 'sync' | 'async';
    verb: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint: string;
}

export interface CsrfConfig {
    metaName?: string;
    headerName?: string;
    value?: string | (() => string | null) | null;
}

export interface TasksConfig {
    tasks?: Record<string, string>;
    roleMap?: Record<string, string | null>;
    csrf?: CsrfConfig;
}

export const Tasks: {
    readonly roleMap: Record<string, string | null>;
    parse(taskString: string): TaskDescriptor;
    fillTokens(endpoint: string, ctx: Record<string, unknown>): string;
    maybeAppendId(endpoint: string, verb: string, ctx: { id?: unknown }): string;
    resolve(role: string, dataTaskAttr?: string | null): TaskDescriptor | null;
    configure(config?: TasksConfig): void;
    csrf(): { headerName: string; value: string } | null;
};

export interface ExecuteOptions {
    source?: HTMLElement;
    instance?: SmartForm | SmartFormList | SmartFormRecord;
}

export function execute(
    form: HTMLFormElement,
    descriptor: TaskDescriptor,
    options?: ExecuteOptions,
): void | Promise<void>;

export const TaskExecutor: {
    execute: typeof execute;
};

export function autoInit(root?: Document | HTMLElement): void;
export function registerForm(form: HTMLFormElement, instance: SmartForm | SmartFormList): void;
export function getForm(form: HTMLFormElement): SmartForm | SmartFormList | null;
export function toggleDebug(value: boolean): void;
