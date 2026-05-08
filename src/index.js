export { default as SmartForm } from './form/SmartForm';
export { default as SmartFormList } from './form/SmartFormList';
export { default as SmartFormRecord } from './form/SmartFormRecord';

export { default as BaseInput } from './form/input/BaseInput';
export { default as TextInput } from './form/input/TextInput';
export { default as EmailInput } from './form/input/EmailInput';
export { default as NumberInput } from './form/input/NumberInput';
export { default as UrlInput } from './form/input/UrlInput';
export { default as ColorInput } from './form/input/ColorInput';
export { default as DateTimeInput } from './form/input/DateTimeInput';
export { default as FileInput } from './form/input/FileInput';
export { default as TextAreaInput } from './form/input/TextAreaInput';
export { default as CheckBoxInput } from './form/input/CheckBoxInput';
export { default as RadioInput } from './form/input/RadioInput';
export { default as SelectInput } from './form/input/SelectInput';
export { default as DynamicTableInput } from './form/input/DynamicTableInput';

export { default as Row } from './form/list/Row';

export { default as Toolbar } from './toolbar/Toolbar';
export { default as Button } from './toolbar/Button';
export { default as AdminForm } from './toolbar/AdminForm';

export { default as State } from './constants/State';
export { default as Roles } from './constants/Roles';
export { default as Tasks } from './constants/Tasks';

import SmartForm from './form/SmartForm';
import SmartFormList from './form/SmartFormList';
import Toolbar from './toolbar/Toolbar';
import AdminForm from './toolbar/AdminForm';

export function autoInit({
    formSelector = 'form.smartform, form.smartformlist',
    toolbarSelector = 'nav.toolbar',
} = {}) {
    const result = [];

    document.querySelectorAll(formSelector).forEach((form) => {
        const nav = form.querySelector(toolbarSelector);

        try {
            const isList = form.classList.contains('smartformlist') && !form.classList.contains('smartform');
            const formInstance = isList ? new SmartFormList(form) : new SmartForm(form);

            let admin = null;
            if (nav !== null) {
                const toolbar = new Toolbar(nav, form);
                admin = new AdminForm(form, toolbar);
            }

            result.push({ form: formInstance, admin });
        } catch (e) {
            console.error('[SmartForms] autoInit failed for form', form.id, e);
        }
    });

    return result;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoInit());
} else {
    autoInit();
}
