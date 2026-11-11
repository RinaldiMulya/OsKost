import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";
import logger from "@/lib/logger";

const log = logger.child({ module: "firebase-admin" });

let fcmApp: App | null = null;

function getFirebaseAdminApp(): App | null {
  if (fcmApp) return fcmApp;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    fcmApp = existingApps[0]!;
    return fcmApp;
  }

  try {
    // 1. Cek environment variable berisi string JSON
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      fcmApp = initializeApp({
        credential: cert(serviceAccount),
      });
      log.info("Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT_KEY env");
      return fcmApp;
    }

    // 2. Cek file json service account di direktori project
    const defaultPaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      path.join(process.cwd(), "firebase-service-account.json"),
      path.join(process.cwd(), "oskost", "firebase-service-account.json"),
    ].filter(Boolean) as string[];

    for (const filePath of defaultPaths) {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const serviceAccount = JSON.parse(fileContent);
        fcmApp = initializeApp({
          credential: cert(serviceAccount),
        });
        log.info({ path: filePath }, "Firebase Admin initialized via service account file");
        return fcmApp;
      }
    }

    log.warn(
      "Firebase Admin credentials not found. Place firebase-service-account.json in oskost/ or set FIREBASE_SERVICE_ACCOUNT_KEY."
    );
    return null;
  } catch (error) {
    log.error({ err: error }, "Failed to initialize Firebase Admin");
    return null;
  }
}

export interface SendPushNotificationOptions {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Mengirim push notification ke daftar FCM tokens (Android/iOS)
 */
export async function sendFCMNotification(options: SendPushNotificationOptions): Promise<{
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}> {
  const { tokens, title, body, data = {} } = options;

  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  const app = getFirebaseAdminApp();
  if (!app) {
    log.warn("Skipping FCM send: Firebase Admin not initialized");
    return { successCount: 0, failureCount: tokens.length, invalidTokens: [] };
  }

  const messaging = getMessaging(app);
  const invalidTokens: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  // Firebase multicasting mendukung hingga 500 token per batch
  const batchSize = 500;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batchTokens = tokens.slice(i, i + batchSize);

    try {
      const response = await messaging.sendEachForMulticast({
        tokens: batchTokens,
        notification: {
          title,
          body,
        },
        android: {
          priority: "high",
          notification: {
            channelId: "oskost_high_importance",
            sound: "default",
            priority: "high",
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        data: {
          ...data,
          title,
          body,
        },
      });

      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === "messaging/invalid-registration-token" ||
            errCode === "messaging/registration-token-not-registered"
          ) {
            invalidTokens.push(batchTokens[idx]);
          }
          log.warn({ error: resp.error?.message, token: batchTokens[idx] }, "FCM delivery failed for token");
        }
      });
    } catch (batchErr) {
      log.error({ err: batchErr }, "FCM multicast batch failed");
      failureCount += batchTokens.length;
    }
  }

  return { successCount, failureCount, invalidTokens };
}
