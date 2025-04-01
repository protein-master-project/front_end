/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StructureRepresentation, StructureRepresentationProvider } from '../representation';
import { RepresentationParamsGetter, RepresentationContext } from '../../representation';
import { ThemeRegistryContext } from '../../../mol-theme/theme';
import { Structure } from '../../../mol-model/structure';
export declare const PlaneParams: {
    visuals: PD.MultiSelect<"plane-image">;
    interpolation: PD.Select<"nearest" | "catmulrom" | "mitchell" | "bspline">;
    imageResolution: PD.Numeric;
    offset: PD.Numeric;
    axis: PD.Select<"a" | "b" | "c">;
    margin: PD.Numeric;
    frame: PD.Select<"principalAxes" | "boundingBox">;
    extent: PD.Select<"frame" | "sphere">;
    rotation: PD.Group<PD.Normalize<{
        axis: import("../../../mol-math/linear-algebra").Vec3;
        angle: number;
    }>>;
    antialias: PD.BooleanParam;
    cutout: PD.BooleanParam;
    defaultColor: PD.Color;
    includeParent: PD.BooleanParam;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
};
export type PlaneParams = typeof PlaneParams;
export declare function getPlaneParams(ctx: ThemeRegistryContext, structure: Structure): {
    visuals: PD.MultiSelect<"plane-image">;
    interpolation: PD.Select<"nearest" | "catmulrom" | "mitchell" | "bspline">;
    imageResolution: PD.Numeric;
    offset: PD.Numeric;
    axis: PD.Select<"a" | "b" | "c">;
    margin: PD.Numeric;
    frame: PD.Select<"principalAxes" | "boundingBox">;
    extent: PD.Select<"frame" | "sphere">;
    rotation: PD.Group<PD.Normalize<{
        axis: import("../../../mol-math/linear-algebra").Vec3;
        angle: number;
    }>>;
    antialias: PD.BooleanParam;
    cutout: PD.BooleanParam;
    defaultColor: PD.Color;
    includeParent: PD.BooleanParam;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
};
export type PlaneRepresentation = StructureRepresentation<PlaneParams>;
export declare function PlaneRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Structure, PlaneParams>): PlaneRepresentation;
export declare const PlaneRepresentationProvider: StructureRepresentationProvider<{
    visuals: PD.MultiSelect<"plane-image">;
    interpolation: PD.Select<"nearest" | "catmulrom" | "mitchell" | "bspline">;
    imageResolution: PD.Numeric;
    offset: PD.Numeric;
    axis: PD.Select<"a" | "b" | "c">;
    margin: PD.Numeric;
    frame: PD.Select<"principalAxes" | "boundingBox">;
    extent: PD.Select<"frame" | "sphere">;
    rotation: PD.Group<PD.Normalize<{
        axis: import("../../../mol-math/linear-algebra").Vec3;
        angle: number;
    }>>;
    antialias: PD.BooleanParam;
    cutout: PD.BooleanParam;
    defaultColor: PD.Color;
    includeParent: PD.BooleanParam;
    unitKinds: PD.MultiSelect<"spheres" | "gaussians" | "atomic">;
    alpha: PD.Numeric;
    quality: PD.Select<"auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest">;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../../mol-util/clip").Clip.Variant;
        objects: PD.Normalize<{
            type: /*elided*/ any;
            invert: /*elided*/ any;
            position: /*elided*/ any;
            rotation: /*elided*/ any;
            scale: /*elided*/ any;
            transform: /*elided*/ any;
        }>[];
    }>>;
    emissive: PD.Numeric;
    density: PD.Numeric;
    instanceGranularity: PD.BooleanParam;
    lod: PD.Vec3;
    cellSize: PD.Numeric;
    batchSize: PD.Numeric;
}, "plane">;
