import { ECRStoreTools } from "../store.api.tools";
import { SimpleStore } from "./simple.store";

ECRStoreTools.runTests(SimpleStore.name, () => new SimpleStore());
