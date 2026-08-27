// studentos-mobile/src/services/api.ts
const DESKTOP_SERVER_URL = 'http://192.168.10.180:4000'; 

export const fetchSyncedDataFromDesktop = async () => {
  try {
    const response = await fetch(`${DESKTOP_SERVER_URL}/api/sync`);

    if (!response.ok) {
      return { success: false, error: `HTTP Error: ${response.status}` };
    }

    const data = await response.json();

    return {
      success: true,
      notes: data.notes || [],
      tasks: data.tasks || [],
      timetable: data.timetable || []
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Network Fetch Failed' };
  }
};