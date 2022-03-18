import { ECRApiTools } from "../ecr.api.tools";
import { SimpleEcr } from "./simple.ecr";

ECRApiTools.runTests(SimpleEcr.name, () => new SimpleEcr());
