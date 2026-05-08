import Toolbar from './Toolbar';

/**
 * Main form's handling class.
 *
 * @package   SmartForms\Assets
 */
class AdminForm {
    /**
     * Initializes the Form's handling instance.
     *
     * @param {object}  form
     * @param {Toolbar} toolbar
     */
    constructor(form, toolbar) {
        // Sets the form's initial state.
        this._form = form;

        // Configures the Toolbar, if one was provided.
        if (toolbar !== null) {
            toolbar
                .element()
                .addEventListener('taskExecuted', (e) => this.onTaskExecuted(e), false);
        }
    }

    /**
     * Event handler for when a Button's task is requested.
     *
     * @param {Event} e - New Row's state Event.
     */
    onTaskExecuted(e) {
        // Prevents Form's default behaviour and propagation.
        e.preventDefault();
        e.stopPropagation();

        // Sets the request task in the main Form's task field, if one exists.
        if (this._form.task && 'value' in this._form.task) {
            this._form.task.value = e.detail.task.trim().toLowerCase();
        }

        // Triggers an 'onSubmit' event in the form, before actually submitting it.
        // When submitting the form directly via Javascript, this event is not triggered.
        this._form.dispatchEvent(
            new Event('submit', {
                bubbles: true,
                cancelable: true,
            }),
        );
        this._form.submit();
    }
}

export default AdminForm;
