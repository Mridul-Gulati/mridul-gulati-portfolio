"use client";

// Destructive action behind a browser confirm. `action` is a Server Action taking FormData with `id`.
export default function DeleteButton({ action, id, label = "Delete", confirmText = "Delete this? This can't be undone." }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-600/40 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-600 hover:text-white dark:border-red-400/40 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
      >
        {label}
      </button>
    </form>
  );
}
