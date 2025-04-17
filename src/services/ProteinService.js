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



/**
 * alignProteins
 * 调用后端 `/align`，拿到两个 PDB 文本（已对齐）
 */
export interface AlignResult {
  aligned1: string;
  aligned2: string;
}
export async function alignProteins(
  pdb1Id: string,
  pdb2Id: string,
  db: string = 'rcsb'
): Promise<AlignResult> {
  const url = `${BACKEND_BASE_URL}/align?` +
    `pdb1_id=${encodeURIComponent(pdb1Id)}` +
    `&pdb2_id=${encodeURIComponent(pdb2Id)}` +
    `&db=${encodeURIComponent(db)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Align failed with status ${response.status}`);
  }
  // { aligned1: "...", aligned2: "..." }
  return response.json();
}

/**
 * getAlignedPdbBlobURLs
 * 将对齐后的 PDB 文本打包成两个 Blob URL
 */
export async function getAlignedPdbBlobURLs(
  pdb1Id: string,
  pdb2Id: string,
  db: string = 'rcsb'
): Promise<[string, string]> {
  const { aligned1, aligned2 } = await alignProteins(pdb1Id, pdb2Id, db);

  const blob1 = new Blob([aligned1], { type: 'text/plain' });
  const blob2 = new Blob([aligned2], { type: 'text/plain' });

  return [
    URL.createObjectURL(blob1),
    URL.createObjectURL(blob2),
  ];
}