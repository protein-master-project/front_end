/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { treeValidationIssues } from './tree/generic/tree-schema';
import { treeToString } from './tree/generic/tree-utils';
import { createMVSBuilder } from './tree/mvs/mvs-builder';
import { MVSTreeSchema } from './tree/mvs/mvs-tree';
export const GlobalMetadata = {
    create(metadata) {
        return {
            ...metadata,
            version: `${MVSData.SupportedVersion}`,
            timestamp: utcNowISO(),
        };
    },
};
export const MVSData = {
    /** Currently supported major version of MolViewSpec format (e.g. 1 for version '1.0.8') */
    SupportedVersion: 1,
    /** Parse MVSJ (MolViewSpec-JSON) format to `MVSData`. Does not include any validation. */
    fromMVSJ(mvsjString) {
        var _a, _b;
        const result = JSON.parse(mvsjString);
        const major = majorVersion((_a = result === null || result === void 0 ? void 0 : result.metadata) === null || _a === void 0 ? void 0 : _a.version);
        if (major === undefined) {
            console.error('Loaded MVS does not contain valid version info.');
        }
        else if (major > ((_b = majorVersion(MVSData.SupportedVersion)) !== null && _b !== void 0 ? _b : 0)) {
            console.warn(`Loaded MVS is of higher version (${result.metadata.version}) than currently supported version (${MVSData.SupportedVersion}). Some features may not work as expected.`);
        }
        return result;
    },
    /** Encode `MVSData` to MVSJ (MolViewSpec-JSON) string. Use `space` parameter to control formatting (as with `JSON.stringify`). */
    toMVSJ(mvsData, space) {
        return JSON.stringify(mvsData, undefined, space);
    },
    /** Validate `MVSData`. Return `true` if OK; `false` if not OK.
     * If `options.noExtra` is true, presence of any extra node parameters is treated as an issue. */
    isValid(mvsData, options = {}) {
        return MVSData.validationIssues(mvsData, options) === undefined;
    },
    /** Validate `MVSData`. Return `undefined` if OK; list of issues if not OK.
     * If `options.noExtra` is true, presence of any extra node parameters is treated as an issue. */
    validationIssues(mvsData, options = {}) {
        var _a;
        const version = (_a = mvsData === null || mvsData === void 0 ? void 0 : mvsData.metadata) === null || _a === void 0 ? void 0 : _a.version;
        if (typeof version !== 'string')
            return [`MVSData.metadata.version must be a string, not ${typeof version}: ${version}`];
        if (mvsData.kind === 'single' || mvsData.kind === undefined) {
            return snapshotValidationIssues(mvsData, options);
        }
        else if (mvsData.kind === 'multiple') {
            if (mvsData.snapshots === undefined)
                return [`"snapshots" missing in MVS`];
            const issues = [];
            for (const snapshot of mvsData.snapshots) { // would use .flatMap if it didn't work in a completely unpredictable way
                const snapshotIssues = snapshotValidationIssues(snapshot, options);
                if (snapshotIssues)
                    issues.push(...snapshotIssues);
            }
            if (issues.length > 0)
                return issues;
            else
                return undefined;
        }
        else {
            return [`MVSData.kind must be 'single' or 'multiple', not ${mvsData.kind}`];
        }
    },
    /** Return a human-friendly textual representation of `mvsData`. */
    toPrettyString(mvsData) {
        const type = mvsData.kind === 'multiple' ? 'multiple states' : 'single state';
        const title = mvsData.metadata.title !== undefined ? ` "${mvsData.metadata.title}"` : '';
        const trees = mvsData.kind === 'multiple' ?
            mvsData.snapshots.map((s, i) => `[Snapshot #${i}]\n${treeToString(s.root)}`).join('\n')
            : treeToString(mvsData.root);
        return `MolViewSpec ${type}${title} (version ${mvsData.metadata.version}, created ${mvsData.metadata.timestamp}):\n${trees}`;
    },
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
    createBuilder() {
        return createMVSBuilder();
    },
    /** Create a multi-state MVS data from a list of snapshots. */
    createMultistate(snapshots, metadata) {
        return {
            kind: 'multiple',
            snapshots: [...snapshots],
            metadata: GlobalMetadata.create(metadata),
        };
    },
};
/** Get the major version from a semantic version string, e.g. '1.0.8' -> 1 */
function majorVersion(semanticVersion) {
    if (typeof semanticVersion === 'string')
        return parseInt(semanticVersion.split('.')[0]);
    if (typeof semanticVersion === 'number')
        return Math.floor(semanticVersion);
    console.error(`Version should be a string, not ${typeof semanticVersion}: ${semanticVersion}`);
    return undefined;
}
function snapshotValidationIssues(snapshot, options = {}) {
    if (snapshot.root === undefined)
        return [`"root" missing in snapshot`];
    return treeValidationIssues(MVSTreeSchema, snapshot.root, options);
}
/** Return the current universal time, in ISO format, e.g. '2023-11-24T10:45:49.873Z' */
function utcNowISO() {
    return new Date().toISOString();
}
