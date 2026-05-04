import State     from '../../constants/State';
import BaseInput from './BaseInput';

/**
 * Form Checkbox handling class.
 * 
 * @package   SmartForms\Assets
 */
class CheckBoxInput extends BaseInput {

    /**
     * Initializes the CheckBoxInput instance.
     * 
     * @param {object} fieldset 
     * @param {State}  state 
     */
    constructor(fieldset, state) {

        // Calls parent class
        super(fieldset, state);

        // Loads the initial state.
        this._values  = [];
        this._inputs  = fieldset.querySelectorAll('input');

        // Process the initial state.
        this.initCheckBoxes();
    }

    /**
     * Initializes the Fieldset Checkboxes.
     */
    initCheckBoxes() {

        // Loops through all the Fieldset's child checkboxes.
        this._inputs.forEach(element => {

            // Collects the element's name.
            // Will be the same for all Checkboxes.
            this._name = element.getAttribute('name');

            // Sets up the control events.
            element.addEventListener("click", e => this.onClick(e));

            // Loads the value for every checked element.
            if (element.checked && this._values.indexOf(element.value) < 0) {
                this._values.push(element.value);
            }
        });

        // Sets the initial value.
        this._values.sort();
        this._initial = this._values.join();
        this.processChange(this._initial);
    }

    /**
     * Event handler for when the CheckBoxInput changes value.
     * 
     * @param {event} e 
     */
    onClick(e) {

        // Processes the onCLick event in the Checkbox.
        if (e.target.checked) {
            if (this._values.indexOf(e.target.value) < 0) {
                this._values.push(e.target.value);
            }
        } else {
            let index = 0;
            if ((index = this._values.indexOf(e.target.value)) >= 0) {
                this._values.splice(index, 1);
            }
        }

        // Reorders the collected values.
        this._values.sort();

        // Processes the object's State.
        this.processChange(this._values.join());
    }
}

export default CheckBoxInput;
