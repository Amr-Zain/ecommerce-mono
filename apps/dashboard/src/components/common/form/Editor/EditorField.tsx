"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import DOMPurify from "dompurify";
import '@/styles/editor.css'

import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code2, Highlighter, Italic,
  Link as LinkIcon, List, ListOrdered, ListTodo, Quote, Redo2, Strikethrough,
  Subscript as SubIcon, Superscript as SupIcon, Underline as UnderlineIcon, Undo2
} from "lucide-react";

import HighlightColorPicker from "./highlightColorPicker";
import ImageUploadButton from "./ImageUploadButton";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { Button } from "@ecommerce/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ecommerce/ui/components/select";
import { cn } from "@/lib/utils";

export interface EditorProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  placeholder?: string;
  height?: number;
  toolbar?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  ariaInvalid?: boolean;
  focusApiRef?: (api: { focus: () => void; el: HTMLDivElement | null } | null) => void;
}

function EditorField<T extends FieldValues>({
  field,
  placeholder,
  height = 200,
  toolbar = true,
  disabled = false,
  className = "",
  id,
  ariaInvalid,
  focusApiRef,
}: EditorProps<T>) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const extensions = useMemo(
    () => [
      StarterKit,
      Underline,
      Link,
      Superscript,
      Subscript,
      Highlight.configure({ multicolor: true }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      BulletList,
      OrderedList,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: field.value || "<p></p>",
    onUpdate({ editor }) {
      const html = DOMPurify.sanitize(editor.getHTML());
      field.onChange(html);
    },
    editorProps: {
      attributes: {
        class: [
          "tiptap-editor leading-6",
          "focus:outline-none focus-visible:outline-none",
          disabled ? "opacity-50 pointer-events-none" : "",
        ].filter(Boolean).join(" "),
        role: "textbox",
        "aria-multiline": "true",
        "aria-invalid": ariaInvalid ? "true" : "false",
        ...(id ? { id } : {}),
      },
    },
    editable: !disabled,
  });

  useEffect(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if (field.value !== html) {
      editor.commands.setContent(field.value || "<p></p>"/* , false, { preserveWhitespace: "full" } */);
    }
  }, [editor, field.value]);

  // Wait until the element is visible (not display:none) before focusing
  const focusWhenVisible = () => {
    if (!editor) return;
    
    const el = editor.view.dom;
    let tries = 0;
    const tick = () => {
      const cs = window.getComputedStyle(el);
      const visible = cs.display !== "none" && cs.visibility !== "hidden" && el.offsetParent !== null;
      if (visible) {
        // Focus and move cursor to the end
        editor.commands.focus('end');
        
        // Ensure DOM has focus and scroll into view
        requestAnimationFrame(() => {
          if (editor.view.dom) {
            editor.view.dom.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        });
      } else if (tries++ < 12) {
        // ~2 frames @ 60fps * 12 ≈ 200ms budget
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  // Expose focus API to parent (used by tabs + onSubmit error jump)
  useEffect(() => {
    if (!focusApiRef || !editor) return;
    focusApiRef({ focus: focusWhenVisible, el: containerRef.current });
    return () => focusApiRef(null);
  }, [focusApiRef, editor]);


  const headingOptions = [
    { value: "0", label: "Normal" },
    { value: "1", label: "H1" },
    { value: "2", label: "H2" },
    { value: "3", label: "H3" },
    { value: "4", label: "H4" },
    { value: "5", label: "H5" },
    { value: "6", label: "H6" },
  ];

  const toolbarItems = [
  { icon: <Undo2 size={18} />, action: () => editor.chain().focus().undo().run(), isActive: false, title: "Undo" },
  { icon: <Redo2 size={18} />, action: () => editor.chain().focus().redo().run(), isActive: false, title: "Redo" },
  { icon: <Bold size={18} />, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold"), title: "Bold" },
  { icon: <Italic size={18} />, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic"), title: "Italic" },
  { icon: <UnderlineIcon size={18} />, action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive("underline"), title: "Underline" },
  { icon: <Strikethrough size={18} />, action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive("strike"), title: "Strikethrough" },
  { icon: <Code2 size={18} />, action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive("code"), title: "Code" },
  { icon: <Highlighter size={18} />, action: () => editor.chain().focus().toggleHighlight().run(), isActive: editor.isActive("highlight"), title: "Highlight" },
  { icon: <SupIcon size={18} />, action: () => editor.chain().focus().toggleSuperscript().run(), isActive: editor.isActive("superscript"), title: "Superscript" },
  { icon: <SubIcon size={18} />, action: () => editor.chain().focus().toggleSubscript().run(), isActive: editor.isActive("subscript"), title: "Subscript" },
  {
    icon: <LinkIcon size={18} />,
    action: () => {
      const url = window.prompt("Enter the URL");
      if (url) editor.chain().focus().setLink({ href: url }).run();
    },
    isActive: editor.isActive("link"),
    title: "Link",
  },
  { icon: <Quote size={18} />, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive("blockquote"), title: "Quote" },
  { icon: <List size={18} />, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive("bulletList"), title: "Bullet List" },
  { icon: <ListOrdered size={18} />, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive("orderedList"), title: "Ordered List" },
  { icon: <ListTodo size={18} />, action: () => editor.chain().focus().toggleTaskList().run(), isActive: editor.isActive("taskList"), title: "Task List" },
  { icon: <AlignLeft size={18} />, action: () => editor.chain().focus().setTextAlign("left").run(), isActive: editor.isActive({ textAlign: "left" }), title: "Align Left" },
  { icon: <AlignCenter size={18} />, action: () => editor.chain().focus().setTextAlign("center").run(), isActive: editor.isActive({ textAlign: "center" }), title: "Align Center" },
  { icon: <AlignRight size={18} />, action: () => editor.chain().focus().setTextAlign("right").run(), isActive: editor.isActive({ textAlign: "right" }), title: "Align Right" },
  { icon: <AlignJustify size={18} />, action: () => editor.chain().focus().setTextAlign("justify").run(), isActive: editor.isActive({ textAlign: "justify" }), title: "Justify" },
];



const wrapper = cn(
  // base
  "rounded-md border bg-background text-foreground w-full min-w-0",
  "shadow-xs transition-[color,box-shadow] outline-none",

  // focus (match Input’s ring & border, but use focus-within so inner editor can trigger it)
  "focus-within:border-ring",
  "focus-within:ring-[3px] focus-within:ring-ring/50",

  // invalid (same as Input)
  "aria-invalid:border-destructive",
  "aria-invalid:focus-within:ring-destructive/20",
  "dark:aria-invalid:focus-within:ring-destructive/40",

  // disabled parity (optional)
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

  className
);


  return (
    <div className={wrapper} aria-invalid={ariaInvalid ? "true" : "false"} ref={containerRef}>
      {toolbar && (
        <div className="border-b p-2 flex flex-wrap items-center gap-1 bg-muted/50 rounded-t-xl">
          {toolbarItems.map((item, i) => (
            <Button
              key={i}
              type="button"
              variant={item.isActive ? "default" : "ghost"}
              size="sm"
              onClick={item.action}
              disabled={disabled}
              title={item.title}
              className="h-8 w-8 p-0"
            >
              {item.icon}
            </Button>
          ))}
          <div className="h-6 w-px bg-border mx-1" />
          <HighlightColorPicker
            onSelect={(color) => {
              editor.chain().focus().command(({ commands }) => {
                color ? commands.setHighlight({ color }) : commands.unsetHighlight();
                return true;
              }).run();
            }}
          />
          <ImageUploadButton
            onImageAdd={(src) => {
              editor.chain().focus().setImage({ src }).run();
            }}
          />
          <Select
            value={
              editor.isActive("heading", { level: 1 }) ? "1"
              : editor.isActive("heading", { level: 2 }) ? "2"
              : editor.isActive("heading", { level: 3 }) ? "3"
              : editor.isActive("heading", { level: 4 }) ? "4"
              : editor.isActive("heading", { level: 5 }) ? "5"
              : editor.isActive("heading", { level: 6 }) ? "6"
              : "0"
            }
            onValueChange={(value) => {
              if (value === "0") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: Number(value) as 1|2|3|4|5|6 }).run();
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-24 ms-2 !bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {headingOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Click anywhere in padding to focus the editor - now fills full height */}
      <div
        className="p-4 cursor-text"
        style={{ minHeight: `${height}px` }}
        onMouseDown={(e) => {
          // Only focus if clicking on empty space (not on text content)
          const target = e.target as HTMLElement;
          if (target.closest('.ProseMirror') && !target.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote')) {
            e.preventDefault();
            editor.commands.focus('end');
          } else if (!target.closest('.ProseMirror')) {
            e.preventDefault();
            editor.commands.focus('end');
          }
        }}
      >
        <EditorContent
          editor={editor}
          ref={contentRef}
          onBlur={field.onBlur}
          style={{ minHeight: `${height - 24}px` }}
        />
      </div>
    </div>
  );
}

export default EditorField;