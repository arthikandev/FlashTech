import { bootDemoSite, setupHashRouter } from "../shared/boot";

bootDemoSite("seylan-demo");

setupHashRouter();

// Default to pricing for Sarangan E2E demo
if (!window.location.hash) {
  window.location.hash = "#/pricing";
}
