import { contextBridge } from 'electron';

// Expose minimal API to renderer if needed later
contextBridge.exposeInMainWorld('electron', {
  // Add methods here
});
