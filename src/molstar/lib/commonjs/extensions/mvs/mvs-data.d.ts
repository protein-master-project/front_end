/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Root } from './tree/mvs/mvs-builder';
import { MVSTree } from './tree/mvs/mvs-tree';
/** Top-level metadata for a MVS file (single-state or multi-state). */
export interface GlobalMetadata {
    /** Name of this MVSData */
    title?: string;
    /** Detailed description of this view */
    description?: string;
    /** Format of `description`. Default is 'markdown'. */
    description_format?: 'markdown' | 'plaintext';
    /** Timestamp when this view was exported. */
    timestamp: string;
    /** Version of MolViewSpec used to write this file. */
    version: string;
}
export declare const GlobalMetadata: {
    create(metadata?: Pick<GlobalMetadata, "title" | "description" | "description_format">): GlobalMetadata;
};
/** Metadata for an individual snapshot. */
export interface SnapshotMetadata {
    /** Name of this snapshot. */
    title?: string;
    /** Detailed description of this snapshot. */
    description?: string;
    /** Format of `description`. Default is 'markdown'. */
    description_format?: 'markdown' | 'plaintext';
    /** Unique identifier of this state, useful when working with collections of states. */
    key?: string;
    /** Timespan for snapshot. */
    linger_duration_ms: number;
    /** Timespan for the animation to the next snapshot. Leave empty to skip animations. */
    transition_duration_ms?: number;
}
export interface Snapshot {
    /** Root of the node tree */
    root: MVSTree;
    /** Associated metadata */
    metadata: SnapshotMetadata;
}
/** MVSData with a single state */
export interface MVSData_State {
    kind?: 'single';
    /** Root of the node tree */
    root: MVSTree;
    /** Associated metadata */
    metadata: GlobalMetadata;
}
/** MVSData with multiple states (snapshots) */
export interface MVSData_States {
    kind: 'multiple';
    /** Ordered collection of individual states */
    snapshots: Snapshot[];
    /** Associated metadata */
    metadata: GlobalMetadata;
}
/** Top level of the MolViewSpec (MVS) data format. */
export type MVSData = MVSData_State | MVSData_States;
export declare const MVSData: {
    /** Currently supported major version of MolViewSpec format (e.g. 1 for version '1.0.8') */
    SupportedVersion: number;
    /** Parse MVSJ (MolViewSpec-JSON) format to `MVSData`. Does not include any validation. */
    fromMVSJ(mvsjString: string): MVSData;
    /** Encode `MVSData` to MVSJ (MolViewSpec-JSON) string. Use `space` parameter to control formatting (as with `JSON.stringify`). */
    toMVSJ(mvsData: MVSData, space?: string | number): string;
    /** Validate `MVSData`. Return `true` if OK; `false` if not OK.
     * If `options.noExtra` is true, presence of any extra node parameters is treated as an issue. */
    isValid(mvsData: MVSData, options?: {
        noExtra?: boolean;
    }): boolean;
    /** Validate `MVSData`. Return `undefined` if OK; list of issues if not OK.
     * If `options.noExtra` is true, presence of any extra node parameters is treated as an issue. */
    validationIssues(mvsData: MVSData, options?: {
        noExtra?: boolean;
    }): string[] | undefined;
    /** Return a human-friendly textual representation of `mvsData`. */
    toPrettyString(mvsData: MVSData): string;
    /** Create a new MolViewSpec builder containing only a root node. Example of MVS builder usage:
     *
     * ```
     * const builder = MVSData.createBuilder();
     * builder.canvas({ background_color: 'white' });
     * const struct = builder.download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/1og2_updated.cif' }).parse({ format: 'mmcif' }).modelStructure();
     * struct.component().representation().color({ color: '#3050F8' });
     * console.log(MVSData.toPrettyString(builder.getState()));
     * ```
     */
    createBuilder(): Root;
    /** Create a multi-state MVS data from a list of snapshots. */
    createMultistate(snapshots: Snapshot[], metadata?: Pick<GlobalMetadata, "title" | "description" | "description_format">): MVSData_States;
};
