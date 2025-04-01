/**
 * Copyright (c) 2023-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Aliaksei Chareshneu <chareshneu.tech@gmail.com>
 */
import { PluginStateSnapshotManager } from '../../mol-plugin-state/manager/snapshots';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { Download, ParseCcp4, ParseCif } from '../../mol-plugin-state/transforms/data';
import { CustomModelProperties, CustomStructureProperties, ModelFromTrajectory, StructureComponent, StructureFromModel, TrajectoryFromMmCif, TrajectoryFromPDB, TransformStructureConformation } from '../../mol-plugin-state/transforms/model';
import { ShapeRepresentation3D, StructureRepresentation3D, VolumeRepresentation3D } from '../../mol-plugin-state/transforms/representation';
import { VolumeFromCcp4, VolumeFromDensityServerCif } from '../../mol-plugin-state/transforms/volume';
import { PluginCommands } from '../../mol-plugin/commands';
import { MolViewSpec } from './behavior';
import { createPluginStateSnapshotCamera, modifyCanvasProps, setCamera, setCanvas, setFocus, suppressCameraAutoreset } from './camera';
import { MVSAnnotationsProvider } from './components/annotation-prop';
import { MVSAnnotationStructureComponent } from './components/annotation-structure-component';
import { MVSAnnotationTooltipsProvider } from './components/annotation-tooltips-prop';
import { CustomLabelRepresentationProvider } from './components/custom-label/representation';
import { CustomTooltipsProvider } from './components/custom-tooltips-prop';
import { IsMVSModelProvider } from './components/is-mvs-model-prop';
import { getPrimitiveStructureRefs, MVSBuildPrimitiveShape, MVSDownloadPrimitiveData, MVSInlinePrimitiveData } from './components/primitives';
import { NonCovalentInteractionsExtension } from './load-extensions/non-covalent-interactions';
import { loadTree, loadTreeVirtual, UpdateTarget } from './load-generic';
import { collectAnnotationReferences, collectAnnotationTooltips, collectInlineLabels, collectInlineTooltips, colorThemeForNode, componentFromXProps, componentPropsFromSelector, isPhantomComponent, labelFromXProps, makeNearestReprMap, prettyNameFromSelector, representationProps, structureProps, transformProps, volumeColorThemeForNode, volumeRepresentationProps } from './load-helpers';
import { validateTree } from './tree/generic/tree-schema';
import { convertMvsToMolstar, mvsSanityCheck } from './tree/molstar/conversion';
import { MolstarTreeSchema } from './tree/molstar/molstar-tree';
import { MVSTreeSchema } from './tree/mvs/mvs-tree';
/** Load a MolViewSpec (MVS) tree into the Mol* plugin.
 * If `options.replaceExisting`, remove all objects in the current Mol* state; otherwise add to the current state.
 * If `options.keepCamera`, ignore any camera positioning from the MVS state and keep the current camera position instead.
 * If `options.keepSnapshotCamera`, ignore any camera positioning when generating snapshots.
 * If `options.sanityChecks`, run some sanity checks and print potential issues to the console.
 * If `options.extensions` is provided, apply specified set of MVS-loading extensions (not a part of standard MVS specification); default: apply all builtin extensions; use `extensions: []` to avoid applying builtin extensions.
 * `options.sourceUrl` serves as the base for resolving relative URLs/URIs and may itself be relative to the window URL. */
