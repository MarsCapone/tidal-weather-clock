type Constants = {
  LOCATION_COORDS: [number, number]
  LOCATION_EASYTIDE_STATION_ID: string
  LOCATION_NAME: string
  MAX_PERMITTED_DAYS: number
  PATH_TITLES: Record<string, string>
  TITLE: string
  MAX_BLOB_STORAGE_DAYS: number
  LD_CLIENT_ID: string
}

const CONSTANTS: Constants = {
  LOCATION_COORDS: [52.9636, 0.7442] as [number, number],
  LOCATION_EASYTIDE_STATION_ID: '0158',
  LOCATION_NAME: 'Burnham Overy Staithe',
  MAX_PERMITTED_DAYS: 10,
  PATH_TITLES: {
    '/settings': 'Settings',
    '/settings/activities': 'Activity Settings',
  },
  TITLE: 'Tidal Weather Clock',
  MAX_BLOB_STORAGE_DAYS: 28,
  LD_CLIENT_ID: '688e958f84052b0957d24bc7',
}

export default CONSTANTS
