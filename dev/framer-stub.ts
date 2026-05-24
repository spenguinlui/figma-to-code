/**
 * Framer API stub for local development.
 * Provides no-op versions of Framer-specific APIs so components
 * can run outside of Framer without modification.
 */

// ControlType enum — matches Framer's actual values
export const ControlType = {
    String: "string",
    Number: "number",
    Boolean: "boolean",
    Color: "color",
    Enum: "enum",
    Image: "image",
    File: "file",
    ComponentInstance: "componentinstance",
    Array: "array",
    Object: "object",
    FusedNumber: "fusednumber",
    Transition: "transition",
    EventHandler: "eventhandler",
    Link: "link",
    RichText: "richtext",
    Date: "date",
    Cursor: "cursor",
} as const

// No-op: PropertyControls are only for Framer's UI
export function addPropertyControls(_component: any, _controls: any) {}

// Re-export framer-motion so `import { motion } from "framer"` works
export { motion, AnimatePresence } from "framer-motion"
