// MolstarViewer.js
import React, { useEffect, useRef } from 'react';
import { PluginConfig } from './molstar-lib/node_modules/molstar/lib/mol-plugin/config';
import { createPluginUI } from './molstar-lib/node_modules/molstar/lib/mol-plugin-ui';
import { renderReact18 } from './molstar-lib/node_modules/molstar/lib/mol-plugin-ui/react18';
import './molstar-lib/node_modules/molstar/lib/mol-plugin-ui/skin/light.scss';

const MolstarViewer = ({ pdbId, viewType, height, width }) => {
  const containerRef = useRef(null);
  const pluginRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initMolstar = async () => {
      if (!containerRef.current || pluginRef.current) return;

      const plugin = await createPluginUI({
        target: containerRef.current,
        render: renderReact18
      });
      
      if (!mounted) {
        plugin.dispose();
        return;
      }

      pluginRef.current = plugin;

      plugin.config.set(PluginConfig.Viewer.ShowControls, false);
      plugin.config.set(PluginConfig.Viewer.ShowSequence, false);
      plugin.config.set(PluginConfig.Viewer.ShowLog, false);
      plugin.config.set(PluginConfig.Viewer.ShowLeftPanel, false);
      plugin.config.set(PluginConfig.Viewer.ShowExpand, false);
      plugin.config.set(PluginConfig.Viewer.ShowSelectionMode, false);
      plugin.config.set(PluginConfig.Viewer.ShowAnimation, false);

      try {
        // Default PDB ID if none provided
        const id = pdbId || '3PTB';
        
        // Fetch the structure from PDB
        const data = await plugin.builders.data.download(
          { url: `https://files.rcsb.org/download/${id}.pdb` },
          { state: { isGhost: true } }
        );
        
        // Parse the downloaded data
        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'pdb');
        
        // Set the visual representation based on viewType
        const preset = viewType === 'surface' ? 'molecular-surface' : 'default';
        await plugin.builders.structure.hierarchy.applyPreset(trajectory, preset);
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
      }
    };
  }, [pdbId, viewType]);

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



