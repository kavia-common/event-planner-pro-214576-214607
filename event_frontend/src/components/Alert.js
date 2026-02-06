import React from "react";

/**
 * PUBLIC_INTERFACE
 */
export function Alert({ type = "info", title, message }) {
  /** Simple alert banner. */
  const cls =
    type === "error"
      ? "alert alertError"
      : type === "success"
        ? "alert alertSuccess"
        : "alert";

  return (
    <div className={cls} role={type === "error" ? "alert" : "status"} aria-live="polite">
      {title ? <div style={{ fontWeight: 900, marginBottom: 4 }}>{title}</div> : null}
      <div>{message}</div>
    </div>
  );
}
