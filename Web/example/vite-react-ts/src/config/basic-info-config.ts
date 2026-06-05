/*
 * Basic information configuration for TUIRoomKit React applications.
 */

import LibGenerateTestUserSig from './lib-generate-test-usersig-es.min';

/**
 * Tencent Cloud SDKAppId, which should be replaced with user's SDKAppId.
 * Enter Tencent Cloud TRTC Console (https://console.cloud.tencent.com/trtc) to create an
 * application, and you will see the SDKAppId.
 */
export const SDKAPPID = 0;

/**
 * Encryption key for calculating signature.
 *
 * Step1. Enter Tencent Cloud TRTC Console (https://console.cloud.tencent.com/rav),
 *        and create an application if you don't have one.
 * Step2. Click your application to find "Quick Start".
 * Step3. Click "View Secret Key" to see the encryption key, and copy it here.
 *
 * WARNING: This method is only applicable for debugging. Before official launch, migrate
 * the UserSig calculation logic to your backend server to avoid leaking the secret key.
 * Document: https://intl.cloud.tencent.com/document/product/647/35166#Server
 */
export const SDKSECRETKEY = '';

/**
 * Signature expiration time (seconds).
 * Default: 7 days.
 */
export const EXPIRETIME = 604800;

const generator = new LibGenerateTestUserSig(SDKAPPID, SDKSECRETKEY, EXPIRETIME);

export function genTestUserSig(userId: string): string {
  return generator.genTestUserSig(userId);
}
