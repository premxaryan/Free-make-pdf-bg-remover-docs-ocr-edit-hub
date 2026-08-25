import { removeBackground, preload, Config } from '@imgly/background-removal';

export interface WorkerMattingRequest {
  id: string;
  imageSource: string | Blob;
  modelType?: 'isnet_quint8' | 'isnet_fp16' | 'isnet';
}

export type WorkerMattingResponse =
  | { type: 'progress'; id: string; key: string; current: number; total: number; percent: number }
  | { type: 'success'; id: string; blob: Blob }
  | { type: 'error'; id: string; error: string };

// Preload model in worker background
const DEFAULT_PUBLIC_PATH = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/';
const FALLBACK_PUBLIC_PATH = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.7.0/dist/';

let isPreloading = false;
async function initPreload() {
  if (isPreloading) return;
  isPreloading = true;
  try {
    await preload({
      publicPath: DEFAULT_PUBLIC_PATH,
      model: 'isnet_quint8',
      debug: false,
    });
  } catch (e) {
    try {
      await preload({
        publicPath: FALLBACK_PUBLIC_PATH,
        model: 'isnet_quint8',
        debug: false,
      });
    } catch {
      // ignore
    }
  }
}

// Start preloading immediately in background worker thread
initPreload().catch(() => {});

self.onmessage = async (e: MessageEvent<WorkerMattingRequest>) => {
  const { id, imageSource, modelType = 'isnet_quint8' } = e.data;

  try {
    let lastProgressPct = 5;

    const runWithConfig = async (publicPath: string): Promise<Blob> => {
      const config: Config = {
        publicPath,
        model: modelType,
        debug: false,
        device: 'cpu',
        proxyToWorker: false, // already in worker
        output: {
          format: 'image/png',
          quality: 1.0,
        },
        progress: (key: string, current: number, total: number) => {
          let pct = 10;
          if (total > 0) {
            pct = Math.min(99, Math.max(5, Math.round((current / total) * 100)));
          }
          if (pct > lastProgressPct) {
            lastProgressPct = pct;
          }
          self.postMessage({
            type: 'progress',
            id,
            key,
            current,
            total,
            percent: lastProgressPct,
          } as WorkerMattingResponse);
        },
      };

      return await removeBackground(imageSource, config);
    };

    let resultBlob: Blob;
    try {
      resultBlob = await runWithConfig(DEFAULT_PUBLIC_PATH);
    } catch (primaryErr) {
      console.warn('Primary CDN failed in worker, retrying with jsdelivr fallback:', primaryErr);
      resultBlob = await runWithConfig(FALLBACK_PUBLIC_PATH);
    }

    self.postMessage({
      type: 'success',
      id,
      blob: resultBlob,
    } as WorkerMattingResponse);
  } catch (err: any) {
    self.postMessage({
      type: 'error',
      id,
      error: err?.message || String(err),
    } as WorkerMattingResponse);
  }
};
