// global.d.ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export {};

// types/react-to-print.d.ts
import 'react-to-print';

declare module 'react-to-print' {
  interface UseReactToPrintOptions {
    content: () => HTMLElement | null;
    onBeforeGetContent?: () => void;
    onAfterPrint?: () => void;
    removeAfterPrint?: boolean;
    copyStyles?: boolean;
    // Add other properties if necessary
  }
}
