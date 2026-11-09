"use client";
import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import MediaPicker from "./MediaPicker";
import { useAdmin } from "./AdminContext";
import { cld } from "@/lib/img";

const IMG_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

function Btn({ onClick, active, title, icon, text, disabled }) {
  return (
    <button type="button" title={title} aria-label={title} disabled={disabled} onClick={onClick} className={`btn btn-sm ${active ? "btn-dark" : "btn-light"}`}>
      {icon ? <i className={`bi ${icon}`} /> : text}
    </button>
  );
}

/** Light formatting so the HTML view is readable. */
function prettyHtml(html) {
  return String(html || "")
    .replace(/></g, ">\n<")
    .replace(/\n<\/(li)>/g, "</$1>")
    .replace(/<(li)>\n/g, "<$1>")
    .replace(/<\/(p|h2|h3|h4|blockquote|pre|figure)>(?!\n)/g, "</$1>\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function RichEditor({ value, onChange }) {
  const { api } = useAdmin();
  const [picker, setPicker] = useState(false);
  const [mode, setMode] = useState("visual");
  const [htmlText, setHtmlText] = useState("");
  const [status, setStatus] = useState("");
  const editorRef = useRef(null);

  async function uploadAndInsert(files) {
    const list = files.filter((f) => IMG_TYPES.includes(f.type));
    if (!list.length) return;
    for (const file of list) {
      setStatus(`Uploading ${file.name || "image"}…`);
      try {
        const form = new FormData();
        form.append("file", file);
        const d = await api("/api/admin/media", { method: "POST", form });
        editorRef.current?.chain().focus().setImage({ src: cld(d.item.url, 1200), alt: d.item.alt || "" }).run();
        setStatus("Image added. Select it and click the “Alt” button to describe it.");
      } catch (e) {
        setStatus(e.message);
      }
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Image,
      Link.configure({ openOnClick: false, autolink: true, protocols: ["http", "https", "mailto"] }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    onCreate: ({ editor: ed }) => {
      editorRef.current = ed;
    },
    editorProps: {
      handlePaste: (view, event) => {
        const files = [...(event.clipboardData?.files || [])].filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        uploadAndInsert(files);
        return true;
      },
      handleDrop: (view, event) => {
        const files = [...(event.dataTransfer?.files || [])].filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        uploadAndInsert(files);
        return true;
      },
    },
  });

  if (!editor) return <div className="adm-editor" style={{ minHeight: 380 }} />;
  editorRef.current = editor;

  const htmlMode = mode === "html";

  function toHtml() {
    setHtmlText(prettyHtml(editor.getHTML()));
    setMode("html");
  }
  function toVisual() {
    editor.commands.setContent(htmlText, false);
    onChange(editor.getHTML());
    setMode("visual");
  }

  function setLink() {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL (https://…). Leave empty to remove the link.", prev);
    if (url === null) return;
    if (url === "") return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    if (!/^(https?:\/\/|mailto:)/i.test(url)) return window.alert("Links must start with https://, http:// or mailto:");
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function setAlt() {
    const prev = editor.getAttributes("image").alt || "";
    const alt = window.prompt("Describe this image (alt text, good for SEO and accessibility):", prev);
    if (alt === null) return;
    editor.chain().focus().updateAttributes("image", { alt }).run();
  }

  const c = () => editor.chain().focus();
  const text = editor.getText();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="adm-editor">
      <div className="adm-editor-bar">
        <Btn disabled={htmlMode} title="Bold" icon="bi-type-bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()} />
        <Btn disabled={htmlMode} title="Italic" icon="bi-type-italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()} />
        <Btn disabled={htmlMode} title="Underline" icon="bi-type-underline" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()} />
        <Btn disabled={htmlMode} title="Strikethrough" icon="bi-type-strikethrough" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()} />
        <Btn disabled={htmlMode} title="Heading 2" text="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()} />
        <Btn disabled={htmlMode} title="Heading 3" text="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
        <Btn disabled={htmlMode} title="Heading 4" text="H4" active={editor.isActive("heading", { level: 4 })} onClick={() => c().toggleHeading({ level: 4 }).run()} />
        <Btn disabled={htmlMode} title="Bulleted list" icon="bi-list-ul" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()} />
        <Btn disabled={htmlMode} title="Numbered list" icon="bi-list-ol" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()} />
        <Btn disabled={htmlMode} title="Quote" icon="bi-quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()} />
        <Btn disabled={htmlMode} title="Link" icon="bi-link-45deg" active={editor.isActive("link")} onClick={setLink} />
        <Btn disabled={htmlMode} title="Insert image (upload or choose from library)" icon="bi-image" onClick={() => setPicker(true)} />
        <Btn disabled={htmlMode || !editor.isActive("image")} title="Edit alt text of the selected image" text="Alt" onClick={setAlt} />
        <Btn disabled={htmlMode} title="Divider line" icon="bi-hr" onClick={() => c().setHorizontalRule().run()} />
        <Btn disabled={htmlMode} title="Clear formatting" icon="bi-eraser" onClick={() => c().unsetAllMarks().clearNodes().run()} />
        <Btn disabled={htmlMode} title="Undo" icon="bi-arrow-counterclockwise" onClick={() => c().undo().run()} />
        <Btn disabled={htmlMode} title="Redo" icon="bi-arrow-clockwise" onClick={() => c().redo().run()} />
        <span className="ms-auto d-flex gap-1">
          <button type="button" className={`btn btn-sm ${!htmlMode ? "btn-dark" : "btn-light"}`} onClick={() => htmlMode && toVisual()}>Visual</button>
          <button type="button" className={`btn btn-sm ${htmlMode ? "btn-dark" : "btn-light"}`} onClick={() => !htmlMode && toHtml()}>
            <i className="bi bi-code-slash me-1" />HTML
          </button>
        </span>
      </div>

      <div style={{ display: htmlMode ? "none" : "block" }}>
        <EditorContent editor={editor} />
      </div>
      {htmlMode && (
        <textarea
          className="adm-html"
          spellCheck={false}
          value={htmlText}
          aria-label="HTML source"
          onChange={(e) => {
            setHtmlText(e.target.value);
            onChange(e.target.value);
          }}
        />
      )}

      <div className="adm-editor-foot">
        <span>
          {htmlMode
            ? "HTML view: unsupported tags and scripts are removed when you save or switch back to Visual."
            : status || "Tip: drag, drop or paste images straight into the text."}
        </span>
        <span>{words} words</span>
      </div>

      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onSelect={(m) => {
            editor.chain().focus().setImage({ src: cld(m.url, 1200), alt: m.alt || "" }).run();
            setPicker(false);
            setStatus("Image added. Select it and click the “Alt” button to describe it.");
          }}
        />
      )}
    </div>
  );
}
