export function html(strings) {
    const div = document.createElement('div');
    div.innerHTML = strings.raw[0].trim();
    document.body.appendChild(div);
    return div;
}

export function fieldset(inner, attrs = '') {
    return html`<fieldset ${attrs}>${inner}</fieldset>`.querySelector('fieldset');
}

export function captureEvent(target, type) {
    const events = [];
    target.addEventListener(type, (e) => events.push(e), false);
    return events;
}

export function fireChange(input, value) {
    if (value !== undefined) input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

export function fireKeyup(input, value) {
    if (value !== undefined) input.value = value;
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
}

export function fireClick(input) {
    input.dispatchEvent(new Event('click', { bubbles: true }));
}

export function clearDom() {
    document.body.innerHTML = '';
}
