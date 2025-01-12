import { readJSONFile } from '../../utils'
import { walkJsonObjects } from '../../utils/walk-json-object'
import { scanForVitals, VitalVariant } from './scan-for-vitals'
import { Capital } from './types/capitals'
import { isRegionMetadataAsset } from './types/metadata'

function loadCrcFile(file: string) {
  const result = require(file)
  if (typeof result !== 'object') {
    throw new Error('invalid file')
  }
  return result as Record<number | string, string>
}

export interface ScanResult {
  vitals?: VitalVariant[]
  gatherables?: GatherableVariant[]
}

export interface GatherableVariant {
  gatherableID: string
  position: [number, number, number]
  lootTable: string
  mapID: string
}

export async function scanSlices({
  inputDir,
  file,
  crcVitalsFile,
  crcVitalsCategoriesFile,
  crcGatherablesFile,
}: {
  inputDir: string
  file: string
  crcVitalsFile: string
  crcVitalsCategoriesFile: string
  crcGatherablesFile: string
}): Promise<ScanResult> {
  if (file.endsWith('.dynamicslice.json')) {
    return {
      vitals: await scanForVitals(inputDir, null, file),
    }
  }
  if (file.endsWith('.capitals.json')) {
    const mapId = file.match(/coatlicue\/(.+)\/regions\//)[1]
    const data = await readJSONFile<Capital>(file)
    const result: VitalVariant[] = []
    for (const capital of data?.Capitals || []) {
      const vitals = await scanForVitals(inputDir, capital.sliceName).catch((err): VitalVariant[] => {
        console.error(err)
        return []
      })
      for (const vital of vitals || []) {
        result.push({
          ...vital,
          position: capital.worldPosition
            ? [capital.worldPosition.x, capital.worldPosition.y, capital.worldPosition.z]
            : null,
          mapID: mapId,
        })
      }
    }
    return {
      vitals: result,
    }
  }
  if (file.endsWith('.metadata.json')) {
    const mapId = file.match(/coatlicue\/(.+)\/regions\//)[1]
    const result: VitalVariant[] = []
    const gatherables: GatherableVariant[] = []
    walkJsonObjects(await readJSONFile(file), (obj: unknown) => {
      if (!isRegionMetadataAsset(obj)) {
        return false
      }
      for (const location of obj.aispawnlocations || []) {
        const vitalId = loadCrcFile(crcVitalsFile)[location.vitalsid?.value]
        if (!vitalId) {
          continue
        }
        result.push({
          vitalsID: vitalId,
          categoryID: loadCrcFile(crcVitalsCategoriesFile)[location.vitalscategoryid?.value],
          level: location.vitalslevel,
          damageTable: null,
          position: location.worldposition,
          mapID: mapId,
          modelSlice: null,
        })
      }
      for (const location of obj.gatherablelocations || []) {
        const gatherableId = loadCrcFile(crcGatherablesFile)[location.gatherableid?.value]
        if (!gatherableId) {
          continue
        }
        gatherables.push({
          gatherableID: gatherableId,
          position: location.worldposition as [number, number, number],
          lootTable: location.loottableid,
          mapID: mapId,
        })
      }
    })
    return {
      vitals: result,
      gatherables: gatherables,
    }
  }
}