export async function loadMVS(plugin, data, options = {}) {
    plugin.errorContext.clear('mvs');
    try {
        const mvsExtensionLoaded = plugin.state.hasBehavior(MolViewSpec);
        if (!mvsExtensionLoaded)
            throw new Error('MolViewSpec extension is not loaded.');
        // console.log(`MVS tree:\n${MVSData.toPrettyString(data)}`)
        if (data.kind === 'multiple') {
            const entries = [];
            for (let i = 0; i < data.snapshots.length; i++) {
                const snapshot = data.snapshots[i];
                const previousSnapshot = i > 0 ? data.snapshots[i - 1] : data.snapshots[data.snapshots.length - 1];
                validateTree(MVSTreeSchema, snapshot.root, 'MVS');
                if (options.sanityChecks)
                    mvsSanityCheck(snapshot.root);
                const molstarTree = convertMvsToMolstar(snapshot.root, options.sourceUrl);
                validateTree(MolstarTreeSchema, molstarTree, 'Converted Molstar');
                const entry = molstarTreeToEntry(plugin, molstarTree, { ...snapshot.metadata, previousTransitionDurationMs: previousSnapshot.metadata.transition_duration_ms }, options);
                entries.push(entry);
            }
            plugin.managers.snapshot.clear();
            for (const entry of entries) {
                plugin.managers.snapshot.add(entry);
            }
            if (entries.length > 0) {
                await PluginCommands.State.Snapshots.Apply(plugin, { id: entries[0].snapshot.id });
            }
        }
        else {
            validateTree(MVSTreeSchema, data.root, 'MVS');
            if (options.sanityChecks)
                mvsSanityCheck(data.root);
            const molstarTree = convertMvsToMolstar(data.root, options.sourceUrl);
            // console.log(`Converted MolStar tree:\n${MVSData.toPrettyString({ root: molstarTree, metadata: { version: 'x', timestamp: 'x' } })}`)
            validateTree(MolstarTreeSchema, molstarTree, 'Converted Molstar');
            await loadMolstarTree(plugin, molstarTree, options);
        }
    }
    catch (err) {
        plugin.log.error(`${err}`);
        throw err;
    }
    finally {
        if (!options.doNotReportErrors) {
            for (const error of plugin.errorContext.get('mvs')) {
                plugin.log.warn(error);
                PluginCommands.Toast.Show(plugin, {
                    title: 'Error',
                    message: error,
                    timeoutMs: 10000
                });
            }
        }
        plugin.errorContext.clear('mvs');
    }
}
/** Load a `MolstarTree` into the Mol* plugin.
 * If `replaceExisting`, remove all objects in the current Mol* state; otherwise add to the current state. */
