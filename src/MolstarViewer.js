// MolstarViewer.js
import React, { useEffect, useRef } from 'react';
import { PluginConfig } from './molstar-lib/node_modules/molstar/lib/mol-plugin/config';
import { createPluginUI } from './molstar-lib/node_modules/molstar/lib/mol-plugin-ui';
import { renderReact18 } from './molstar-lib/node_modules/molstar/lib/mol-plugin-ui/react18';
import { DefaultPluginUISpec, PluginUISpec } from './molstar-lib/node_modules/molstar/lib/mol-plugin-ui/spec';
import './molstar-lib/node_modules/molstar/lib/mol-plugin-ui/skin/light.scss';

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
                controlsDisplay: 'landscape'
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
      
      if (!mounted) {
        plugin.dispose();
        return;
      }

      pluginRef.current = plugin;

      try {
        // Default PDB ID if none provided
        // const id = pdbId || '3PTB';
        
        // Fetch the structure from PDB
        const data = await plugin.builders.data.download(
          { url: pdbUrl },
          { state: { isGhost: true } }
        );
        
        // Parse the downloaded data
        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'pdb');
        
        // Set the visual representation based on viewType
        const preset = viewType === 'surface' ? 'molecular-surface' : 'default';
        const model = await plugin.builders.structure.hierarchy.applyPreset(trajectory, preset);

        structureRef.current = model.structure;
      } catch (error) {
        console.error('Error loading protein structure:', error);
      }
    };

    initMolstar();

    return () => {
      mounted = false;
      if (pluginRef.current) {
        pluginRef.current.dispose();
        pluginRef.current = null;
        // structureRef.current = null;
      }
    };
  }, [pdbId, viewType, enableVolumeStreaming]);



  useEffect(() => {    
    if(proteinData.selectedAtomRange != null){
      console.log("highlight atom range, from " + proteinData.selectedAtomRange[0]+ "to "+ proteinData.selectedAtomRange[1])
    }
    else if(proteinData.selectedAtom != null){
      console.log("highlight atoms:" + proteinData.selectedAtom)
    }
    
    const plugin = pluginRef.current;
    const structure = structureRef.current;

    // console.log(structure)
    // if (!plugin || !structure || highlightAtoms.length === 0) return;


  }, [proteinData]);




  return (
    <div
      ref={containerRef}
      style={{
        width: width || '100%',
        height: height || '300px',
        position: 'relative'
      }}
    />
  );
};

export default MolstarViewer;



