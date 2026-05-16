import { initPresenceIQAvatar } from "../src/index";

const container = document.getElementById("presenceiq-avatar");
if (!container) {
  throw new Error("Missing #presenceiq-avatar container");
}

initPresenceIQAvatar({ container });