async function loadMolstarTree(plugin, tree, options) {
    var _a;
    const mvsExtensionLoaded = plugin.state.hasBehavior(MolViewSpec);
    if (!mvsExtensionLoaded)
        throw new Error('MolViewSpec extension is not loaded.');
    const context = MolstarLoadingContext.create();
    await loadTree(plugin, tree, MolstarLoadingActions, context, { ...options, extensions: (_a = options === null || options === void 0 ? void 0 : options.extensions) !== null && _a !== void 0 ? _a : BuiltinLoadingExtensions });
    setCanvas(plugin, context.canvas);
    if (options === null || options === void 0 ? void 0 : options.keepCamera) {
        await suppressCameraAutoreset(plugin);
    }
    else {
        if (context.camera.cameraParams !== undefined) {
            await setCamera(plugin, context.camera.cameraParams);
        }
        else {
            await setFocus(plugin, context.camera.focuses); // This includes implicit camera (i.e. no 'camera' or 'focus' nodes)
        }
    }
}
function molstarTreeToEntry(plugin, tree, metadata, options) {
    var _a, _b;
    const context = MolstarLoadingContext.create();
    const snapshot = loadTreeVirtual(plugin, tree, MolstarLoadingActions, context, options);
    snapshot.canvas3d = {
        props: plugin.canvas3d ? modifyCanvasProps(plugin.canvas3d.props, context.canvas) : undefined,
    };
    if (!(options === null || options === void 0 ? void 0 : options.keepSnapshotCamera)) {
        snapshot.camera = createPluginStateSnapshotCamera(plugin, context, metadata);
    }
    snapshot.durationInMs = metadata.linger_duration_ms + ((_a = metadata.previousTransitionDurationMs) !== null && _a !== void 0 ? _a : 0);
    const entryParams = {
        key: metadata.key,
        name: metadata.title,
        description: metadata.description,
        descriptionFormat: (_b = metadata.description_format) !== null && _b !== void 0 ? _b : 'markdown',
    };
    const entry = PluginStateSnapshotManager.Entry(snapshot, entryParams);
    return entry;
}
export const MolstarLoadingContext = {
    create() {
        return {
            annotationMap: new Map(),
            camera: { focuses: [] },
        };
    },
};
/** Loading actions for loading a `MolstarTree`, per node kind. */
const MolstarLoadingActions = {
    root(updateParent, node, context) {
        context.nearestReprMap = makeNearestReprMap(node);
        return updateParent;
    },
    download(updateParent, node) {
        return UpdateTarget.apply(updateParent, Download, {
            url: node.params.url,
            isBinary: node.params.is_binary,
        });
    },
    parse(updateParent, node) {
        const format = node.params.format;
        if (format === 'cif') {
            return UpdateTarget.apply(updateParent, ParseCif, {});
        }
        else if (format === 'pdb') {
            return updateParent;
        }
        else if (format === 'map') {
            return UpdateTarget.apply(updateParent, ParseCcp4, {});
        }
        else {
            console.error(`Unknown format in "parse" node: "${format}"`);
            return undefined;
        }
    },
    trajectory(updateParent, node) {
        var _a, _b;
        const format = node.params.format;
        if (format === 'cif') {
            return UpdateTarget.apply(updateParent, TrajectoryFromMmCif, {
                blockHeader: (_a = node.params.block_header) !== null && _a !== void 0 ? _a : '', // Must set to '' because just undefined would get overwritten by createDefaults
                blockIndex: (_b = node.params.block_index) !== null && _b !== void 0 ? _b : undefined,
            });
        }
        else if (format === 'pdb') {
            return UpdateTarget.apply(updateParent, TrajectoryFromPDB, {});
        }
        else {
            console.error(`Unknown format in "trajectory" node: "${format}"`);
            return undefined;
        }
    },
    model(updateParent, node, context) {
        const annotations = collectAnnotationReferences(node, context);
        const model = UpdateTarget.apply(updateParent, ModelFromTrajectory, {
            modelIndex: node.params.model_index,
        });
        UpdateTarget.apply(model, CustomModelProperties, {
            properties: {
                [IsMVSModelProvider.descriptor.name]: { isMvs: true },
                [MVSAnnotationsProvider.descriptor.name]: { annotations },
            },
            autoAttach: [
                IsMVSModelProvider.descriptor.name,
                MVSAnnotationsProvider.descriptor.name,
            ],
        });
        return model;
    },
    structure(updateParent, node, context) {
        var _a;
        const props = structureProps(node);
        const struct = UpdateTarget.apply(updateParent, StructureFromModel, props);
        let transformed = struct;
        for (const t of transformProps(node)) {
            transformed = UpdateTarget.apply(transformed, TransformStructureConformation, t); // applying to the result of previous transform, to get the correct transform order
        }
        const annotationTooltips = collectAnnotationTooltips(node, context);
        const inlineTooltips = collectInlineTooltips(node, context);
        if (annotationTooltips.length + inlineTooltips.length > 0) {
            UpdateTarget.apply(struct, CustomStructureProperties, {
                properties: {
                    [MVSAnnotationTooltipsProvider.descriptor.name]: { tooltips: annotationTooltips },
                    [CustomTooltipsProvider.descriptor.name]: { tooltips: inlineTooltips },
                },
                autoAttach: [
                    MVSAnnotationTooltipsProvider.descriptor.name,
                    CustomTooltipsProvider.descriptor.name,
                ],
            });
        }
        const inlineLabels = collectInlineLabels(node, context);
        if (inlineLabels.length > 0) {
            const nearestReprNode = (_a = context.nearestReprMap) === null || _a === void 0 ? void 0 : _a.get(node);
            UpdateTarget.apply(struct, StructureRepresentation3D, {
                type: {
                    name: CustomLabelRepresentationProvider.name,
                    params: { items: inlineLabels },
                },
                colorTheme: colorThemeForNode(nearestReprNode, context),
            });
        }
        return struct;
    },
    tooltip: undefined, // No action needed, already loaded in `structure`
    tooltip_from_uri: undefined, // No action needed, already loaded in `structure`
    tooltip_from_source: undefined, // No action needed, already loaded in `structure`
    component(updateParent, node) {
        if (isPhantomComponent(node)) {
            return updateParent;
        }
        const selector = node.params.selector;
        return UpdateTarget.apply(updateParent, StructureComponent, {
            type: componentPropsFromSelector(selector),
            label: prettyNameFromSelector(selector),
            nullIfEmpty: false,
        });
    },
    component_from_uri(updateParent, node, context) {
        if (isPhantomComponent(node))
            return undefined;
        const props = componentFromXProps(node, context);
        return UpdateTarget.apply(updateParent, MVSAnnotationStructureComponent, props);
    },
    component_from_source(updateParent, node, context) {
        if (isPhantomComponent(node))
            return undefined;
        const props = componentFromXProps(node, context);
        return UpdateTarget.apply(updateParent, MVSAnnotationStructureComponent, props);
    },
    representation(updateParent, node, context) {
        return UpdateTarget.apply(updateParent, StructureRepresentation3D, {
            ...representationProps(node),
            colorTheme: colorThemeForNode(node, context),
        });
    },
    volume(updateParent, node) {
        var _a, _b;
        if ((_a = updateParent.transformer) === null || _a === void 0 ? void 0 : _a.definition.to.includes(PluginStateObject.Format.Ccp4)) {
            return UpdateTarget.apply(updateParent, VolumeFromCcp4, {});
        }
        else if ((_b = updateParent.transformer) === null || _b === void 0 ? void 0 : _b.definition.to.includes(PluginStateObject.Format.Cif)) {
            return UpdateTarget.apply(updateParent, VolumeFromDensityServerCif, { blockHeader: node.params.channel_id || undefined });
        }
        else {
            console.error(`Unsupported volume format`);
            return undefined;
        }
    },
    volume_representation(updateParent, node, context) {
        return UpdateTarget.apply(updateParent, VolumeRepresentation3D, {
            ...volumeRepresentationProps(node),
            colorTheme: volumeColorThemeForNode(node, context),
        });
    },
    color: undefined, // No action needed, already loaded in `representation`
    color_from_uri: undefined, // No action needed, already loaded in `representation`
    color_from_source: undefined, // No action needed, already loaded in `representation`
    label: undefined, // No action needed, already loaded in `structure`
    label_from_uri(updateParent, node, context) {
        const props = labelFromXProps(node, context);
        return UpdateTarget.apply(updateParent, StructureRepresentation3D, props);
    },
    label_from_source(updateParent, node, context) {
        const props = labelFromXProps(node, context);
        return UpdateTarget.apply(updateParent, StructureRepresentation3D, props);
    },
    focus(updateParent, node, context) {
        context.camera.focuses.push({ target: updateParent.selector, params: node.params });
        return updateParent;
    },
    camera(updateParent, node, context) {
        context.camera.cameraParams = node.params;
        return updateParent;
    },
    canvas(updateParent, node, context) {
        context.canvas = node.params;
        return updateParent;
    },
    primitives(updateParent, tree, context) {
        const refs = getPrimitiveStructureRefs(tree);
        const data = UpdateTarget.apply(updateParent, MVSInlinePrimitiveData, { node: tree });
        return applyPrimitiveVisuals(data, refs);
    },
    primitives_from_uri(updateParent, tree, context) {
        const data = UpdateTarget.apply(updateParent, MVSDownloadPrimitiveData, { uri: tree.params.uri, format: tree.params.format });
        return applyPrimitiveVisuals(data, new Set(tree.params.references));
    },
};
function applyPrimitiveVisuals(data, refs) {
    const mesh = UpdateTarget.setMvsDependencies(UpdateTarget.apply(data, MVSBuildPrimitiveShape, { kind: 'mesh' }, { state: { isGhost: true } }), refs);
    UpdateTarget.apply(mesh, ShapeRepresentation3D);
    const labels = UpdateTarget.setMvsDependencies(UpdateTarget.apply(data, MVSBuildPrimitiveShape, { kind: 'labels' }, { state: { isGhost: true } }), refs);
    UpdateTarget.apply(labels, ShapeRepresentation3D);
    const lines = UpdateTarget.setMvsDependencies(UpdateTarget.apply(data, MVSBuildPrimitiveShape, { kind: 'lines' }, { state: { isGhost: true } }), refs);
    UpdateTarget.apply(lines, ShapeRepresentation3D);
    return data;
}
export const BuiltinLoadingExtensions = [
    NonCovalentInteractionsExtension,
];
