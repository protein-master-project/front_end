/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Herman Bergwerf <post@hbergwerf.nl>
 */
import { BehaviorSubject } from 'rxjs';
import { now } from '../mol-util/now';
import { Vec3, Vec2 } from '../mol-math/linear-algebra';
import { InputObserver, ModifiersKeys, ButtonsType } from '../mol-util/input/input-observer';
import { RendererStats } from '../mol-gl/renderer';
import { GraphicsRenderObject } from '../mol-gl/render-object';
import { WebGLContext } from '../mol-gl/webgl/context';
import { Representation } from '../mol-repr/representation';
import { PickingId } from '../mol-geo/geometry/picking';
import { MarkerAction } from '../mol-util/marker-action';
import { Camera } from './camera';
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { Canvas3dInteractionHelper } from './helper/interaction-events';
import { PickData } from './passes/pick';
import { ImagePass, ImageProps } from './passes/image';
import { Sphere3D } from '../mol-math/geometry';
import { Passes } from './passes/passes';
import { AssetManager } from '../mol-util/assets';
export declare const Canvas3DParams: {
    camera: PD.Group<PD.Normalize<{
        mode: "perspective" | "orthographic";
        helper: PD.Normalize<{
            axes: /*elided*/ any;
        }>;
        stereo: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            eyeSeparation: /*elided*/ any;
            focus: /*elided*/ any;
        }>, "on">;
        fov: number;
        manualReset: boolean;
    }>>;
    cameraFog: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        intensity: number;
    }>, "on">>;
    cameraClipping: PD.Group<PD.Normalize<{
        radius: number;
        far: boolean;
        minNear: number;
    }>>;
    viewport: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "canvas"> | PD.NamedParams<PD.Normalize<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>, "static-frame"> | PD.NamedParams<PD.Normalize<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>, "relative-frame">>;
    cameraResetDurationMs: PD.Numeric;
    sceneRadiusFactor: PD.Numeric;
    transparentBackground: PD.BooleanParam;
    dpoitIterations: PD.Numeric;
    pickPadding: PD.Numeric;
    userInteractionReleaseMs: PD.Numeric;
    multiSample: PD.Group<PD.Normalize<{
        mode: string;
        sampleLevel: number;
        reduceFlicker: boolean;
        reuseOcclusion: boolean;
    }>>;
    postprocessing: PD.Group<PD.Normalize<{
        occlusion: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            samples: /*elided*/ any;
            multiScale: /*elided*/ any;
            radius: /*elided*/ any;
            bias: /*elided*/ any;
            blurKernelSize: /*elided*/ any;
            blurDepthBias: /*elided*/ any;
            resolutionScale: /*elided*/ any;
            color: /*elided*/ any;
            transparentThreshold: /*elided*/ any;
        }>, "on">;
        shadow: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            steps: /*elided*/ any;
            maxDistance: /*elided*/ any;
            tolerance: /*elided*/ any;
        }>, "on">;
        outline: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            scale: /*elided*/ any;
            threshold: /*elided*/ any;
            color: /*elided*/ any;
            includeTransparent: /*elided*/ any;
        }>, "on">;
        dof: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            blurSize: /*elided*/ any;
            blurSpread: /*elided*/ any;
            inFocus: /*elided*/ any;
            PPM: /*elided*/ any;
            center: /*elided*/ any;
            mode: /*elided*/ any;
        }>, "on">;
        antialiasing: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            edgeThreshold: /*elided*/ any;
            maxSearchSteps: /*elided*/ any;
        }>, "smaa"> | PD.NamedParams<PD.Normalize<{
            edgeThresholdMin: /*elided*/ any;
            edgeThresholdMax: /*elided*/ any;
            iterations: /*elided*/ any;
            subpixelQuality: /*elided*/ any;
        }>, "fxaa">;
        sharpening: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            sharpness: /*elided*/ any;
            denoise: /*elided*/ any;
        }>, "on">;
        background: PD.Normalize<{
            variant: /*elided*/ any;
        }>;
        bloom: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            strength: /*elided*/ any;
            radius: /*elided*/ any;
            threshold: /*elided*/ any;
            mode: /*elided*/ any;
        }>, "on">;
    }>>;
    marking: PD.Group<PD.Normalize<{
        enabled: boolean;
        highlightEdgeColor: import("../mol-util/color").Color;
        selectEdgeColor: import("../mol-util/color").Color;
        edgeScale: number;
        highlightEdgeStrength: number;
        selectEdgeStrength: number;
        ghostEdgeStrength: number;
        innerEdgeFactor: number;
    }>>;
    illumination: PD.Group<PD.Normalize<{
        rendersPerFrame: [number, number];
        targetFps: number;
        steps: number;
        firstStepSize: number;
        refineSteps: number;
        rayDistance: number;
        thicknessMode: "auto" | "fixed";
        minThickness: number;
        thicknessFactor: number;
        thickness: number;
        bounces: number;
        glow: boolean;
        shadowEnable: boolean;
        shadowSoftness: number;
        shadowThickness: number;
        enabled: boolean;
        maxIterations: number;
        denoise: boolean;
        denoiseThreshold: [number, number];
        ignoreOutline: boolean;
    }>>;
    hiZ: PD.Group<PD.Normalize<{
        enabled: boolean;
        maxFrameLag: number;
        minLevel: number;
    }>>;
    renderer: PD.Group<PD.Normalize<{
        backgroundColor: import("../mol-util/color").Color;
        pickingAlphaThreshold: number;
        interiorDarkening: number;
        interiorColorFlag: boolean;
        interiorColor: import("../mol-util/color").Color;
        colorMarker: boolean;
        highlightColor: import("../mol-util/color").Color;
        selectColor: import("../mol-util/color").Color;
        dimColor: import("../mol-util/color").Color;
        highlightStrength: number;
        selectStrength: number;
        dimStrength: number;
        markerPriority: number;
        xrayEdgeFalloff: number;
        celSteps: number;
        exposure: number;
        light: PD.Normalize<{
            inclination: number;
            azimuth: number;
            color: import("../mol-util/color").Color;
            intensity: number;
        }>[];
        ambientColor: import("../mol-util/color").Color;
        ambientIntensity: number;
    }>>;
    trackball: PD.Group<PD.Normalize<{
        noScroll: boolean;
        rotateSpeed: number;
        zoomSpeed: number;
        panSpeed: number;
        moveSpeed: number;
        boostMoveFactor: number;
        flyMode: boolean;
        animate: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            speed: /*elided*/ any;
        }>, "spin"> | PD.NamedParams<PD.Normalize<{
            speed: /*elided*/ any;
            angle: /*elided*/ any;
        }>, "rock">;
        staticMoving: boolean;
        dynamicDampingFactor: number;
        minDistance: number;
        maxDistance: number;
        gestureScaleFactor: number;
        maxWheelDelta: number;
        bindings: {
            dragRotate: import("../mol-util/binding").Binding;
            dragRotateZ: import("../mol-util/binding").Binding;
            dragPan: import("../mol-util/binding").Binding;
            dragZoom: import("../mol-util/binding").Binding;
            dragFocus: import("../mol-util/binding").Binding;
            dragFocusZoom: import("../mol-util/binding").Binding;
            scrollZoom: import("../mol-util/binding").Binding;
            scrollFocus: import("../mol-util/binding").Binding;
            scrollFocusZoom: import("../mol-util/binding").Binding;
            keyMoveForward: import("../mol-util/binding").Binding;
            keyMoveBack: import("../mol-util/binding").Binding;
            keyMoveLeft: import("../mol-util/binding").Binding;
            keyMoveRight: import("../mol-util/binding").Binding;
            keyMoveUp: import("../mol-util/binding").Binding;
            keyMoveDown: import("../mol-util/binding").Binding;
            keyRollLeft: import("../mol-util/binding").Binding;
            keyRollRight: import("../mol-util/binding").Binding;
            keyPitchUp: import("../mol-util/binding").Binding;
            keyPitchDown: import("../mol-util/binding").Binding;
            keyYawLeft: import("../mol-util/binding").Binding;
            keyYawRight: import("../mol-util/binding").Binding;
            boostMove: import("../mol-util/binding").Binding;
            enablePointerLock: import("../mol-util/binding").Binding;
        };
        autoAdjustMinMaxDistance: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            minDistanceFactor: /*elided*/ any;
            minDistancePadding: /*elided*/ any;
            maxDistanceFactor: /*elided*/ any;
            maxDistanceMin: /*elided*/ any;
        }>, "on">;
    }>>;
    interaction: PD.Group<PD.Normalize<{
        maxFps: number;
        preferAtomPixelPadding: number;
    }>>;
    debug: PD.Group<PD.Normalize<{
        sceneBoundingSpheres: boolean;
        visibleSceneBoundingSpheres: boolean;
        objectBoundingSpheres: boolean;
        instanceBoundingSpheres: boolean;
    }>>;
    handle: PD.Group<PD.Normalize<{
        handle: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            alpha: /*elided*/ any;
            ignoreLight: /*elided*/ any;
            colorX: /*elided*/ any;
            colorY: /*elided*/ any;
            colorZ: /*elided*/ any;
            scale: /*elided*/ any;
            doubleSided: /*elided*/ any;
            flipSided: /*elided*/ any;
            flatShaded: /*elided*/ any;
            celShaded: /*elided*/ any;
            xrayShaded: /*elided*/ any;
            transparentBackfaces: /*elided*/ any;
            bumpFrequency: /*elided*/ any;
            bumpAmplitude: /*elided*/ any;
            quality: /*elided*/ any;
            material: /*elided*/ any;
            clip: /*elided*/ any;
            emissive: /*elided*/ any;
            density: /*elided*/ any;
            instanceGranularity: /*elided*/ any;
            lod: /*elided*/ any;
            cellSize: /*elided*/ any;
            batchSize: /*elided*/ any;
        }>, "on">;
    }>>;
};
export declare const DefaultCanvas3DParams: PD.Values<{
    camera: PD.Group<PD.Normalize<{
        mode: "perspective" | "orthographic";
        helper: PD.Normalize<{
            axes: /*elided*/ any;
        }>;
        stereo: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            eyeSeparation: /*elided*/ any;
            focus: /*elided*/ any;
        }>, "on">;
        fov: number;
        manualReset: boolean;
    }>>;
    cameraFog: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
        intensity: number;
    }>, "on">>;
    cameraClipping: PD.Group<PD.Normalize<{
        radius: number;
        far: boolean;
        minNear: number;
    }>>;
    viewport: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "canvas"> | PD.NamedParams<PD.Normalize<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>, "static-frame"> | PD.NamedParams<PD.Normalize<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>, "relative-frame">>;
    cameraResetDurationMs: PD.Numeric;
    sceneRadiusFactor: PD.Numeric;
    transparentBackground: PD.BooleanParam;
    dpoitIterations: PD.Numeric;
    pickPadding: PD.Numeric;
    userInteractionReleaseMs: PD.Numeric;
    multiSample: PD.Group<PD.Normalize<{
        mode: string;
        sampleLevel: number;
        reduceFlicker: boolean;
        reuseOcclusion: boolean;
    }>>;
    postprocessing: PD.Group<PD.Normalize<{
        occlusion: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            samples: /*elided*/ any;
            multiScale: /*elided*/ any;
            radius: /*elided*/ any;
            bias: /*elided*/ any;
            blurKernelSize: /*elided*/ any;
            blurDepthBias: /*elided*/ any;
            resolutionScale: /*elided*/ any;
            color: /*elided*/ any;
            transparentThreshold: /*elided*/ any;
        }>, "on">;
        shadow: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            steps: /*elided*/ any;
            maxDistance: /*elided*/ any;
            tolerance: /*elided*/ any;
        }>, "on">;
        outline: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            scale: /*elided*/ any;
            threshold: /*elided*/ any;
            color: /*elided*/ any;
            includeTransparent: /*elided*/ any;
        }>, "on">;
        dof: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            blurSize: /*elided*/ any;
            blurSpread: /*elided*/ any;
            inFocus: /*elided*/ any;
            PPM: /*elided*/ any;
            center: /*elided*/ any;
            mode: /*elided*/ any;
        }>, "on">;
        antialiasing: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            edgeThreshold: /*elided*/ any;
            maxSearchSteps: /*elided*/ any;
        }>, "smaa"> | PD.NamedParams<PD.Normalize<{
            edgeThresholdMin: /*elided*/ any;
            edgeThresholdMax: /*elided*/ any;
            iterations: /*elided*/ any;
            subpixelQuality: /*elided*/ any;
        }>, "fxaa">;
        sharpening: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            sharpness: /*elided*/ any;
            denoise: /*elided*/ any;
        }>, "on">;
        background: PD.Normalize<{
            variant: /*elided*/ any;
        }>;
        bloom: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            strength: /*elided*/ any;
            radius: /*elided*/ any;
            threshold: /*elided*/ any;
            mode: /*elided*/ any;
        }>, "on">;
    }>>;
    marking: PD.Group<PD.Normalize<{
        enabled: boolean;
        highlightEdgeColor: import("../mol-util/color").Color;
        selectEdgeColor: import("../mol-util/color").Color;
        edgeScale: number;
        highlightEdgeStrength: number;
        selectEdgeStrength: number;
        ghostEdgeStrength: number;
        innerEdgeFactor: number;
    }>>;
    illumination: PD.Group<PD.Normalize<{
        rendersPerFrame: [number, number];
        targetFps: number;
        steps: number;
        firstStepSize: number;
        refineSteps: number;
        rayDistance: number;
        thicknessMode: "auto" | "fixed";
        minThickness: number;
        thicknessFactor: number;
        thickness: number;
        bounces: number;
        glow: boolean;
        shadowEnable: boolean;
        shadowSoftness: number;
        shadowThickness: number;
        enabled: boolean;
        maxIterations: number;
        denoise: boolean;
        denoiseThreshold: [number, number];
        ignoreOutline: boolean;
    }>>;
    hiZ: PD.Group<PD.Normalize<{
        enabled: boolean;
        maxFrameLag: number;
        minLevel: number;
    }>>;
    renderer: PD.Group<PD.Normalize<{
        backgroundColor: import("../mol-util/color").Color;
        pickingAlphaThreshold: number;
        interiorDarkening: number;
        interiorColorFlag: boolean;
        interiorColor: import("../mol-util/color").Color;
        colorMarker: boolean;
        highlightColor: import("../mol-util/color").Color;
        selectColor: import("../mol-util/color").Color;
        dimColor: import("../mol-util/color").Color;
        highlightStrength: number;
        selectStrength: number;
        dimStrength: number;
        markerPriority: number;
        xrayEdgeFalloff: number;
        celSteps: number;
        exposure: number;
        light: PD.Normalize<{
            inclination: number;
            azimuth: number;
            color: import("../mol-util/color").Color;
            intensity: number;
        }>[];
        ambientColor: import("../mol-util/color").Color;
        ambientIntensity: number;
    }>>;
    trackball: PD.Group<PD.Normalize<{
        noScroll: boolean;
        rotateSpeed: number;
        zoomSpeed: number;
        panSpeed: number;
        moveSpeed: number;
        boostMoveFactor: number;
        flyMode: boolean;
        animate: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            speed: /*elided*/ any;
        }>, "spin"> | PD.NamedParams<PD.Normalize<{
            speed: /*elided*/ any;
            angle: /*elided*/ any;
        }>, "rock">;
        staticMoving: boolean;
        dynamicDampingFactor: number;
        minDistance: number;
        maxDistance: number;
        gestureScaleFactor: number;
        maxWheelDelta: number;
        bindings: {
            dragRotate: import("../mol-util/binding").Binding;
            dragRotateZ: import("../mol-util/binding").Binding;
            dragPan: import("../mol-util/binding").Binding;
            dragZoom: import("../mol-util/binding").Binding;
            dragFocus: import("../mol-util/binding").Binding;
            dragFocusZoom: import("../mol-util/binding").Binding;
            scrollZoom: import("../mol-util/binding").Binding;
            scrollFocus: import("../mol-util/binding").Binding;
            scrollFocusZoom: import("../mol-util/binding").Binding;
            keyMoveForward: import("../mol-util/binding").Binding;
            keyMoveBack: import("../mol-util/binding").Binding;
            keyMoveLeft: import("../mol-util/binding").Binding;
            keyMoveRight: import("../mol-util/binding").Binding;
            keyMoveUp: import("../mol-util/binding").Binding;
            keyMoveDown: import("../mol-util/binding").Binding;
            keyRollLeft: import("../mol-util/binding").Binding;
            keyRollRight: import("../mol-util/binding").Binding;
            keyPitchUp: import("../mol-util/binding").Binding;
            keyPitchDown: import("../mol-util/binding").Binding;
            keyYawLeft: import("../mol-util/binding").Binding;
            keyYawRight: import("../mol-util/binding").Binding;
            boostMove: import("../mol-util/binding").Binding;
            enablePointerLock: import("../mol-util/binding").Binding;
        };
        autoAdjustMinMaxDistance: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            minDistanceFactor: /*elided*/ any;
            minDistancePadding: /*elided*/ any;
            maxDistanceFactor: /*elided*/ any;
            maxDistanceMin: /*elided*/ any;
        }>, "on">;
    }>>;
    interaction: PD.Group<PD.Normalize<{
        maxFps: number;
        preferAtomPixelPadding: number;
    }>>;
    debug: PD.Group<PD.Normalize<{
        sceneBoundingSpheres: boolean;
        visibleSceneBoundingSpheres: boolean;
        objectBoundingSpheres: boolean;
        instanceBoundingSpheres: boolean;
    }>>;
    handle: PD.Group<PD.Normalize<{
        handle: PD.NamedParams<PD.Normalize<unknown>, "off"> | PD.NamedParams<PD.Normalize<{
            alpha: /*elided*/ any;
            ignoreLight: /*elided*/ any;
            colorX: /*elided*/ any;
            colorY: /*elided*/ any;
            colorZ: /*elided*/ any;
            scale: /*elided*/ any;
            doubleSided: /*elided*/ any;
            flipSided: /*elided*/ any;
            flatShaded: /*elided*/ any;
            celShaded: /*elided*/ any;
            xrayShaded: /*elided*/ any;
            transparentBackfaces: /*elided*/ any;
            bumpFrequency: /*elided*/ any;
            bumpAmplitude: /*elided*/ any;
            quality: /*elided*/ any;
            material: /*elided*/ any;
            clip: /*elided*/ any;
            emissive: /*elided*/ any;
            density: /*elided*/ any;
            instanceGranularity: /*elided*/ any;
            lod: /*elided*/ any;
            cellSize: /*elided*/ any;
            batchSize: /*elided*/ any;
        }>, "on">;
    }>>;
}>;
export type Canvas3DProps = PD.Values<typeof Canvas3DParams>;
export type PartialCanvas3DProps = {
    [K in keyof Canvas3DProps]?: Canvas3DProps[K] extends {
        name: string;
        params: any;
    } ? Canvas3DProps[K] : Partial<Canvas3DProps[K]>;
};
export { Canvas3DContext };
/** Can be used to create multiple Canvas3D objects */
interface Canvas3DContext {
    readonly canvas?: HTMLCanvasElement;
    readonly webgl: WebGLContext;
    readonly input: InputObserver;
    readonly passes: Passes;
    readonly attribs: Readonly<Canvas3DContext.Attribs>;
    readonly props: Readonly<Canvas3DContext.Props>;
    readonly contextLost?: BehaviorSubject<now.Timestamp>;
    readonly contextRestored?: BehaviorSubject<now.Timestamp>;
    readonly assetManager: AssetManager;
    readonly changed?: BehaviorSubject<undefined>;
    readonly pixelScale: number;
    syncPixelScale(): void;
    setProps: (props?: Partial<Canvas3DContext.Props>) => void;
    dispose: (options?: Partial<{
        doNotForceWebGLContextLoss: boolean;
    }>) => void;
}
declare namespace Canvas3DContext {
    const DefaultAttribs: {
        powerPreference: WebGLContextAttributes["powerPreference"];
        failIfMajorPerformanceCaveat: boolean;
        /** true by default to avoid issues with Safari (Jan 2021) */
        antialias: boolean;
        /** true to support multiple Canvas3D objects with a single context */
        preserveDrawingBuffer: boolean;
        preferWebGl1: boolean;
        handleResize: () => void;
    };
    type Attribs = typeof DefaultAttribs;
    const Params: {
        resolutionMode: PD.Select<"auto" | "scaled" | "native">;
        pixelScale: PD.Numeric;
        pickScale: PD.Numeric;
        transparency: PD.Select<"blended" | "wboit" | "dpoit">;
    };
    const DefaultProps: PD.Values<{
        resolutionMode: PD.Select<"auto" | "scaled" | "native">;
        pixelScale: PD.Numeric;
        pickScale: PD.Numeric;
        transparency: PD.Select<"blended" | "wboit" | "dpoit">;
    }>;
    type Props = PD.Values<typeof Params>;
    function fromCanvas(canvas: HTMLCanvasElement, assetManager: AssetManager, attribs?: Partial<Attribs>, props?: Partial<Props>): Canvas3DContext;
}
export { Canvas3D };
interface Canvas3D {
    readonly webgl: WebGLContext;
    add(repr: Representation.Any): void;
    remove(repr: Representation.Any): void;
    /**
     * This function must be called if animate() is not set up so that add/remove actions take place.
     */
    commit(isSynchronous?: boolean): void;
    /**
     * Function for external "animation" control
     * Calls commit.
     */
    tick(t: now.Timestamp, options?: {
        isSynchronous?: boolean;
        manualDraw?: boolean;
        updateControls?: boolean;
    }): void;
    update(repr?: Representation.Any, keepBoundingSphere?: boolean): void;
    clear(): void;
    syncVisibility(): void;
    requestDraw(): void;
    /** Reset the timers, used by "animate" */
    resetTime(t: number): void;
    animate(): void;
    /**
     * Pause animation loop and optionally any rendering
     * @param noDraw pause any rendering (drawPaused = true)
     */
    pause(noDraw?: boolean): void;
    /** Sets drawPaused = false without starting the built in animation loop */
    resume(): void;
    identify(x: number, y: number): PickData | undefined;
    mark(loci: Representation.Loci, action: MarkerAction): void;
    getLoci(pickingId: PickingId | undefined): Representation.Loci;
    notifyDidDraw: boolean;
    readonly didDraw: BehaviorSubject<now.Timestamp>;
    readonly commited: BehaviorSubject<now.Timestamp>;
    readonly commitQueueSize: BehaviorSubject<number>;
    readonly reprCount: BehaviorSubject<number>;
    readonly resized: BehaviorSubject<any>;
    handleResize(): void;
    /** performs handleResize on the next animation frame */
    requestResize(): void;
    /** Focuses camera on scene's bounding sphere, centered and zoomed. */
    requestCameraReset(options?: {
        durationMs?: number;
        snapshot?: Camera.SnapshotProvider;
    }): void;
    readonly camera: Camera;
    readonly boundingSphere: Readonly<Sphere3D>;
    readonly boundingSphereVisible: Readonly<Sphere3D>;
    setProps(props: PartialCanvas3DProps | ((old: Canvas3DProps) => Partial<Canvas3DProps> | void), doNotRequestDraw?: boolean): void;
    getImagePass(props: Partial<ImageProps>): ImagePass;
    getRenderObjects(): GraphicsRenderObject[];
    /** Returns a copy of the current Canvas3D instance props */
    readonly props: Readonly<Canvas3DProps>;
    readonly input: InputObserver;
    readonly stats: RendererStats;
    readonly interaction: Canvas3dInteractionHelper['events'];
    dispose(): void;
}
declare namespace Canvas3D {
    interface HoverEvent {
        current: Representation.Loci;
        buttons: ButtonsType;
        button: ButtonsType.Flag;
        modifiers: ModifiersKeys;
        page?: Vec2;
        position?: Vec3;
    }
    interface DragEvent {
        current: Representation.Loci;
        buttons: ButtonsType;
        button: ButtonsType.Flag;
        modifiers: ModifiersKeys;
        pageStart: Vec2;
        pageEnd: Vec2;
    }
    interface ClickEvent {
        current: Representation.Loci;
        buttons: ButtonsType;
        button: ButtonsType.Flag;
        modifiers: ModifiersKeys;
        page?: Vec2;
        position?: Vec3;
    }
    function create(ctx: Canvas3DContext, props?: Partial<Canvas3DProps>): Canvas3D;
}
