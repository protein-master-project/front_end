// AnimationProps.js

class ProteinData {
    /**
     * @param {string} name
     * @param {string} description
     * @param {string} pdbUrl
     * @param {string} pdbId
     * @param {Array} selectedAtomRange - The selected atom range, [start_atom, end_atom]
     * @param {Array} selectedAtoms - The selected atom, [atom_01, atom_02, ...]
     * 
     * @param {string} queryLanguage
     * @param {string} queryCode
     * 
     * @param {string} secondPdbId
     * 
     * @param {Array} selectedResidues
     */

    constructor(
        name = '',
        description = '',
        url = '', 
        id = '', 
        selectedAtomRange = [], 
        selectedAtom = [],
        queryLanguage = 'MOLQL',
        queryCode = '',
        secondPdbId = '',
        selectedResidues = []) {
            this.name = name;
            this.description = description;
            this.pdbUrl = url;
            this.pdbId = id;
            this.selectedAtomRange = selectedAtomRange;
            this.selectedAtom = selectedAtom;
            this.secondPdbId = secondPdbId;
            this.selectedResidues = selectedResidues;
    }
  }
  
  export default ProteinData;
  
  