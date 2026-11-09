"use client";
import { useState } from "react";
import MediaPicker from "./MediaPicker";
import { cld } from "@/lib/img";

/** value: { url, publicId, alt? }. withAlt shows an alt-text input. */
export default function ImageField({ label, value, onChange, withAlt = false, help }) {
  const [open, setOpen] = useState(false);
  const v = value || { url: "", publicId: "", alt: "" };
  return (
    <div className="mb-3">
      {label && <label className="form-label fw-semibold">{label}</label>}
      {v.url ? (
        <div className="d-flex gap-3 align-items-start">
          <img src={cld(v.url, 240)} alt="" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10, background: "#eee" }} />
          <div className="flex-grow-1">
            {withAlt && (
              <input className="form-control form-control-sm mb-2" placeholder="Alt text (describe the image)" maxLength={300} value={v.alt || ""} onChange={(e) => onChange({ ...v, alt: e.target.value })} />
            )}
            <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => setOpen(true)}>Replace</button>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onChange({ url: "", publicId: "", alt: "" })}>Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setOpen(true)}>
          <i className="bi bi-image me-1" /> Choose image
        </button>
      )}
      {help && <div className="form-text">{help}</div>}
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(m) => {
            onChange({ url: m.url, publicId: m.publicId, alt: withAlt ? (v.alt || m.alt || "") : "" });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
