import {SystemDescription, SystemInstance} from "../system";
import {PerfCounter} from "babylonjs";
import {getClassName} from "../../shared/functions/get-class-name";

/**
 * Used to profile custom code chunks
 *
 * Can profile multiple branches and switch between them
 */
export class EngineProfiler {

    protected _currentBranch = 0;

    protected counters: PerfCounter[] = [];
    get counter() {
        return this.counters[this._currentBranch];
    }

    get currentBranch() {
        return this._currentBranch;
    }

    constructor(
        readonly tag: string,
        readonly label: string,
        readonly valueReadFunction: (counters: PerfCounter[]) => string,
        readonly branchCount = 1,
    ) {
        if (this.branchCount <= 0) {
            this.branchCount = 1;
        }
        for (let i = 0; i < this.branchCount; i++) {
            this.counters.push(new PerfCounter());
        }
    }

    getValue(): string {
        return this.valueReadFunction(this.counters)
    }

    switchBranchToNext() {
        this._currentBranch = (this._currentBranch + 1) % this.branchCount;
    }

    switchBranchTo(index: number) {
        this._currentBranch = Math.min(this.branchCount - 1, index);
    }
}

export class ProfilingSystemConfig {}

export class ProfilingSystemImpl extends SystemInstance<ProfilingSystemImpl, ProfilingSystemConfig> {

    protected profilers: Record<string, EngineProfiler> = {};

    protected async initialize() {
    }

    getAllProfilers(): Readonly<Record<string, EngineProfiler>> {
        return this.profilers;
    }

    addProfiler(profiler: EngineProfiler): EngineProfiler {
        if (this.profilers[profiler.tag]) {
            throw Error(`[${getClassName(this)}]: Trying to add profiler with tag [${profiler.tag}], but name is already taken with label [${this.profilers[profiler.tag].label}]`);
        }

        this.profilers[profiler.tag] = profiler;
        return profiler;
    }

    getProfilerByTag(tag: string): EngineProfiler | undefined {
        return this.profilers[tag];
    }

    removeProfilerByTag(tag: string) {
        if (this.profilers[tag]) {
            delete this.profilers[tag];
        }
    }
}

export const ProfilingSystem = new SystemDescription(
    ProfilingSystemConfig,
    ProfilingSystemImpl,
    []
);