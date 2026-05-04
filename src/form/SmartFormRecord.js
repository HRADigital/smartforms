import State           from '../../constants/State';
import TextInput       from './input/TextInput';
import UrlInput        from './input/UrlInput';
import NumberInput     from './input/NumberInput';
import SelectInput     from './input/SelectInput';
import FileInput       from './input/FileInput';
import ColorInput      from './input/ColorInput';
import TextAreaInput        from './input/TextAreaInput';
import CheckBoxInput        from './input/CheckBoxInput';
import DateTimeInput        from './input/DateTimeInput';
import RadioInput           from './input/RadioInput';
import DynamicTableInput    from './input/DynamicTableInput';

// Collection of available inputs.
const inputs = {
    'select': SelectInput,
    'textarea': TextAreaInput,
    'input.text': TextInput,
    'input.url': UrlInput,
    'input.number': NumberInput,
    'input.checkbox': CheckBoxInput,
    'input.radio': RadioInput,
    'input.file': FileInput,
    'input.color': ColorInput,
    'input.datetime': DateTimeInput,
    'table': DynamicTableInput,
};

/**
 * Form's Record handling class.
 * 
 * @package   SmartForms\Assets
 */
class SmartFormRecord {

    /**
     * Initialize the Record's management form instance.
     * 
     * @param {object} element
     * @param {State}  state
     */
    constructor(element, state) {

        // Sets the Record's initial state.
        this._form     = element;
        this._state    = state;
        this._inputs   = [];
        this._changed  = [];
        this._illegal  = [];

        // Initializes all form's Web Controls.
        this.searchAndLoadWebcontrols(state);
        this.triggerEvent();
    }

    /**
     * Returns the Form's current state.
     * 
     * @returns {State}
     */
    state() {
        return this._state;
    }

    /**
     * Searches and loads all existing Webcontrols in the form.
     * 
     * @param {State} state 
     */
    searchAndLoadWebcontrols(state) {

        // Loads all main controls.
        let selectors = [
            'fieldset input:not(.ignore):not([type=checkbox]):not([type=radio])',
            'fieldset textarea:not(.ignore)',
            'fieldset select:not(.ignore)',
            'fieldset input[type=checkbox]:not(.ignore):first-of-type',
            'fieldset input[type=radio]:not(.ignore):first-of-type',
        ];

        this.initializeWebControls(state, selectors);
        this.initializeTables(state);
    }

    /**
     * Initializes a list of Webcontrols, and adds them to the form.
     * 
     * @param {object} state 
     * @param {array}  selectors 
     */
    initializeWebControls(state, selectors) {

        // Checks that we're querying something.
        // We've might received an empty selector's array to query.
        if (selectors.length === 0) {
            return;
        }

        // Loops throught all the provided selectors.
        let names = [];
        this._form.querySelectorAll(selectors.join()).forEach(input => {

            // Checks if the  input hasn't been processed yet.
            // Protection against Checkboxes and Radio Buttons.
            let name = input.getAttribute('name');
            if (names.indexOf(name) >= 0) {
                return;
            }
            names.push(name);

            // Collects parent Fieldset, and sets StateChange event handler configuration.
            let fieldset = input.closest('fieldset');
            fieldset.addEventListener('stateChange', e => this.onStateChange(e), false);

            // Adds the input to the Webcontrol's list, and finishes formatting it.
            let inputType = this.getClassName(input);
            this._inputs.push(
                new inputs[inputType](fieldset, state)
            );
        });
    }

    /**
     * Initializes all DynamicTables Web Control's classes, and adds them to the form.
     */
    initializeTables(state) {

        // Loads all dynamic datatables.
        this._form.querySelectorAll('table.smartdynamictable:not(.ignore)').forEach(table => {

            // Sets StateChange event handler configuration on parent Fieldset.
            table.addEventListener('stateChange', e => this.onStateChange(e), false);

            // Adds the input to the Webcontrol's list, and finishes formatting it.
            let inputType = this.getClassName(table);
            this._inputs.push(
                new inputs[inputType](table, state)
            );
        });
    }

    /**
     * Processes and returns an appropriate Name for the supplied Input element.
     * 
     * @param {object} input
     * 
     * @returns {string} 
     */
    getClassName(input) {

        // Collects the input's Node name, and converts it to LowerCase.
        let name = input.nodeName.trim().toLowerCase();

        // Validates the Element type of WebControl being initialized.
        // If Element is of type 'input', we'll need to specify which on of the different classes
        // will be loaded. The input's type will be concatenated to the input's Node name.
        if (name === 'input') {
            if (input.classList.contains('datetimepicker')) {
                name += '.datetime';
            } else {
                name += '.' + input.getAttribute('type').trim().toLowerCase();
            }
        }

        return name;
    }

    /**
     * Event handler for when the Input's Fieldset state has changed.
     * We'll need to process the whole Form's state.
     * 
     * @param {Event} e 
     */
    onStateChange(e) {
        this.checkChanged(e.detail.instance, e.detail.state);
        this.checkIllegal(e.detail.instance);
        this.checkForm();
    }

    /**
     * We'll need to evaluate the Input's current state, in order to proccess the Input's state tracking.
     * 
     * @param {object} input 
     * @param {State}  state 
     */
    checkChanged(input, state) {
        
        let index = this._changed.indexOf(input.name());

        if (state === State.NORMAL && index >= 0) {
            this._changed.splice(index, 1);
        } else if (state === State.CHANGED && index < 0) {
            this._changed.push(input.name());
        }
    }

    /**
     * We'll need to evaluate the Input's current state, in order to proccess the Input's state tracking.
     * 
     * @param {object} input 
     */
    checkIllegal(input) {
        
        let index = this._illegal.indexOf(input.name());

        if (index >= 0 && !input.isIllegal()) {
            this._illegal.splice(index, 1);
        } else if (index < 0 && input.isIllegal()) {
            this._illegal.push(input.name());
        }
    }

    /**
     * Processes the Form's current state, and calls parent callback if required (state changed).
     */
    checkForm() {

        // Now we'll evaluate possible scenarios.
        let state = State.NORMAL;
        if (this._illegal.length > 0) {
            state = State.ILLEGAL;
        } else if (this._changed.length > 0) {
            state = State.CHANGED;
        }

        // Now we'll compare current state, with previous one.
        if (this._state !== state) {
            this._state = state;
            this.triggerEvent();
        }
    }

    /**
     * Triggers a State change event.
     */
    triggerEvent() {

        // Configures Custom Event for State change.
        let event = new CustomEvent(
            'formStateChange',
            {
                bubbles:    true,
                cancelable: false,
                detail: {
                    state: this._state,
                    instance: this,
                },
            }
        );

        // Triggers Custom Event.
        this._form.dispatchEvent(event);
    }
}

export default SmartFormRecord;
