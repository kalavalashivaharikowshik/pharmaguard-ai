let logoutHandler: (() => Promise<void>) | null = null;

let loggingOut = false;

export function registerLogoutHandler(
  handler: () => Promise<void>,
) {
  logoutHandler = handler;
}

export async function triggerLogout() {

  if (loggingOut) {
    return;
  }

  loggingOut = true;

  try {

    if (logoutHandler) {

      await logoutHandler();

    }

  } finally {

    loggingOut = false;

  }

}