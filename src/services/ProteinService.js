const BACKEND_BASE_URL = 'http://127.0.0.1:8080';
const DEFAULT_PDB_URL = 'https://files.rcsb.org/download/3PTB.pdb';
const DEFAULT_SEARCH_RESULTS = ['3PTB'];

export async function fetchPdbContent(pdbId: string, db: string = 'rcsb'): Promise<string> {
  const url = `${BACKEND_BASE_URL}/raw?pdb_id=${pdbId}&db=${db}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.warn(`Backend not available or fetch failed, falling back to default PDB.`, error);
    return fetchDefaultPdb();
  }
}

async function fetchDefaultPdb(): Promise<string> {
  const response = await fetch(DEFAULT_PDB_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch default PDB: ${response.status}`);
  }
  return await response.text();
}

export async function searchProteins(keyword: string, db: string = 'rcsb'): Promise<string[]> {
  const url = `${BACKEND_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}&db=${db}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Search failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.results ?? [];
  } catch (error) {
    console.warn(`Search failed or backend unavailable, falling back to default list.`, error);
    return DEFAULT_SEARCH_RESULTS;
  }
}

// a proxy of backend
export async function getPdbBlobURL(pdbId: string, db: string = 'rcsb'): Promise<string[]> {
  try {
    const pdbText = await fetchPdbContent(pdbId, db);
    // console.log(pdbText)
    const blob = new Blob([pdbText], { type: 'text/plain' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to get PDB Blob URL:', error);
    return '';
  }
}
