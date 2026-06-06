/// <reference types="vite/client" />

// Add this to fix CSS import error
declare module '*.css' {
  const content: string;
  export default content;
}