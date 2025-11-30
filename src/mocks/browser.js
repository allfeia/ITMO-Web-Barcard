import { setupWorker } from "msw/browser";
import { signInBarman } from "./signInBarman.js";

export const worker = setupWorker(...signInBarman);
