// MolstarViewer.js
import React, { useEffect, useRef } from 'react';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { DefaultPluginUISpec, PluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';

import './molstar-style/light.scss'

import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { Color }          from 'molstar/lib/mol-util/color';

import { MolScriptBuilder as MS, MolScriptBuilder } from 'molstar/lib/mol-script/language/builder';
import { Script } from 'molstar/lib/mol-script/script';
import { StructureSelection } from 'molstar/lib/mol-model/structure/query';



// import { Expression } from 'molstar/lib/mol-script/language/expression';
// import {  StructureSelectionQuery } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query'

// import { atoms } from 'molstar/lib/mol-model/structure/query/queries/generators';
// import { QueryContext } from 'molstar/lib/mol-model/structure/query/context';
// import { Structure, StructureProperties, StructureElement } from 'molstar/lib/mol-model/structure';

// import { compileIdListSelection } from 'molstar/lib/mol-script/util/id-list';
// import { SetUtils } from 'molstar/lib/mol-util/set';
// import { ProteinBackboneAtoms } from 'molstar/lib/mol-model/structure/model/types';


const MolstarViewer = ({ 
  pdbUrl, 
  pdbId, 
  proteinData,
  viewType, 
  height, 
  width, 
  enableVolumeStreaming = false}) => {
  const containerRef = useRef(null);
  const pluginRef = useRef(null);
  const structureRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initMolstar = async () => {
      if (!containerRef.current || pluginRef.current) return;

      const MySpec: PluginUISpec = {
        ...DefaultPluginUISpec(),
        layout: {
            initial: {
                isExpanded: false,
                showControls: true,         // Keep controls on so that the sequence bar is rendered.
                regionState: {
                    left: 'collapsed',      // Collapse the left panel.
                    top: 'collapsed',            // Show the top region (sequence bar).
                    right: 'hidden',        // Hide the right control bar.
                    bottom: 'hidden'        // Hide the bottom region.
                },
                controlsDisplay: 'landscape',
                
            }
        },
        
        config: [
            [PluginConfig.VolumeStreaming.Enabled, false]
        ]
    };
    

      const plugin = await createPluginUI({
        target: containerRef.current,
        spec: MySpec,
        render: renderReact18
      });

      PluginCommands.Canvas3D.SetSettings(plugin, {
        settings: {
          renderer: {
           ...(plugin.canvas3d?.props.renderer ?? {}),
           backgroundColor: Color(0xffffff) 
          }
        }
      });
      
      if (!mounted) {
        plugin.dispose();
        return;
      }

      pluginRef.current = plugin;

      try {        
        // Fetch the structure from PDB
        const data = await plugin.builders.data.download(
          { url: pdbUrl },
          { state: { isGhost: true } }
        );
        
        // Parse the downloaded data
        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'pdb');
        
        // Set the visual representation based on viewType
        const preset = viewType === 'surface' ? 'molecular-surface' : 'default';
        await plugin.builders.structure.hierarchy.applyPreset(trajectory, preset);

        structureRef.current = plugin;
      } catch (error) {
        console.error('Error loading protein structure:', error);
      }
    };

    initMolstar();

    return () => {
      mounted = false;
      // if (pluginRef.current) {
      //   pluginRef.current.dispose();
      //   pluginRef.current = null;
      //   structureRef.current = null;
      // }
    };
  }, [pdbId, viewType, enableVolumeStreaming]);


  // handle protein actions
  useEffect(() => {    
    const plugin = pluginRef.current;
    const structure = structureRef.current;
    console.log(structure)
    if (!plugin || !structure) return;


    if(proteinData.selectedAtomRange != null){
      console.log("highlight atom range, from " + proteinData.selectedAtomRange[0]+ "to "+ proteinData.selectedAtomRange[1])
    }
    else if(proteinData.selectedAtom != null){
      console.log("highlight atoms:" + proteinData.selectedAtom)

      
      // Examples:
      // https://github.com/molstar/molstar/blob/master/src/mol-script/script/mol-script/examples.ts
      // https://github.com/molstar/molstar/blob/6edbae80db340134341631f669eec86543a0f1a8/src/mol-plugin-state/helpers/structure-selection-query.ts#L88-L580

      // some examples for future refer
      // const Q = MolScriptBuilder;
      // const selection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
      //     'chain-test': Q.core.rel.eq(
      //       [Q.struct.atomProperty.macromolecular.entityKey(), 1]
      //     ),
      // }), data);

      // const selection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
      //   'atom-test': MS.core.set.has([MS.set('OD', 'NZ'), MS.ammp('label_atom_id')])
      // }), data);

      // const selection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
      //   'atom-test': MS.core.rel.eq([MS.ammp('id'), proteinData.selectedAtom[0]]),
      // }), data);

      const data = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
      if (!data) return;

      const selection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
        'atom-test': MS.core.set.has([MS.set(proteinData.selectedAtom[0], proteinData.selectedAtom[1]), MS.ammp('id')]),
      }), data);

      const loci = StructureSelection.toLociWithSourceUnits(selection);   
      
      plugin.managers.interactivity.lociSelects.deselectAll();
      plugin.managers.interactivity.lociSelects.select({ loci: loci });
      // plugin.managers.interactivity.lociHighlights.highlightOnly({ loci }); 
    }
    else if (proteinData.selectedResidues != null) {
      console.log("highlight residues:" + proteinData.selectedResidues[0])
      const data = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
      if (!data) return;

      const selection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
        'residue-test': Q.core.rel.eq([Q.ammp('auth_seq_id'), proteinData.selectedResidues[0]])
      }), data);

      const loci = StructureSelection.toLociWithSourceUnits(selection);   
      
      plugin.managers.interactivity.lociSelects.deselectAll();
      plugin.managers.interactivity.lociSelects.select({ loci: loci });
    }
    else if (proteinData.queryCode != null) {
      console.log("Running user-defined MolQL query...");
    
      const data = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
      if (!data) return;
    
      try {
        const wrappedCode = `
          const expression = (${proteinData.queryCode});
          return Script.getStructureSelection(Q => expression, data);
        `;
    
        const fn = new Function('plugin', 'data', 'Script', 'MS', 'Q', 'StructureSelection', wrappedCode);
    
        const selection = fn(plugin, data, Script, MS, MS, StructureSelection);
    
        // if (!StructureSelection.is(selection)) {
        //   console.warn('Returned value is not a StructureSelection object.');
        //   return;
        // }
    
        const loci = StructureSelection.toLociWithSourceUnits(selection);
    
        plugin.managers.interactivity.lociSelects.deselectAll();
        plugin.managers.interactivity.lociSelects.selectOnly({ loci });
    
      } catch (e) {
        console.error('Error executing queryCode:', e);
      }
    }
  }, [proteinData]);




  return (
    <div
      ref={containerRef}
      className="molstar-container"  
      style={{
        width: width || '100%',
        height: height || '300px',
        position: 'relative'
      }}
    />
  );
};

export default MolstarViewer;



