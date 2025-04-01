/**
 * Copyright (c) 2020-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Image } from '../../mol-geo/geometry/image/image';
import { ThemeRegistryContext, Theme } from '../../mol-theme/theme';
import { Volume } from '../../mol-model/volume';
import { VolumeVisual, VolumeRepresentation, VolumeRepresentationProvider } from './representation';
import { RepresentationContext, RepresentationParamsGetter } from '../representation';
import { VisualContext } from '../visual';
import { Vec3 } from '../../mol-math/linear-algebra/3d/vec3';
export declare const SliceParams: {
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    dimension: PD.Mapped<PD.NamedParams<number, "x"> | PD.NamedParams<number, "y"> | PD.NamedParams<number, "z">>;
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    mode: PD.Select<"grid" | "frame">;
    offset: PD.Numeric;
    axis: PD.Select<"a" | "b" | "c">;
    rotation: PD.Group<PD.Normalize<{
        axis: Vec3;
        angle: number;
    }>>;
    interpolation: PD.Select<"nearest" | "catmulrom" | "mitchell" | "bspline">;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
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
export type SliceParams = typeof SliceParams;
export type SliceProps = PD.Values<SliceParams>;
export declare function getSliceParams(ctx: ThemeRegistryContext, volume: Volume): {
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    dimension: PD.Mapped<PD.NamedParams<number, "x"> | PD.NamedParams<number, "y"> | PD.NamedParams<number, "z">>;
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    mode: PD.Select<"grid" | "frame">;
    offset: PD.Numeric;
    axis: PD.Select<"a" | "b" | "c">;
    rotation: PD.Group<PD.Normalize<{
        axis: Vec3;
        angle: number;
    }>>;
    interpolation: PD.Select<"nearest" | "catmulrom" | "mitchell" | "bspline">;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
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
export declare function createImage(ctx: VisualContext, volume: Volume, key: number, theme: Theme, props: SliceProps, image?: Image): Promise<Image>;
export declare function SliceVisual(materialId: number): VolumeVisual<SliceParams>;
export declare function SliceRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<Volume, SliceParams>): VolumeRepresentation<SliceParams>;
export declare const SliceRepresentationProvider: VolumeRepresentationProvider<{
    quality: {
        isEssential: boolean;
        type: "select";
        options: readonly (readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string] | readonly ["auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest", string, string | undefined])[];
        cycle?: boolean;
        isOptional?: boolean;
        defaultValue: "auto" | "medium" | "high" | "low" | "custom" | "highest" | "higher" | "lower" | "lowest";
        label?: string;
        description?: string;
        legend?: import("../../mol-util/legend").Legend;
        fieldLabels?: {
            [name: string]: string;
        };
        isHidden?: boolean;
        shortLabel?: boolean;
        twoColumns?: boolean;
        category?: string;
        hideIf?: (currentGroup: any) => boolean;
        help?: (value: any) => {
            description?: string;
            legend?: import("../../mol-util/legend").Legend;
        };
    };
    dimension: PD.Mapped<PD.NamedParams<number, "x"> | PD.NamedParams<number, "y"> | PD.NamedParams<number, "z">>;
    isoValue: PD.Conditioned<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>, PD.Base<Readonly<{
        kind: "absolute";
        absoluteValue: number;
    }> | Readonly<{
        kind: "relative";
        relativeValue: number;
    }>>, {
        absolute: PD.Converted<Readonly<{
            kind: "absolute";
            absoluteValue: number;
        }>, number>;
        relative: PD.Converted<Readonly<{
            kind: "relative";
            relativeValue: number;
        }>, number>;
    }>;
    mode: PD.Select<"grid" | "frame">;
    offset: PD.Numeric;
    axis: PD.Select<"a" | "b" | "c">;
    rotation: PD.Group<PD.Normalize<{
        axis: Vec3;
        angle: number;
    }>>;
    interpolation: PD.Select<"nearest" | "catmulrom" | "mitchell" | "bspline">;
    alpha: PD.Numeric;
    material: PD.Group<PD.Normalize<{
        metalness: number;
        roughness: number;
        bumpiness: number;
    }>>;
    clip: PD.Group<PD.Normalize<{
        variant: import("../../mol-util/clip").Clip.Variant;
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
}, "slice">;
