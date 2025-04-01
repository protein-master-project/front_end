/**
 * Copyright (c) 2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { VisualContext } from '../../visual';
import { Structure } from '../../../mol-model/structure';
import { Theme } from '../../../mol-theme/theme';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { ComplexVisual } from '../complex-visual';
import { Image } from '../../../mol-geo/geometry/image/image';
import { Color } from '../../../mol-util/color/color';
export declare const PlaneImageParams: {
    interpolation: PD.Select<"nearest" | "catmulrom" | "mitchell" | "bspline">;
    imageResolution: PD.Numeric;
    offset: PD.Numeric;
    axis: PD.Select<"a" | "b" | "c">;
    margin: PD.Numeric;
    frame: PD.Select<"principalAxes" | "boundingBox">;
    extent: PD.Select<"frame" | "sphere">;
    rotation: PD.Group<PD.Normalize<{
        axis: Vec3;
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
export type PlaneImageParams = typeof PlaneImageParams;
export declare function PlaneImageVisual(materialId: number): ComplexVisual<PlaneImageParams>;
export interface PlaneImageProps {
    imageResolution: number;
    offset: number;
    axis: 'a' | 'b' | 'c';
    margin: number;
    frame: 'principalAxes' | 'boundingBox';
    extent: 'frame' | 'sphere';
    rotation: {
        axis: Vec3;
        angle: number;
    };
    antialias: boolean;
    cutout: boolean;
    defaultColor: Color;
    includeParent: boolean;
}
export declare function createPlaneImage(ctx: VisualContext, structure: Structure, theme: Theme, props: PlaneImageProps, image?: Image): Image;
