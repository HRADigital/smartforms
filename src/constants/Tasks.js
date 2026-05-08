/**
 * Default `data-task` values, aligned with Laravel resource controller actions.
 *
 * The library never validates the contents of `data-task` — these are the
 * recommended defaults so that a button click submits a task name your
 * `Route::resource(...)` controller already understands.
 *
 * Pairing with roles (see `Roles.js`):
 *   create     → STORE         (POST /resource → store())
 *   update     → UPDATE        (PUT/PATCH /resource/{id} → update())
 *   updateall  → UPDATE_MANY   (bulk variant; no native Laravel route)
 *   delete     → DESTROY       (DELETE /resource/{id} → destroy())
 *   deleteall  → DESTROY_MANY  (bulk variant; no native Laravel route)
 *   reorder    → REORDER       (project-defined; no Laravel equivalent)
 *   cancel     → (no task; calls form.reset())
 *   link       → (no task; native anchor navigation)
 */
const Tasks = Object.freeze({
    STORE: 'store',
    UPDATE: 'update',
    UPDATE_MANY: 'updateMany',
    DESTROY: 'destroy',
    DESTROY_MANY: 'destroyMany',
    REORDER: 'reorder',
});

export default Tasks;
