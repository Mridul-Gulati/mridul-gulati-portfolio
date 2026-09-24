"use client";

import { useActionState } from "react";
import { requirementTypes } from "@/data/site";
import { buttonClass } from "@/components/ui";
import { submitContact } from "./actions";

const inputClass =
  "w-full rounded-lg border border-dark/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-primary aria-invalid:border-red-600 dark:border-light/20 dark:bg-white/5 dark:focus:border-primary-dark dark:aria-invalid:border-red-400";

function Field({ label, name, error, optional, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block font-semibold">
        {label}
        {optional && <span className="ml-1 font-normal text-dark/60 dark:text-light/60">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm({ defaultType }) {
  const [state, formAction, pending] = useActionState(submitContact, null);

  if (state?.status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-dark/10 bg-white p-8 dark:border-light/10 dark:bg-white/5">
        <h2 className="text-2xl font-bold">Thanks, your message is in.</h2>
        <p className="mt-2 text-dark/70 dark:text-light/70">
          I read every enquiry personally and usually reply within one to two working days.
        </p>
      </div>
    );
  }

  const errors = state?.errors ?? {};
  const values = state?.values ?? {};
  const fieldProps = (name) => ({
    id: name,
    name,
    defaultValue: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    className: inputClass,
  });

  return (
    // key resets uncontrolled inputs to the returned values after each failed submit.
    <form key={JSON.stringify(values)} action={formAction} className="space-y-6">
      {state?.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {state.message}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" error={errors.name}>
          <input {...fieldProps("name")} type="text" autoComplete="name" required maxLength={100} />
        </Field>
        <Field label="Work email" name="email" error={errors.email}>
          <input {...fieldProps("email")} type="email" autoComplete="email" required maxLength={200} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Company" name="company" error={errors.company} optional>
          <input {...fieldProps("company")} type="text" autoComplete="organization" maxLength={120} />
        </Field>
        <Field label="What do you need?" name="requirement_type" error={errors.requirement_type}>
          <select
            {...fieldProps("requirement_type")}
            defaultValue={values.requirement_type ?? defaultType ?? ""}
            required
          >
            <option value="" disabled>
              Choose one
            </option>
            {requirementTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tell me about the project" name="message" error={errors.message}>
        <textarea
          {...fieldProps("message")}
          rows={6}
          required
          minLength={20}
          maxLength={5000}
          placeholder="What should the agent do, what systems does it touch, and what does success look like?"
        />
      </Field>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={pending} className={`${buttonClass("primary")} w-full sm:w-auto`}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
